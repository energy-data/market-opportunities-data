'use strict'

const fs = require('fs')
const rp = require('request-promise')
const turf = require('turf')

/**
 * Queries Overpass and returns the data in GeoJSON format
 *
 * @param {string} query The Overpass QL query
 */

const url = 'http://www.resourceprojects.org/api/projects'

console.log('Fetching data from Resource Projects...')
rp(url)
  .catch(function (err) {
    return (err)
  })
  .then(function (body) {
    return JSON.parse(body)
  })
  .catch(function (err) {
    return (err)
  })
  .then(function (body) {
    let data = body.data.filter(function (o) { return (o.proj_coordinates.length > 0) })

    return data.map(function (o) {
      return {
        'geometry': {
          'type': 'Point',
          'coordinates': [
            o.coordinates[0].lng,
            o.coordinates[0].lat
          ]
        },
        'properties': {
          'name': o.proj_name,
          'id': o.proj_id
        }
      }
    })
  })
  .then(function (data) {
    let geoJSON = turf.featureCollection(data)
    fs.writeFileSync('./mining.geojson', JSON.stringify(geoJSON))
  })
