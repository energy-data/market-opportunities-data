const test = require('ava')
const intersect = require('../tools/lib/intersect.js')
const countries = require('./fixtures/countries.json')

test('intersect.generate handles polygon inside polygon', t => {
  let data = {
    'type': 'Feature',
    'properties': {},
    'geometry': {
      'type': 'Polygon',
      'coordinates': [[[2.5, 4.5], [2.5, 5.5], [3.5, 5.5], [3.5, 4.5], [2.5, 4.5]]]
    }
  }
  let result = [
    {
      'type': 'Feature',
      'properties': {
        'iso': 'nig'
      },
      'geometry': {
        'type': 'Polygon',
        'coordinates': [[[2.5, 4.5], [2.5, 5.5], [3.5, 5.5], [3.5, 4.5], [2.5, 4.5]]]
      }
    }
  ]
  t.deepEqual(intersect.generate(data, countries, [ 'nig' ]), result)
})

test('intersect.generate handles no match inside polygon', t => {
  let data = {
    'type': 'Feature',
    'properties': {},
    'geometry': {
      'type': 'Polygon',
      'coordinates': [[[5, 31], [5, 41], [6, 41], [6, 31], [5, 31]]]
    }
  }
  t.deepEqual(intersect.generate(data, countries), [])
})

test('intersect.generate properly slices a polygon into two', t => {
  let data = {
    'type': 'Feature',
    'properties': {
      'density': 0.5
    },
    'geometry': {
      'type': 'Polygon',
      'coordinates': [[[1, 4.5], [1, 5.5], [3, 5.5], [3, 4.5], [1, 4.5]]]
    }
  }
  let result = [
    {
      'type': 'Feature',
      'properties': {
        'density': 0.5,
        'iso': 'nig'
      },
      'geometry': {
        'type': 'Polygon',
        'coordinates': [[[2, 4.5], [2, 5.5], [3, 5.5], [3, 4.5], [2, 4.5]]]
      }
    },
    {
      'type': 'Feature',
      'properties': {
        'density': 0.5,
        'iso': 'tza'
      },
      'geometry': {
        'type': 'Polygon',
        'coordinates': [[[2, 5.5], [2, 4.5], [1, 4.5], [1, 5.5], [2, 5.5]]]
      }
    }
  ]
  t.deepEqual(intersect.generate(data, countries, [ 'NIG', 'TZA' ]), result)
})
