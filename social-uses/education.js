'use strict'

// Process education data from OSM and process it for use in the
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
    `(node[amenity=college](${bboxOverpass});
      way[amenity=college](${bboxOverpass});
      node[amenity=kindergarten](${bboxOverpass});
      way[amenity=kindergarten](${bboxOverpass});
      node[amenity=school](${bboxOverpass});
      way[amenity=school](${bboxOverpass});
      node[amenity=university](${bboxOverpass});
      way[amenity=university](${bboxOverpass});>;);out body;`,
  'filename': 'data/education.geojson',
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
