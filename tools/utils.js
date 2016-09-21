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
 * Returns a bbox for one or more countries
 *
 * @param {Array} [iso] An array with ISO codes to determine the bbox for. If undefined, the bbox for all the features will be returned.
 *
 * @return {Array} An array with the bounding box [minX, minY, maxX, maxY]
*/
const countries = require('../lib/boundaries/ne_10m_admin0_ssa.json')
module.exports.bbox = function (iso) {
  if (iso) {
    iso = _.isArray(iso) ? iso : [iso]
    let filterCountries = countries.features.filter(
      ft => _.includes(iso, ft.properties.ISO_A3.toLowerCase())
    )

    if (filterCountries.length !== iso.length) {
      throw new Error(`At least one ISO code not found: ${iso.join(', ')}`)
    }

    return turf.bbox(turf.featureCollection(filterCountries))
  } else {
    return turf.bbox(countries)
  }
}

/**
 * Generate a polygon grid of a specific amount of rows and columns from a bounding box
 *
 * @param {Array} bbox An Array of bounding box coordinates: [minX, minY, maxX, maxY]
 * @param {number} cols The number of columns of the resulting grid of polygons
 * @param {number} rows The number of rows of the resulting grid of polygons
 *
 * @return {Object} A GeoJSON FeatureCollection with a grid of polygons
 */
module.exports.generateGrid = function (bbox, cols, rows) {
  const cellWidth = (bbox[2] - bbox[0]) / cols
  const cellHeight = (bbox[3] - bbox[1]) / rows
  return turf.featureCollection(_.flatten(_.range(cols).map(c => {
    return _.range(rows).map(r => {
      return turf.bboxPolygon([
        bbox[0] + (cellWidth * c),
        bbox[1] + (cellHeight * r),
        bbox[0] + (cellWidth * (c + 1)),
        bbox[1] + (cellHeight * (r + 1))
      ])
    })
  })))
}
