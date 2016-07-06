'use strict'

const rbush = require('rbush')
const turf = require('turf')

// Generate a spatial index for a set of countries
module.exports = function (countries) {
  let a = []
  for (var c in countries.features) {
    var bbox = turf.bbox(countries.features[c])
    a.push({
      minX: bbox[0],
      minY: bbox[1],
      maxX: bbox[2],
      maxY: bbox[3],
      id: countries.features[c].properties.ISO_A3
    })
  }
  let countryIndex = rbush()
  return countryIndex.load(a)
}
