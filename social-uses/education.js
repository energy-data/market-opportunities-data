'use strict'

// Process education data from OSM and process it for use in the
// IFC market opportunities tool

const osmData = require('../tools/osm-data.js')
const overpass = require('../tools/overpass.js')

// Fetch the bbox for SSA
const bboxOverpass = overpass.bboxSSA()

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
  'osmTags': ['amenity', 'name']
}

osmData(options, __dirname)
