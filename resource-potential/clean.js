'use strict'

// Filter a geojson so it only contains:
// - positive GHI values
// - data from Nigeria, Tanzania or Zambia

const fs = require('fs')
const _ = require('lodash')
const turf = require('turf')

let data = require('./export.json')

let filteredFeats = data.features.filter(
  ft => (ft.properties.ghi_kwh_m2 > 0 &&
        _.includes(['nga', 'tza', 'zmb'], ft.properties.iso)
  )
)

fs.writeFile('./data/data.geojson', JSON.stringify(turf.featureCollection(filteredFeats)))
