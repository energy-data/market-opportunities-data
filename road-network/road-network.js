'use strict'

// Generate a buffered road network from OSM for a particular country
// Usage:
//    $node road-network.js --iso nga --col 4 --row 2
// or
//    $node road-network.js --test

const _ = require('lodash')
const argv = require('minimist')(process.argv.slice(2))
const fs = require('fs')
const path = require('path')
const turf = require('turf')

const addIso = require('../tools/add-iso.js')
const filterRings = require('../tools/filter-inner-rings.js')
const mergeFeatures = require('../tools/merge-features.js')
const osmData = require('../tools/osm-data.js')
const overpass = require('../tools/overpass.js')
const utils = require('../tools/utils.js')

const options = {
  'bufferDistances': [1, 2, 5],
  'country': argv.iso,
  'filename': `data/road-network-${argv.iso}.geojson`,
  'filterTypes': ['LineString', 'MultiLineString']
}

const grid = new Promise(function (resolve, reject) {
  if (argv.test) {
    resolve(utils.generateGrid([11, 2, 12, 2.5], 2, 2))
  } else {
    resolve(utils.generateGrid(utils.bbox(options.country), argv.col, argv.row))
  }
})
var startTime

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
    startTime = Date.now()
    console.log('\nSimplifying the lines...')
    return _.map(data, fc => turf.simplify(fc, 0.01, false))
  })
  .then(function (data) {
    console.log(`done in ${Date.now() - startTime}ms`)
    console.log('\nBuffering data...')

    return Promise.resolve(grid)
      .then(function (grid) {
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
        let buffedData = toBuffer.map(i => {
          let b = turf.featureCollection(data[i[0]].features.map(f =>
            turf.intersect(grid.features[i[0]], turf.buffer(f, i[1], 'kilometers')
          )))
          b.buffer = i[1]
          return b
        })
        return buffedData
      })
  })
  .catch(function (err) {
    console.log(err)
  })
  .then(function (buffData) {
    console.log(`done in ${Date.now() - startTime}ms`)

    // return an array of featureCollections with merged data
    console.log('\nMerging all features in a cell with same buffer distance. This may take a long time')
    return _.map(buffData, (fc, i) => {
      let cellNumber = Math.floor(i / options.bufferDistances.length) + 1

      // check if the featureCollection has features to begin with
      try {
        fc.features.length
      } catch (e) {
        if (e instanceof TypeError) {
          console.log(`\nCell ${cellNumber} doesn't contain any features. Skipping...`)
        }
        return fc
      }

      // merge each featureCollection
      console.log(`\nMerging cell ${cellNumber} with a ${fc.buffer}km. buffer...`)

      let mergedFeature = mergeFeatures(fc)
      mergedFeature.properties.buffer = `${fc.buffer}km to road`
      return mergedFeature
    })
  })
  .catch(function (err) {
    console.log(err)
  })
  .then(function (mergedData) {
    console.log(`\ndone in ${Date.now() - startTime}ms`)
    let minArea = 1000000
    console.log(`\nFiltering out areas < ${minArea / 1000000}km2 to optimize performance`)
    // Remove the smaller inner rings (1km2) to decrease file size and optimize performance
    return _.map(mergedData, f => filterRings(f, minArea))
  })
  .catch(function (err) {
    console.log(err)
  })
  .then(function (mergedData) {
    console.log(`done in ${Date.now() - startTime}ms`)
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
