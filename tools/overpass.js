'use strict'

const _ = require('lodash')
const rp = require('request-promise')
const osmGeojson = require('osmtogeojson')
const turf = require('turf')
const utils = require('./utils.js')

/**
 * Queries Overpass and returns the data in GeoJSON format
 *
 * @param {string} query The Overpass QL query
 */

module.exports.query = function (query) {
  let url = `http://overpass-api.de/api/interpreter?data=[out:json];${query}`
  console.log('Fetching data from Overpass...')
  return rp(url)
    .catch(function (err) {
      return (err)
    })
    .then(function (osmJSON) {
      return osmGeojson(JSON.parse(osmJSON), { flatProperties: true })
    })
}

/**
 * Accepts an array with a bbox in [minX, minY, maxX, maxY] and returns an Overpass bbox
 *
 * @param {Array} An array with the bounding box [minX, minY, maxX, maxY]
 *
 * @return {String} A string with the bbox (S,W,N,E)
*/

module.exports.bbox = function (bbox) {
  return `${bbox[1]},${bbox[0]},${bbox[3]},${bbox[2]}`
}
