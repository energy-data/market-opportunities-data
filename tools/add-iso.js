'use strict'

// Takes geojson data and checks which country it is in.
// If a feature spans multiple countries, it will be split into multiple
// features.
//
// This can be a module, or run from the command line as a standalone script.
// Usage as script:
//    $ node tools/add-iso.js /home/user/population/data.geojson

const fs = require('fs')
const geojsonStream = require('geojson-stream')
const path = require('path')
const through2 = require('through2')
const prettyMs = require('pretty-ms')
const intersect = require('./lib/intersect.js')
const spatialIndex = require('./lib/spatial-index.js')
const countries = require('../lib/boundaries/ne_10m_admin0_ssa.json')

const addIso = function (srcData, destPath) {
  // Some simple counters to keep track of progress
  var featsProcessed = 0
  var featsCreated = 0
  var start = Date.now()

  var writePath = destPath || './export.json'

  // Generate a spatial index of the countries' bbox with rbush
  var countryIndex = spatialIndex(countries)

  var read = fs.createReadStream(srcData)
  var parse = geojsonStream.parse()
  var transform = through2({ objectMode: true }, function (feature, enc, callback) {
    // Check if the feature intersects with the bbox of any of the countries
    var matchingIso = intersect.check(feature, countryIndex)

    if (matchingIso.length > 0) {
      var feats = intersect.generate(feature, countries, matchingIso)
      for (var i in feats) {
        this.push(feats[i])
        featsCreated++
      }
    }
    if (featsProcessed % 1000 === 0) {
      console.log(`${featsProcessed} features processed, ${featsCreated} are within the desired bbox`)
    }
    featsProcessed++
    callback()
  })
  var stringify = geojsonStream.stringify()
  var write = fs.createWriteStream(writePath)

  console.log('Adding the ISO codes to each feature.')
  read.pipe(parse)
    .pipe(transform)
    .pipe(stringify)
    .pipe(write)
    .on('finish', () => {
      console.log('Adding the ISO codes finished in: ', prettyMs(Date.now() - start))
    })
}

if (!module.parent) {
  // When used as script, the first parameter needs to be the relative path to the file with source data
  if (process.argv[2]) {
    addIso(path.join(process.cwd(), process.argv[2]))
  } else {
    console.error('This script expects a GeoJSON with source data.\nEg. $node tools/add-iso.js population/data.geojson')
    process.exit(1)
  }
} else {
  module.exports = addIso
}
