/* global importScripts Supercluster */
importScripts('supercluster.min.js')
importScripts('https://cdn.jsdelivr.net/npm/@turf/turf@5/turf.min.js')

let all_data = []
const LAYER_TYPES = ['observations', 'otherObservations', 'breeding', 'bites']
const DEBUG = false
let index, unclustered
const now = Date.now()
let filters = {}
let all_layers = null
let simplifyTolerance = null

function log (text) {
  if (DEBUG) console.log('[TheMapWorker]', text)
}

getJSON('totes.json', (geojson) => {
  log(`loaded ${geojson.features.length} points JSON in ${(Date.now() - now) / 1000}s`)
  all_data = geojson.features
  postMessage({
    ready: true,
    datesInterval: {
      from: all_data[0].properties.d,
      to: all_data[all_data.length - 1].properties.d
    }
  })
})

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
  }).load(data)

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
  let turfPoligon = null
  let polyCoords = poly.geometry.coordinates
  const bb = poly.properties.boundingBox.map(parseFloat)
  const features = turf.featureCollection([
    turf.point([bb[0], bb[1]]),
    turf.point([bb[2], bb[3]])
  ])
  const enveloped = turf.envelope(features)
  const polyMercator = turf.toMercator(poly)
  if (poly.geometry.type.toLowerCase() === 'polygon') {
    polyCoords = [poly.geometry.coordinates]
    turfPoligon = turf.polygon(polyMercator.geometry.coordinates)
  } else {
    polyCoords = poly.geometry.coordinates
    turfPoligon = turf.multiPolygon([polyMercator.geometry.coordinates])
  }

  // var options = {tolerance: 0.01, highQuality: false}
  // var simplified = turf.simplify(geojson, options)

  // get first candidates inside bounding box
  const myCoords = []
  const candidates = data.filter(point => {
    const ptCoords = point.geometry.coordinates
    if (turf.booleanPointInPolygon(ptCoords, enveloped)) {
      myCoords.push(ptCoords)
      return true
    } else {
      return false
    }
  })
  console.log('Tolerance ' + simplifyTolerance)
  const options = {tolerance: simplifyTolerance, highQuality: true}
  const simplified = turf.simplify(polyMercator, options)

  // from candidates get points inside poly
  filtered = candidates.filter(point => {
    const pt = turf.toMercator(point)
    const ptCoords = pt.geometry.coordinates
    return turf.booleanPointInPolygon(ptCoords, simplified)
  })
  // const ptsWithin = turf.pointsWithinPolygon(turf.points(myCoords), simplified)
  // console.log(ptsWithin)
  return filtered
}

function filterTags (data, tags) {
  const filteringTags = tags.map(tag => tag.toLowerCase())
  const filteredData = data.filter(f => {
    const t = f.properties.t
    let containsAll = false
    if (t.length) {
      const featureTags = t.split(',').map(t => t.trim())
      if (featureTags.indexOf('italy') > -1) {
        console.log(f.properties)
        console.log(featureTags)
      }
      containsAll = filteringTags.every(element => {
        return featureTags.includes(element)
      })
    }
    return containsAll
  })
  return filteredData
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
    if (filters.hashtags.length > 0) {
      // array with only one date
      filteredData = filterTags(filteredData, filters.hashtags)
    }
    if (filters.locations.length > 0) {
      if (filters.tolerance) {
        simplifyTolerance = filters.tolerance
      }
      const poly = JSON.parse(filters.locations[0]).features[0]
      filteredData = filterLocations(filteredData, poly)
    }
    loadMapData(filteredData)
  } else if (e.data) {
    // This is fired when the user navigates the map.
    const time = unclustered.getClusters(e.data.bbox, e.data.zoom)
    const map = index.getClusters(e.data.bbox, e.data.zoom)

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
    start = new Date(start.setDate(start.getDate() - 1)) // Start on the day before the first date
    let end = new Date(tempDates[tempDates.length - 1])
    end = new Date(end.setDate(end.getDate() + 1)) // Finish on the day after the last date
    while (start <= end) {
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
      start = new Date(start.setDate(start.getDate() + 1))
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