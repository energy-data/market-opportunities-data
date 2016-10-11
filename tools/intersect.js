'use strict'

const turf = require('turf')

/**
 * Checks if a feature intersects with items in a rbush tree
 *
 * @param {Object} feature A GeoJSON feature
 * @param {Object} countryIndex A rbush tree
 *
 * @return {Array} An array of matching ISO codes, or empty if no match
 */

module.exports.check = function (feature, countryIndex) {
  let fBbox = turf.bbox(feature)
  let match = countryIndex.search({
    minX: fBbox[0],
    minY: fBbox[1],
    maxX: fBbox[2],
    maxY: fBbox[3]
  })
  return match.map(function (m) { return m.id })
}

/**
 * Intersect a GeoJSON feature with a set of polygons
 *
 * @param {Object} feature A GeoJSON feature
 * @param {Object} countries A GeoJSON object with polygons
 * @param {Array} matchingIso An array with ISO codes that determines which
 * polygons the feature will be intersected with
 *
 * @return {Array} An array of intersected features, each retaining the props
 * from the original feature, plus the country's ISO code
 */

module.exports.generate = function (feature, countries, matchingIso) {
  let newFeats = []

  for (let i in matchingIso) {
    // Get the geojson feature for the matching country
    let country = countries.features.filter(function (c) {
      return c.properties.ISO_A3.toLowerCase() === matchingIso[i].toLowerCase()
    })[0]

    try {
      var intersection = turf.intersect(country, feature)
    } catch (e) {
      console.error(e)
      console.error(feature.properties)
      console.error(' ')
      continue
    }

    if (intersection) {
      // The new object has all props from original feature
      intersection.properties = Object.assign({}, feature.properties)

      // The new object also gets the country's ISO code
      intersection.properties.iso = matchingIso[i].toLowerCase()

      newFeats.push(intersection)
    }
  }
  return newFeats
}
