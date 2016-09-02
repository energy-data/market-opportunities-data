'use strict'

const _ = require('lodash')
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
 * Returns a bbox in overpass format
 *
 * @param {Array} [iso] An array with ISO codes to determine the bbox for. If undefined, the bbox for the all the features will be returned.
 *
 * @return {String} A string with the bbox (S,W,N,E)
*/

const countries = require('../lib/boundaries/ne_10m_admin0_ssa.json')
module.exports.bbox = function (iso) {
  let bbox

  // Fetch the bbox of interest. Turf returns: [w,s,e,n]
  if (iso) {
    iso = _.isArray(iso) ? iso : [iso]
    let filterCountries = countries.features.filter(
      ft => _.includes(iso, ft.properties.ISO_A3.toLowerCase())
    )

    if (filterCountries.length !== iso.length) {
      throw new Error(`At least one ISO code not found: ${iso.join(', ')}`)
    }

    bbox = turf.bbox(turf.featureCollection(filterCountries))
  } else {
    bbox = turf.bbox(countries)
  }

  // Return bbox as a string. Overpass QL expects: (s,w,n,e)
  return `${bbox[1]},${bbox[0]},${bbox[3]},${bbox[2]}`
}
