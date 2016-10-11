const test = require('ava')
const utils = require('../tools/utils.js')

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

test('filterByType filters features by geometry type', t => {
  let data = {
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
          'type': 'LineString',
          'coordinates': [9, 9]
        }
      }
    ]
  }
  let result = {
    'type': 'FeatureCollection',
    'features': [
      {
        'type': 'Feature',
        'properties': {
        },
        'geometry': {
          'type': 'LineString',
          'coordinates': [9, 9]
        }
      }
    ]
  }

  t.deepEqual(utils.filterByType(data, ['LineString']), result)
})

test('convertToPoints correctly converts polygons and lines to points', t => {
  let data = {
    'type': 'FeatureCollection',
    'features': [
      {
        'type': 'Feature',
        'properties': {
          'amenity': 'doctors'
        },
        'geometry': {
          'type': 'Polygon',
          'coordinates': [
            [[36.8065284, -1.294548], [36.8068074, -1.2944117], [36.8069526, -1.2947088], [36.8066736, -1.2948451], [36.8065284, -1.294548]]
          ]
        }
      },
      {
        'type': 'Feature',
        'properties': {
          'amenity': 23
        },
        'geometry': {
          'type': 'Point',
          'coordinates': [ 36, -1 ]
        }
      }
    ]
  }
  let result = {
    'type': 'FeatureCollection',
    'features': [
      {
        'type': 'Feature',
        'properties': {
          'amenity': 'doctors'
        },
        'geometry': {
          'type': 'Point',
          'coordinates': [ 36.8067405, -1.2946284000000001 ]
        }
      },
      {
        'type': 'Feature',
        'properties': {
          'amenity': 23
        },
        'geometry': {
          'type': 'Point',
          'coordinates': [ 36, -1 ]
        }
      }
    ]
  }

  t.deepEqual(utils.convertToPoints(data), result)
})
