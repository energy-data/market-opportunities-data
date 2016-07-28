'use strict'

const fs = require('fs')
const _ = require('lodash')
const path = require('path')

const addIso = require('./add-iso.js')
const overpass = require('./overpass.js')

/**
 * Fetch OSM data and prepare it for use in the IFC Market Opportunities tool
 *
 * @param {Object} options An object with the configuration options for the query
 * @param {string} options.query The Overpass QL query
 * @param {string} options.fn The file to store the processed GeoJSON data in. Relative to the file that calls this function
 * @param {Array} [options.osmTags] An array of OSM tags to store in the properties object of each feature
 * @param {string} dir The absolute path to the file that calls this function
 *
 * Example options object:
 * {
 *   'query':
 *     `(node[amenity=hospital](6,0,8,2);
 *       node[amenity=doctors](6,0,8,2);>;);out body;`,
 *   'fn': 'data/test.geojson',
 *   'osmTags': ['amenity', 'name']
 * }
 */

module.exports = function (options, dir) {
  overpass.query(options.query)
    .then(function (data) {
      // Filter the properties object so it only retains the desired osmTags
      data.features = _.map(data.features, o => {
        o.properties = _.pick(o.properties, options.osmTags)
        return o
      })
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
      addIso(path.join(dir, './data/tmp.geojson'), path.join(dir, options.fn))
    })
}
