'use strict'
// Check if a feature intersects with polygons in a geojson.
// For each intersection, it creates a new feature and returns
// them in an array

var assert = require('assert')
var turf = require('turf')

module.exports = function (feature, countries) {
  var newFeats = []

  for (var i in countries.features) {
    var c = countries.features[i]
    var intersection = turf.intersect(c, feature)

    if (intersection) {
      // The new object has all props from original feature
      intersection.properties = Object.assign({}, feature.properties)

      // The new object also gets the country's ISO code
      intersection.properties.id = c.properties.ISO_A3

      newFeats.push(intersection)

      // If the geometry of the intersection is the same as the geometry of the
      // original feature, then break the for loop
      try {
        assert.deepEqual(intersection.geometry.coordinates, feature.geometry.coordinates)
        break
      } catch (e) {
        continue
      }
    }
  }
  return newFeats
}
