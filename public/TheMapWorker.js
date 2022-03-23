/* global importScripts Supercluster */
importScripts('supercluster.min.js')
importScripts('https://cdn.jsdelivr.net/npm/@turf/turf@5/turf.min.js')

let all_data = []
const LAYER_TYPES = ['observations', 'otherObservations', 'breeding', 'bites']
const DEBUG = true
let index

const now = Date.now()
getJSON('totes.json', (geojson) => {
  log(`loaded ${geojson.features.length} points JSON in ${(Date.now() - now) / 1000}s`)
  all_data = geojson.features
  postMessage({ ready: true })
})

self.onmessage = function (e) {
  console.log('worker working')
  if (e.data.getClusterExpansionZoom) {
    // This is fired when the user clicks on a cluster.
    // Returns the zoom level to zoom in and the center.
    postMessage({
      expansionZoom: index.getClusterExpansionZoom(e.data.getClusterExpansionZoom),
      center: e.data.center
    })
  } else if (e.data.filters) {
    // This is fired when the map is filtered.
    let filteredData = all_data
    const f = e.data.filters

    if (f.observations.length > 0) {
      console.log('call filter locations')
      filteredData = filterObservations(filteredData, e.data.layers, f.observations)
    } else {
      filteredData = []
    }
    if (f.locations.length > 0) {
      const poly = JSON.parse(f.locations[0]).features[0]
      filteredData = filterLocations(filteredData, poly)
    }
    loadMapData(filteredData)
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

function loadMapData (data) {
  index = new Supercluster({
    log: DEBUG,
    radius: 180,
    extent: 256,
    maxZoom: 17
  }).load(data)
  postMessage({ ready: true })
}
// function addObservationsFilter (type, code) {
//   if (LAYER_TYPES.indexOf(type) > -1) {
//     // Remove the filter if it was already there
//     const exists = filters.layers.find((layer, index) => {
//       const isTheSame = layer.type === type && layer.code === code
//       if (isTheSame) {
//         filters.layers.splice(index, 1)
//       }
//       return isTheSame
//     })
//     // Add the filter if it was not there
//     if (!exists) {
//       filters.layers.push({ type: type, code: code })
//     }
//   }
// }

function filterLocations (data, poly) {
  console.log('filter location worker')
  let filtered = {}
  let polyCoords = poly.geometry.coordinates
  console.log(poly.properties.boundingBox)
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
    return visibleCategories.includes(feature.properties.c)
  })

  return filteredData
}

function filterLocations (data, polyCoords) {
  let filtered = {}
  filtered = data.filter(point => {
    if (point.geometry) {
      const ptCoords = point.geometry.coordinates
      return turf.booleanPointInPolygon(ptCoords, polyCoords)
    } else {
      console.log('no geometry in point')
      console.log(point)
      return false
    }
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