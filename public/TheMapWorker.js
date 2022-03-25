/* global importScripts Supercluster */
importScripts('supercluster.min.js')
importScripts('https://cdn.jsdelivr.net/npm/@turf/turf@5/turf.min.js')

let all_data = []
const LAYER_TYPES = ['observations', 'otherObservations', 'breeding', 'bites']
const DEBUG = true
let index, unclustered
const now = Date.now()
let filters ={}
let all_layers = null

function log (text) {
  if (DEBUG) console.log(text)
}

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
  } else if (e.data.filters) {
    // This is fired when the map is filtered.
    all_layers = e.data.layers
    let filteredData = all_data
    filters = e.data.filters
    if (filters.observations.length > 0) {
      filteredData = filterObservations(filteredData, e.data.layers, filters.observations)
    } else {
      filteredData = []
    }
    if (filters.date.length > 0) {
      // array with only one date
      filteredData = filterDate(filteredData, filters.date[0])
    }
    if (filters.locations.length > 0) {
      const poly = JSON.parse(filters.locations[0]).features[0]
      filteredData = filterLocations(filteredData, poly)
    }
    loadMapData(filteredData)
  } else if (e.data) {
    // This is fired when the user navigates the map.
    const map = index.getClusters(e.data.bbox, e.data.zoom)
    const time = unclustered.getClusters(e.data.bbox, e.data.zoom)
    time.sort((a, b) => {
      if (a.properties.d < b.properties.d) return -1
      else if (a.properties.d > b.properties.d) return 1
      else return 0
    })
    const dates = []
    const series = {}
    const seriesMap = {}
    filters.observations.forEach(layer => {
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

function loadMapData (data) {
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
  }).load(data);

  postMessage({ ready: true })
}

function filterDate (data, date) {
  let filtered = {}
  filtered = data.filter(feature => {
    const feature_date = new Date(feature.properties.d)
    if (new Date(date.from) <= feature_date && feature_date <= new Date(date.to)) {
      return true
    }
  })
  return filtered
}

function filterLocations (data, poly) {
  let filtered = {}
  let polyCoords = poly.geometry.coordinates
  const bb = poly.properties.boundingBox.map(parseFloat)
  const features = turf.featureCollection([
    turf.point([bb[0], bb[1]]),
    turf.point([bb[2], bb[3]])
  ])
  const enveloped = turf.envelope(features)

  if (poly.geometry.type.toLowerCase() === 'polygon') {
    polyCoords = [poly.geometry.coordinates]
  }

  // get first candidates inside bounding box
  const candidates = data.filter(point => {
    const ptCoords = point.geometry.coordinates
    return turf.booleanPointInPolygon(ptCoords, enveloped)
  })

  // from candidates get points inside poly
  filtered = candidates.filter(point => {
    const ptCoords = point.geometry.coordinates
    return turf.booleanPointInPolygon(ptCoords, polyCoords)
  })
  return filtered
}

function filterObservations (data, layers, filters) {
  // addObservationsFilter(type, code)
  let filteredData = {}
  // Get all visible layers categories from filters
  let visibleCategories = []
  filters.forEach(f => {
    visibleCategories = [...visibleCategories, ...layers[f.type][f.code].categories]
  })
  // Filter the data
  filteredData = data.filter(feature => {
    // if (feature.properties.c.indexOf('storm') > -1) {
    // }
    return visibleCategories.includes(feature.properties.c)
  })

  return filteredData
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