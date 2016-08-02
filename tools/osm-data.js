'use strict'

const fs = require('fs')
const path = require('path')

const addIso = require('./add-iso.js')
const overpass = require('./overpass.js')
const utils = require('./lib/utils.js')

/**
 * Fetch OSM data and prepare it for use in the IFC Market Opportunities tool
 *
 * @param {Object} options An object with the configuration options for the query
 * @param {string} options.query The Overpass QL query
 * @param {string} options.filename The name of the file to store the processed GeoJSON data in. Relative to the path of the file that calls this function
 * @param {Array} [options.filterTags] An array of OSM tags used to filter the properties object of each feature. If an empty array is specified, the properties object will be returned empty. If undefined, the properties are not filtered and left untouched.
 * @param {string} dir The absolute path to the file that calls this function
 *
 * Example options object:
 * {
 *   'query':
 *     `(node[amenity=hospital](6,0,8,2);
 *       node[amenity=doctors](6,0,8,2);>;);out body;`,
 *   'filename': 'data/test.geojson',
 *   'osmTags': ['amenity', 'name']
 * }
 */

module.exports = function (options, dir) {
  overpass.query(options.query)
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
    .catch(function (err) {
      console.log(err)
    })
    .then(function (data) {
      // TODO. No need to write to file, could stream directly to add-iso
      fs.writeFile(path.join(dir, './data/tmp.geojson'), JSON.stringify(data))
    })
    .catch(function (err) {
      console.log(err)
    })
    .then(function () {
      // Add an ISO code to each feature. Discard those that are outside the
      // target countries
      addIso(path.join(dir, './data/tmp.geojson'), path.join(dir, options.filename))
    })
}
