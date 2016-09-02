'use strict'

// Process healthcare data from OSM and process it for use in the
// IFC market opportunities tool

const osmData = require('../tools/osm-data.js')
const overpass = require('../tools/overpass.js')

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
