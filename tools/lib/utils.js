'use strict'

const _ = require('lodash')

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
