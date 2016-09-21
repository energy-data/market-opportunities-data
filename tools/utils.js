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

/**
 * Generate a polygon grid of a specific amount of rows and columns from a bounding box
 *
 * @param {Array} bbox An Array of bounding box coordinates: [minX, minY, maxX, maxY]
 * @param {number} rows The number of rows of the resulting grid of polygons
 * @param {number} cols The number of columns of the resulting grid of polygons
 *
 * @return {Object} A GeoJSON FeatureCollection with a grid of polygons
 */
module.exports.generateGrid = function (bbox, rows, cols) {
  const cellHeight = (bbox[3] - bbox[1]) / rows
  const cellWidth = (bbox[2] - bbox[0]) / cols
  return turf.featureCollection(_.flatten(_.range(rows).map(a => {
    return _.range(cols).map(b => {
      return turf.bboxPolygon([
        bbox[0] + (cellHeight * a),
        bbox[1] + (cellWidth * b),
        bbox[0] + (cellHeight * (a + 1)),
        bbox[1] + (cellWidth * (b + 1))
      ])
    })
  })))
}
