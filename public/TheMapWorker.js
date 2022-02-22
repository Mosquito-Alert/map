/* global importScripts Supercluster */

importScripts('supercluster.min.js')

let all_data = []
const LAYER_TYPES = ['observations', 'breeding_sites', 'storm_drain']
const filters = { layers: [] }
const DEBUG = true
let index

const now = Date.now()
getJSON('totes.json', (geojson) => {
  console.log(`loaded ${geojson.features.length} points JSON in ${(Date.now() - now) / 1000}s`)
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
    // This is fired when the map is filtered.
    filter(e.data.type, e.data.code, e.data.layers)
  } else if (e.data) {
    // This is fired when the user navigates the map.
    const res = index.getClusters(e.data.bbox, e.data.zoom)
    postMessage(res)
  }
}

function addFilter (type, code) {
  if (LAYER_TYPES.indexOf(type) > -1) {
    // Remove the filter if it was already there
    const exists = filters.layers.find((layer, index) => {
      const isTheSame = layer.type === type && layer.code === code
      if (isTheSame) {
        filters.layers.splice(index, 1)
      }
      return isTheSame
    })
    // Add the filter if it was not there
    if (!exists) filters.layers.push({ type: type, code: code })
  }
}

function thereAreFilters () {
  return filters.layers.length > 0
}

function filter (type, code, layers) {
  addFilter(type, code)
  let data = all_data
  if (thereAreFilters()) {
    // Filter the data
    data = all_data.filter(feature => {
      // If it is a layer and the feature has a validation string
      if (LAYER_TYPES.indexOf(type) > -1 && feature.properties.c) {
        const exists = filters.layers.find(filter => {
          return layers[filter.type][filter.code].categories.indexOf(feature.properties.c) > -1
        })
        if (exists) {
          return feature
        }
      }
    })
  }
  index = new Supercluster({
    log: DEBUG,
    radius: 180,
    extent: 256,
    maxZoom: 17
  }).load(data)

  // console.log(index.getTile(0, 0, 0));

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
