'use strict'

// Takes a continental dataset in geojson and adds a property to each feature
// of the country it is in.
// If a feature spans multiple countries, it will be split into multiple
// features

// const overpass = require('query-overpass')
const overpass = require('../tools/qoverpass.js')
const fs = require('fs')
const turf = require('turf')
const countries = require('../lib/boundaries/ne_10m_admin0_ssa.json')

// Fetch the bounding box of interest
// Turf passes: (west, south, east, north) http://turfjs.org/docs/#bbox
let bbox = turf.bbox(countries)

// Store the bbox as a string
// Overpass QL expects: (south,west,north,east)
let bboxOverpass = `${bbox[1]},${bbox[0]},${bbox[3]},${bbox[2]}`

// A query in Overpass QL
// See: http://wiki.openstreetmap.org/wiki/Overpass_API/Language_Guide
let query = `(node[amenity=clinic](${bboxOverpass});>;);out body;`

overpass(query)
  .then(function (data) {
    fs.writeFile('data/data.geojson', JSON.stringify(data))
  })
  .catch(function (err) {
    console.log(err)
  })

// For social use, fetch and combine these:
// amenity=doctors
// http://wiki.openstreetmap.org/wiki/Tag:amenity%3Ddoctors
// amenity=hospital
// http://wiki.openstreetmap.org/wiki/Tag:amenity%3Dhospital
// amenity=clinic
// http://wiki.openstreetmap.org/wiki/Tag:amenity%clinic
