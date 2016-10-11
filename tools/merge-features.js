'use strict'

const _ = require('lodash')
const log = require('single-line-log').stdout
const turf = require('turf')

/**
 * Merge features in a featureCollection
 *
 * @param {FeatureCollection} fc A GeoJSON featureCollection
 *
 * @return {Feature} A feature with the merged geometries
 */

module.exports = function (fc) {
  let totalFeats = fc.features.length
  var f = _.reduce(fc.features, (a, b, i) => {
    log(`Merged: ${i + 1} of ${totalFeats}`)
    try {
      return turf.union(a, b)
    } catch (e) {
      // continue if the polygons can't be merged
      console.log('Error trying to join feature.')
      return a
    }
  })
  log.clear()
  return f
}
