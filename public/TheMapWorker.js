/* global importScripts Supercluster */

importScripts('supercluster.min.js')

let all_data = []
const LAYER_TYPES = ['observations', 'otherObservations', 'breeding', 'storm_drain', 'bites']
const filters = { layers: [] }
const DEBUG = false
let all_layers = null
let index, unclustered


function log (text) {
  if (DEBUG) console.log(text)
}

const now = Date.now()
getJSON('totes.json', (geojson) => {
  log(`loaded ${geojson.features.length} points JSON in ${(Date.now() - now) / 1000}s`)
  all_data = geojson.features
  postMessage({ ready: true })
})

self.onmessage = function (e) {
  if (e.data.getClusterExpansionZoom) {
    // This is fired when the user clicks on a cluster.
    // Returns the zoom level to zoom in and the center.
    postMessage({
      expansionZoom: index.getClusterExpansionZoom(e.data.getClusterExpansionZoom),
      center: e.data.center
    })
  } else if (e.data.type) {
    // Type is layer or date
    // This is fired when the map is filtered.
    all_layers = e.data.data.layers
    filter(e.data, e.data.code, e.data.layers);
  } else if (e.data) {
    // This is fired when the user navigates the map.
    const map = index.getClusters(e.data.bbox, e.data.zoom);
    const time = unclustered.getClusters(e.data.bbox, e.data.zoom)
    time.sort((a, b) => {
      if (a.properties.d < b.properties.d) return -1
      else if (a.properties.d > b.properties.d) return 1
      else return 0
    })
    const dates = []
    const series = {}
    const seriesMap = {}

    filters.layers.forEach(layer => {
      all_layers[layer.type][layer.code].categories.forEach(validationType => {
        seriesMap[validationType] = layer.code
      })
      series[layer.code] = []
    })

    const temp = {}

    time.forEach(feature => {
      const type = seriesMap[feature.properties.c]
      if (!(feature.properties.d in temp)) temp[feature.properties.d] = {}
      const dateSeries = temp[feature.properties.d]
      if (!(type in dateSeries)) dateSeries[type] = 0
      dateSeries[type] += 1
    })

    const tempDates = Object.keys(temp)
    let start = new Date(tempDates[0])
    const end = new Date(tempDates[tempDates.length - 1])
    while (start <= end) {
      start = new Date(start.setDate(start.getDate() + 1))
      const dateLabel = start.toISOString().split('T')[0]
      const values = temp[dateLabel]
      dates.push(dateLabel)
      Object.keys(series).forEach(type => {
        if (values && type in values) {
          const value = values[type]
          series[type].push(value)
        } else {
          series[type].push(0)
        }
      })
    }

    postMessage({
      map: map,
      timeseries: {
        dates: dates,
        data: series
      }
    })
  }
}

function addFilter (params) {
  let filterSet
  if (params.type === 'layer') {
    if (LAYER_TYPES.indexOf(params.data.type) > -1) {
      // Remove the filter if it was already there
      const exists = filters.layers.find((layer, index) => {
        const isTheSame = layer.type === params.data.type && layer.code === params.data.code
        if (isTheSame) {
          filters.layers.splice(index, 1)
        }
        return isTheSame
      })
      // Add the filter if it was not there
      if (!exists) filters.layers.push({ type: params.data.type, code: params.data.code })
    }
  }
  if (params.type === 'date') {
    filters.dates = Object.assign({}, params.data)
    delete filters.dates.layers
  }
}

function thereAreFilters () {
  return filters.layers.length > 0
}

function filter (params, code, layers) {
  addFilter(params)
  let data = []
  if (thereAreFilters()) {
    // Filter the data
    data = all_data.filter(feature => {
      // If it is a layer and the feature has a validation string
      // if (LAYER_TYPES.indexOf(type) > -1 && feature.properties.c) {
      const layerMatches = filters.layers.find(filter => {
        return params.data.layers[filter.type][filter.code].categories.indexOf(feature.properties.c) > -1
      })
      let timeMatches = true
      if (filters.dates) {
        timeMatches = false
        const feature_date = new Date(feature.properties.d)
        if (new Date(filters.dates.from) <= feature_date && feature_date <= new Date(filters.dates.to)) {
          timeMatches = true
        }
      }
      if (layerMatches && timeMatches) {
        return feature
      }
    })
  }

  index = new Supercluster({
    log: DEBUG,
    radius: 180,
    extent: 256,
    maxZoom: 17
  }).load(data)

  unclustered = new Supercluster({
    log: DEBUG,
    radius: 1,
    extent: 256,
    maxZoom: 1
  }).load(data)

  postMessage({ ready: true })
}

function getJSON (url, callback) {
  const xhr = new XMLHttpRequest()
  xhr.open('GET', url, true)
  xhr.responseType = 'json'
  xhr.setRequestHeader('Accept', 'application/json')
  xhr.onload = function () {
    if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 300 && xhr.response) {
      callback(xhr.response)
    }
  }
  xhr.send()
}
