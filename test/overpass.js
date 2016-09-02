const test = require('ava')
const overpass = require('../tools/overpass.js')

test('overpass.bbox generates a bbox for an array of ISO codes', t => {
  let result = '-11.731272481999923,2.671081990000118,13.880290832000114,40.44939212300008'
  t.deepEqual(overpass.bbox(['nga', 'tza']), result)
})

test('overpass.bbox generates a bbox when one ISO code is specified', t => {
  let result = '4.27216217700007,2.671081990000118,13.880290832000114,14.66993615700008'
  t.deepEqual(overpass.bbox('nga'), result)
})

test('overpass.bbox generates a bbox for the full GeoJSON when no ISO is specified', t => {
  let result = '-46.96575286299996,-25.360422329999892,27.285415751000087,63.493907097'
  t.deepEqual(overpass.bbox(), result)
})

test('overpass.bbox throws an error if no valid ISO codes are specified', t => {
  t.throws(() => overpass.bbox(['ng2', 'bar2']), 'At least one ISO code not found: ng2, bar2')
})

test('overpass.bbox throws an error if one of the ISO codes does not exist', t => {
  t.throws(() => overpass.bbox(['nga', 'bar2']), 'At least one ISO code not found: nga, bar2')
})
