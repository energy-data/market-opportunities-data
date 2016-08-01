'use strict'

const rp = require('request-promise')
const osmGeojson = require('osmtogeojson')
const turf = require('turf')

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
 * Returns a bbox for SSA in overpass format
 */

module.exports.bboxSSA = function () {
  const countries = require('../lib/boundaries/ne_10m_admin0_ssa.json')

  // Fetch the bbox of interest. Turf returns: [w,s,e,n]
  let bbox = turf.bbox(countries)

  // Return bbox as a string. Overpass QL expects: (s,w,n,e)
  return `${bbox[1]},${bbox[0]},${bbox[3]},${bbox[2]}`
}
