const test = require('ava')
const generateIntersect = require('../tools/lib/generate-intersect.js')
const countries = require('./fixtures/countries.json')

test('generateIntersect handles polygon inside polygon', t => {
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
        'id': 'nig'
      },
      'geometry': {
        'type': 'Polygon',
        'coordinates': [[[2.5, 4.5], [2.5, 5.5], [3.5, 5.5], [3.5, 4.5], [2.5, 4.5]]]
      }
    }
  ]
  t.deepEqual(generateIntersect(data, countries), result)
})

test('generateIntersect handles no match inside polygon', t => {
  let data = {
    'type': 'Feature',
    'properties': {},
    'geometry': {
      'type': 'Polygon',
      'coordinates': [[[5, 31], [5, 41], [6, 41], [6, 31], [5, 31]]]
    }
  }
  t.deepEqual(generateIntersect(data, countries), [])
})

test('generateIntersect properly slices a polygon into two', t => {
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
        'id': 'nig'
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
        'id': 'tza'
      },
      'geometry': {
        'type': 'Polygon',
        'coordinates': [[[2, 5.5], [2, 4.5], [1, 4.5], [1, 5.5], [2, 5.5]]]
      }
    }
  ]
  t.deepEqual(generateIntersect(data, countries), result)
})
