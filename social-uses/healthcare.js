'use strict'

// Process healthcare data from OSM and process it for use in the
// IFC market opportunities tool

const osmData = require('../tools/osm-data.js')
const overpass = require('../tools/overpass.js')

// Fetch the bbox for SSA
const bboxOverpass = overpass.bboxSSA()

let options = {
  'query':
    `(node[amenity=clinic](${bboxOverpass});
      way[amenity=clinic](${bboxOverpass});
      node[amenity=hospital](${bboxOverpass});
      way[amenity=hospital](${bboxOverpass});
      node[amenity=doctors](${bboxOverpass});
      way[amenity=doctors](${bboxOverpass});>;);out body;`,
  'fn': 'data/healthcare.geojson',
  'osmTags': ['amenity', 'name']
}

osmData(options, __dirname)
