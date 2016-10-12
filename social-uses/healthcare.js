'use strict'

// Process healthcare data from OSM and process it for use in the
// IFC market opportunities tool

const osmData = require('../tools/osm-data.js')
const overpass = require('../tools/overpass.js')
const fs = require('fs')
const path = require('path')
const turf = require('turf')

const addIso = require('../tools/add-iso.js')
const utils = require('../tools/utils.js')

// Fetch the bbox for SSA
const bbox = utils.bbox()
const overpassBbox = overpass.bbox(bbox)

let options = {
  'query':
    `(node[amenity=clinic](${overpassBbox});
      way[amenity=clinic](${overpassBbox});
      node[amenity=hospital](${overpassBbox});
      way[amenity=hospital](${overpassBbox});
      node[amenity=doctors](${overpassBbox});
      way[amenity=doctors](${overpassBbox});>;);out body;`,
  'filename': 'data/healthcare.geojson',
  'filterTags': ['amenity', 'name'],
  'enforceType': 'point'
}

osmData(options)
  .then(function (data) {
    console.log('Starting simplification...')
    let startTime = Date.now()
    // Simplify the dataset by making it less dense. Dropping all points that
    // are within 1.5km from another. This should not significantly change
    // results in the tool
    fs.writeFileSync('./data/healthcare-original.geojson', JSON.stringify(data))
    let filteredData = [data.features[0]]
    for (let i = 0; i < data.features.length; i++) {
      let nearest = turf.nearest(data.features[i], turf.featureCollection(filteredData))
      if (turf.distance(data.features[i], nearest) > 1.5) {
        filteredData.push(data.features[i])
      }
    }
    console.log(`done in: ${Date.now() - startTime}ms.`)
    return turf.featureCollection(filteredData)
  })
  // .then(function (data) {
  //   let startTime = Date.now()
  //   // Simplify the dataset by making it less dense. Dropping all points that
  //   // are within 500 meters from another. This should not significantly change
  //   // results, since the minimum buffer in the tool is 1km.
  //   fs.writeFileSync('./data/healthcare-original.geojson', JSON.stringify(data))
  //   console.log('original:', data.features.length)
  //   let filteredData = JSON.parse(JSON.stringify(data))
  //   console.log('copy:', filteredData.features.length)
  //   let removed = 0
  //   for (let i = 0; i < data.features.length; i++) {
  //     let nearest = turf.nearest(data.features[i], filteredData)
  //     // console.log(nearest)
  //     if (turf.distance(data.features[i], nearest) < 0.5) {
  //       console.log('Yes!', filteredData.features.length)
  //       filteredData.features.splice(i - removed, 1)
  //       console.log('Is it removed?', filteredData.features.length)
  //     }
  //   }
  //   console.log(Date.now() - startTime)
  //   return filteredData
  // })
  .then(function (data) {
    console.log('Writing merged data to files...')
    // TODO. No need to write to file, could stream directly to add-iso
    fs.writeFileSync(path.join(__dirname, 'data/tmp.geojson'), JSON.stringify(data))
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
