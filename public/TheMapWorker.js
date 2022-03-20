/* global importScripts Supercluster */

importScripts('supercluster.min.js')

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
  if (e.data.getClusterExpansionZoom) {
    // This is fired when the user clicks on a cluster.
    // Returns the zoom level to zoom in and the center.
    postMessage({
      expansionZoom: index.getClusterExpansionZoom(e.data.getClusterExpansionZoom),
      center: e.data.center
    })
  } else if (e.data.filters) {
    // This is fired when the map is filtered.
    let filteredData = []
    const f = e.data.filters
    if (f.observations.length > 0) {
      filteredData = filterObservations(e.data.layers, f.observations)
    }
    if (f.locations.length > 0) {
      console.log(JSON.parse(f.locations[0]))
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

function loadMapData (data) {
  index = new Supercluster({
    log: DEBUG,
    radius: 180,
    extent: 256,
    maxZoom: 17
  }).load(data)
  postMessage({ ready: true })
}

function filterObservations (layers, filters) {
  // addObservationsFilter(type, code)
  let filteredData = {}
  data = all_data
  // Get all visible layers categories from filters
  let visibleCategories = []
  filters.forEach(f => {
    visibleCategories = [...visibleCategories, ...layers[f.type][f.code].categories]
  })
  // Filter the data
  filteredData = all_data.filter(feature => {
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