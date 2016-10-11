// quick script to merge all geojson files in the data folder
'use strict'
const filterRings = require('../../tools/filter-inner-rings.js')
const fs = require('fs')
const turf = require('turf')

var finalData = []
for (let fn of fs.readdirSync('../data')) {
  let cData = JSON.parse(fs.readFileSync('../data/' + fn))
  cData.features.map(f => finalData.push(filterRings(f, 1000000)))
}
fs.writeFileSync('../osm-power-merged-filtered.json', JSON.stringify(turf.featureCollection(finalData)))
