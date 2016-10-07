// quick script to merge all geojson files in the data folder
'use strict'
const fs = require('fs')
const turf = require('turf')

var finalData = []
for (let fn of fs.readdirSync('../data')) {
  let cData = JSON.parse(fs.readFileSync('../data/' + fn))
  cData.features.map(f => finalData.push(f))
}
fs.writeFileSync('../osm-power-merged.json', JSON.stringify(turf.featureCollection(finalData)))
