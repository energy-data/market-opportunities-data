const test = require('ava')
const utils = require('../tools/lib/utils.js')

var data = {
  'type': 'FeatureCollection',
  'features': [
    {
      'type': 'Feature',
      'properties': {
        'generator:source': 'hydro',
        'name': 'Kainji Dam',
        'power': 'generator'
      },
      'geometry': {
        'type': 'Point',
        'coordinates': [10, 10]
      }
    },
    {
      'type': 'Feature',
      'properties': {
        'power': 'tower'
      },
      'geometry': {
        'type': 'Point',
        'coordinates': [9, 9]
      }
    }
  ]
}

test('filterProps filters the properties object correctly', t => {
  let result = {
    'type': 'FeatureCollection',
    'features': [
      {
        'type': 'Feature',
        'properties': {
          'name': 'Kainji Dam',
          'power': 'generator'
        },
        'geometry': {
          'type': 'Point',
          'coordinates': [10, 10]
        }
      },
      {
        'type': 'Feature',
        'properties': {
          'power': 'tower'
        },
        'geometry': {
          'type': 'Point',
          'coordinates': [9, 9]
        }
      }
    ]
  }
  t.deepEqual(utils.filterProps(data, ['name', 'power']), result)
})

test('filterProps handles an empty filterTags array', t => {
  let result = {
    'type': 'FeatureCollection',
    'features': [
      {
        'type': 'Feature',
        'properties': {
        },
        'geometry': {
          'type': 'Point',
          'coordinates': [10, 10]
        }
      },
      {
        'type': 'Feature',
        'properties': {
        },
        'geometry': {
          'type': 'Point',
          'coordinates': [9, 9]
        }
      }
    ]
  }

  t.deepEqual(utils.filterProps(data, []), result)
})
