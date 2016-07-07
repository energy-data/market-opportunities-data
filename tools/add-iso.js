'use strict'

// Takes a continental dataset in geojson and adds a property to each feature
// of the country it is in.
// If a feature spans multiple countries, it will be split into multiple
// features

const fs = require('fs')
const geojsonStream = require('geojson-stream')
const path = require('path')
const through2 = require('through2')
const prettyMs = require('pretty-ms')
const intersect = require('./lib/intersect.js')
const spatialIndex = require('./lib/spatial-index.js')

const countries = require('../lib/boundaries/ne_10m_admin0_ssa.json')

// var data = '../population-density/data/data.json'
const data = path.join(__dirname, '../population-density/data/data.geojson')

// Some simple counters to keep track of progress
var featsProcessed = 0
var featsCreated = 0
var start = Date.now()

// Generate a spatial index of the countries' bbox with rbush
var countryIndex = spatialIndex(countries)

var read = fs.createReadStream(data)
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
    console.log(`${featsProcessed} features processed (${featsCreated} new)`)
  }
  featsProcessed++
  callback()
})
var stringify = geojsonStream.stringify()
var write = fs.createWriteStream('./export.json')

console.log('Starting to process.')
read.pipe(parse)
  .pipe(transform)
  .pipe(stringify)
  .pipe(write)
  .on('finish', () => {
    console.log('Finished in: ', prettyMs(Date.now() - start))
  })
