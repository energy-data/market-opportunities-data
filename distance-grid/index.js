'use strict'

// Generate a buffered road network from OSM for a particular country
// Usage:
//    $node road-network.js --iso zmb

const _ = require('lodash')
const argv = require('minimist')(process.argv.slice(2))
const fs = require('fs')
const path = require('path')
const turf = require('turf')

const osmData = require('../tools/osm-data.js')
const mergeFeatures = require('../tools/merge-features.js')
const overpass = require('../tools/overpass.js')
const utils = require('../tools/utils.js')

const iso = argv.iso

// Fetch the bbox
const bbox = overpass.bbox(utils.bbox(iso))
const countryPolygon = utils.getCountryPolygon(iso)

let options = {
  'bufferDistances': [5, 15, 30],
  'country': iso,
  'query':
    `(way[power=minor_line](${bbox});
      way[power=line](${bbox});>;);out body;`,
  'filterTypes': ['LineString', 'MultiLineString'],
  'filterTags': [],
  'filename': `data/osm-power-${argv.iso}.geojson`
}

osmData(options)
  .then(function (data) {
    console.log('Buffering data...')

    // return an array with GeoJSON feature collections. Each of these
    // collections has data from a grid cell, buffered with a particular buffer
    // distance.
    let buffedData = _.map(options.bufferDistances, d => {
      let b = turf.buffer(data, d, 'kilometers')
      b.buffer = d
      return b
    })
    return buffedData
  })
  .catch(function (err) {
    console.log(err)
  })
  .then(function (buffData) {
    // return an array of features with merged data
    console.log('Starting the merge. This may take a very long time')
    return _.map(buffData, (fc, i) => {
      // check if the featureCollection has features to begin with
      try {
        fc.features.length
      } catch (e) {
        if (e instanceof TypeError) {
          console.log(`FeatureCollection ${i} doesn't contain any features. Skipping...`)
        }
        return fc
      }
      // merge each featureCollection
      console.log(`\nMerging features with a ${fc.buffer}km buffer...`)

      // since this is distance FROM grid, we are interested in a polygon of
      // all areas that are at least x km from the grid
      // let mergedFeature = mergeFeatures(fc)
      let finalFeature = mergeFeatures(fc)
      finalFeature.buffer = fc.buffer
      return finalFeature
    })
  })
  .catch(function (err) {
    console.log(err)
  })
  .then(function (mergedData) {
    console.log('\nGenerate difference between country and buffer polygon\n')
    return _.map(mergedData, f => {
      let ft = turf.difference(countryPolygon[0], f)
      ft.properties.buffer = `${f.buffer}km from grid`
      ft.properties.iso = iso
      return ft
    })
  })
  .catch(function (err) {
    console.log(err)
  })
  .then(function (mergedData) {
    // TMP writing merged data to file for addIso
    fs.writeFileSync(path.join(__dirname, options.filename), JSON.stringify(turf.featureCollection(mergedData)))
  })
