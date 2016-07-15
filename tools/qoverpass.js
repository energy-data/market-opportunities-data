'use strict'

// Queries Overpass and returns the data in geoJSON format
const rp = require('request-promise')
const osmGeojson = require('osmtogeojson')

module.exports = function (query) {
  let url = `http://overpass-api.de/api/interpreter?data=[out:json];${query}`
  return rp(url)
    .catch(function (err) {
      return (err)
    })
    .then(function (osmJSON) {
      return osmGeojson(JSON.parse(osmJSON))
    })
}
