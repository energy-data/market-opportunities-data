'use strict'

const overpass = require('./overpass.js')
const utils = require('./utils.js')

/**
 * Fetch OSM data and prepare it for use in the IFC Market Opportunities tool
 *
 * @param {Object} options An object with the configuration options for the query
 * @param {string} options.query The Overpass QL query
 * @param {string} options.filename The name of the file to store the processed GeoJSON data in. Relative to the path of the file that calls this function
 * @param {Array} [options.filterTags] An array of OSM tags used to filter the properties object of each feature. If an empty array is specified, the properties object will be returned empty. If undefined, the properties are not filtered and left untouched.
 * @param {Array} [options.filterTypes] An array of GeoJSON types to filter the features by. If undefined, the features are not filtered and left untouched.
 *
 * Example options object:
 * {
 *   'query':
 *     `(node[amenity=hospital](6,0,8,2);
 *       node[amenity=doctors](6,0,8,2);>;);out body;`,
 *   'filename': 'data/test.geojson',
 *   'filterTags': ['amenity', 'name']
 * }
 */

module.exports = function (options) {
  return overpass.query(options.query)
    .catch(function (err) {
      console.log(err)
      process.exit(1)
    })
    .then(function (data) {
      if (options.filterTags) {
        data = utils.filterProps(data, options.filterTags)
      }
      return data
    })
    .then(function (data) {
      if (options.filterTypes) {
        data = utils.filterByType(data, options.filterTypes)
      }
      return data
    })
    .then(function (data) {
      if (options.enforceType === 'point') {
        data = utils.convertToPoints(data)
      }
      return data
    })
    .catch(function (err) {
      console.log(err)
    })
}
