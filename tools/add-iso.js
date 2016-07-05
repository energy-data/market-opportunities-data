'use strict'

// Takes a continental dataset in geojson and adds a property to each feature
// of the country it is in.
// If a feature spans multiple countries, it will be split into multiple
// features

const fs = require('fs')
const geojsonStream = require('geojson-stream')
const path = require('path')
const through2 = require('through2')
const generateIntersect = require('./lib/generate-intersect.js')

const countries = require('../lib/boundaries/ne_10m_admin0_ssa.json')

// var data = '../population-density/data/data.json'
const data = path.join(__dirname, '../population-density/data/data-sample.json')

var read = fs.createReadStream(data)
var parse = geojsonStream.parse()
var transform = through2({ objectMode: true }, function (feature, enc, callback) {
  //
  var feats = generateIntersect(feature, countries)
  for (var i in feats) {
    this.push(feats[i])
  }
  callback()
})
var stringify = geojsonStream.stringify()
var write = fs.createWriteStream('./export.json')

read.pipe(parse)
  .pipe(transform)
  .pipe(stringify)
  .pipe(write)
