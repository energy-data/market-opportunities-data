'use strict'

// Process healthcare data from OSM and process it for use in the
// IFC market opportunities tool

const osmData = require('../tools/osm-data.js')
const overpass = require('../tools/overpass.js')
const fs = require('fs')
const path = require('path')
const turf = require('turf')

const addIso = require('../tools/add-iso.js')

// Fetch the bbox for SSA
const bboxOverpass = overpass.bbox()

let options = {
  'query':
    `(node[amenity=clinic](${bboxOverpass});
      way[amenity=clinic](${bboxOverpass});
      node[amenity=hospital](${bboxOverpass});
      way[amenity=hospital](${bboxOverpass});
      node[amenity=doctors](${bboxOverpass});
      way[amenity=doctors](${bboxOverpass});>;);out body;`,
  'filename': 'data/healthcare.geojson',
  'filterTags': ['amenity', 'name'],
  'enforceType': 'point'
}

osmData(options, __dirname)
  .then(function (data) {
    console.log('Writing merged data to files...')
    // TODO. No need to write to file, could stream directly to add-iso
    fs.writeFileSync(path.join(__dirname, 'data/tmp.geojson'), JSON.stringify(turf.featureCollection([data])))
  })
  .catch(function (err) {
    console.log(err)
  })
  .then(function () {
    console.log('Split features by country and add ISO code...')
    // Add an ISO code to each feature. Discard those that are outside the
    // target countries
    addIso(path.join(__dirname, 'data/tmp.geojson'), path.join(__dirname, options.filename))
  })
