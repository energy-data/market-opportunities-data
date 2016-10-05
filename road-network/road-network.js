'use strict'

// Generate a buffered road network from OSM for a particular country
// Usage:
//    $node road-network.js --iso nga --col 4 --row 2
// or
//    $node road-network.js --test

const _ = require('lodash')
const argv = require('minimist')(process.argv.slice(2))
const fs = require('fs')
var log = require('single-line-log').stdout
const path = require('path')
const turf = require('turf')

const addIso = require('../tools/add-iso.js')
const osmData = require('../tools/osm-data.js')
const overpass = require('../tools/overpass.js')
const utils = require('../tools/utils.js')

const options = {
  'bufferDistances': [1, 2, 5],
  'country': argv.iso,
  'filename': `data/road-network-${argv.iso}.geojson`
}

const grid = new Promise(function (resolve, reject) {
  if (argv.test) {
    resolve(utils.generateGrid([11, 2, 12, 2.5], 2, 2))
  } else {
    resolve(utils.generateGrid(utils.bbox(options.country), argv.col, argv.row))
  }
})

// generate a grid for the country's bbox
grid
  .then(function (grid) {
    // download the data from Overpass serially (OP is rate limited)
    // the promise returns an array of results, one for each grid cell
    var current = Promise.resolve()

    return Promise.all(grid.features.map(function (f, i) {
      current = current.then(function () {
        // get a bbox for the feature in Overpass format
        return overpass.bbox(turf.bbox(f))
      })
      .then(function (bbox) {
        options.query = `(way["highway"~"motorway|primary|secondary|tertiary"](${bbox});>;);out body;`
        return osmData(options)
      })
      .catch(function (err) {
        console.log(err)
      })
      return current
    }))
  })
  .then(function (data) {
    console.log('Buffering data...')

    // create an array of 'tuples' with the index of the geoJSON array and the buffer distance
    // [ [0, 2], [0, 4], [1, 2], [1, 4], etc ]
    let toBuffer = _.flatten(_.range(data.length).map(i => {
      return _.map(options.bufferDistances, d => [i, d])
    }))

    // return an array with GeoJSON feature collections. Each of these
    // collections has data from a grid cell, buffered with a particular buffer
    // distance.
    // 2 grid cells and 3 buffer distances result in an array
    // 6 FC's
    let buffedData = _.map(toBuffer, i => {
      let b = turf.buffer(data[i[0]], i[1], 'kilometers')
      b.buffer = i[1]
      return b
    })
    return buffedData
  })
  .catch(function (err) {
    console.log(err)
  })
  .then(function (buffData) {
    // return an array of featureCollections with merged data
    console.log('Starting the merge. This may take a very long time')
    return _.map(buffData, (fc, i) => {
      let cellNumber = Math.floor(i / options.bufferDistances.length) + 1

      // check if the featureCollection has features to begin with
      try {
        var totalFeats = fc.features.length
      } catch (e) {
        if (e instanceof TypeError) {
          console.log(`Cell ${cellNumber} doesn't contain any features. Skipping...`)
        }
        return fc
      }

      // merge each featureCollection
      console.log(`Merging cell ${cellNumber} with a ${fc.buffer}km. buffer...`)
      let startMerge = Date.now()
      try {
        let u = _.reduce(fc.features, (a, b, index) => {
          log(`Merged: ${index + 1} of ${totalFeats}`)
          try {
            return turf.union(a, b)
          } catch (e) {
            // continue if the polygons can't be merged
            console.log('Error trying to join feature.')
            return a
          }
        })
        // add an indication of the buffer size
        try {
          u.properties.buffer = fc.buffer
        } catch (e) {
          console.log(e)
        }
        log.clear()
        console.log(`...done in ${Date.now() - startMerge}ms`)
        return u
      } catch (e) {
        console.log(e)
      }
    })
  })
  .catch(function (err) {
    console.log(err)
  })
  .then(function (mergedData) {
    // TMP writing merged data to file for addIso
    fs.writeFileSync(path.join(__dirname, 'data/tmp.geojson'), JSON.stringify(turf.featureCollection(mergedData)))
  })
  .then(function (data) {
    // addIso
    addIso(path.join(__dirname, 'data/tmp.geojson'), path.join(__dirname, options.filename))
  })
  .catch(function (err) {
    console.log(err)
  })
