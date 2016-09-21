'use strict'

const _ = require('lodash')
const turf = require('turf')

/**
 * Filter the properties of a set of GeoJSON features
 *
 * @param {Object} data GeoJSON data
 * @param {Array} filterTags An array of OSM tags to filter the properties object by. Can be empty
 */
module.exports.filterProps = function (data, filterTags) {
  data.features = _.map(data.features, o => {
    o.properties = _.pick(o.properties, filterTags)
    return o
  })
  return data
}

/**
 * Convert all polygons and lines in a GeoJSON to their centroid
 *
 * @param {Object} data GeoJSON data
 */
module.exports.convertToPoints = function (data) {
  data.features = _.map(data.features, o => {
    if (o.geometry.type !== 'Point') {
      let c = turf.centroid(o)
      o.geometry = c.geometry
    }
    return o
  })
  return data
}
