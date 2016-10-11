'use strict'

const rp = require('request-promise-native')
const osmGeojson = require('osmtogeojson')
const promiseRetry = require('promise-retry')

/**
 * Queries Overpass and returns the data in GeoJSON format
 *
 * @param {string} query The Overpass QL query
 */

module.exports.query = function (query) {
  return promiseRetry(function (retry, number) {
    console.log(`Fetching data from Overpass... Attempt number: ${number}`)

    return rp(`http://overpass-api.de/api/interpreter?data=[out:json];${query}`)
      .catch(function (err) {
        // API calls to Overpass are rate limited. Retry if statusCode is 429
        if (err.statusCode === 429) {
          retry(err)
        }
        throw err.message
      })
      .then(function (osmJSON) {
        return osmGeojson(JSON.parse(osmJSON), { flatProperties: true })
      })
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
