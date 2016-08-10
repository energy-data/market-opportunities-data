'use strict'

const addIso = require('../tools/add-iso.js')
const fs = require('fs')
const path = require('path')
const rbush = require('rbush')
const rp = require('request-promise')
const turf = require('turf')

const url = 'http://www.resourceprojects.org/api/projects'

const nig = JSON.parse(fs.readFileSync(path.join(__dirname, './src/kth-mining-nig.geojson'))).features
const tza = JSON.parse(fs.readFileSync(path.join(__dirname, './src/kth-mining-tza.geojson'))).features
const zmb = JSON.parse(fs.readFileSync(path.join(__dirname, './src/kth-mining-zmb.geojson'))).features
const kthData = nig
        .concat(tza)
        .concat(zmb)

/**
 * Generates a rbush tree from the KTH data
 *
 */
var generateRbush = function () {
  let tree = kthData.map(function (o) {
    let bbox = turf.bbox(o)
    return {
      minX: bbox[0],
      minY: bbox[1],
      maxX: bbox[2],
      maxY: bbox[3]
    }
  })
  let kthIndex = rbush()
  return kthIndex.load(tree)
}

/**
 * Checks if a mine from Resource Projects has coordinates and if it collides
 * with mines from KTH
 *
 */
var validityFeature = function (o, tree) {
  let valid = false
  if (o.proj_coordinates.length > 0) {
    let ft = turf.point([o.coordinates[0].lng, o.coordinates[0].lat])
    let bbox = turf.bbox(turf.buffer(ft, 1, 'kilometers'))
    valid = !tree.collides({minX: bbox[0], minY: bbox[1], maxX: bbox[2], maxY: bbox[3]})
  }
  return valid
}

/**
 * Prepare mining data for use in the IFC Market Opportunities tool
 *
 * - mining data from KTH is used as the basis
 * - download data from Resource Projects and remove duplicates by checking
 *    if points intersect with any (buffered) point from the KTH dataset
 *
 */
console.log('Fetching data from Resource Projects...')
rp(url)
  .catch(function (err) {
    return (err)
  })
  .then(function (body) {
    return JSON.parse(body)
  })
  .catch(function (err) {
    return (err)
  })
  .then(function (body) {
    let rbushTree = generateRbush()
    // Filter the Resource Projects data
    return body.data.filter(function (o) {
      return validityFeature(o, rbushTree)
    })
  })
  .then(function (data) {
    return data.map(function (o) {
      return turf.point(
        [o.coordinates[0].lng, o.coordinates[0].lat],
        {'name': o.proj_name, 'id': o.proj_id}
      )
    })
  })
  .then(function (data) {
    fs.writeFileSync(path.join(__dirname, './data/tmp.geojson'), JSON.stringify(turf.featureCollection(kthData.concat(data))))
    return
  })
  .then(function () {
    // Add an ISO code to each feature. Discard those that are outside the
    // target countries
    addIso(path.join(__dirname, './data/tmp.geojson'), path.join(__dirname, './data/mining.geojson'))
  })
