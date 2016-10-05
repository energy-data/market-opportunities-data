'use strict'

const fs = require('fs')
const path = require('path')
const turf = require('turf')
const country = 'nga'

const data = JSON.parse(fs.readFileSync(path.join(__dirname, './data/road-networknga.geojson')))

fs.writeFileSync(path.join(__dirname, `./data/road-network-${country}.geojson`), JSON.stringify(turf.featureCollection(data.features.filter(ft => ft.properties.iso === country))))
