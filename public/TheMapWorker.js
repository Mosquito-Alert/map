/* global importScripts Supercluster */
importScripts('supercluster.min.js')
importScripts('https://cdn.jsdelivr.net/npm/@turf/turf@5/turf.min.js')

let dataset = []
let filteredDataset = []
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

// Download data and send message when ready including first and last date in dataset
getJSON('totes.json', (geojson) => {
  log(`loaded ${geojson.features.length} points JSON in ${(Date.now() - now) / 1000}s`)
  dataset = geojson.features
  postMessage({
    ready: true,
    datesInterval: {
      from: dataset[0].properties.d,
      to: dataset[dataset.length - 1].properties.d
    }
  })
})

function loadMapData (data, fitFeatures) {
  index = new Supercluster({
    log: DEBUG,
    radius: 45,
    extent: 256,
    maxZoom: 19
  }).load(data)

  unclustered = new Supercluster({
    log: DEBUG,
    radius: 1,
    extent: 256,
    maxZoom: 1
  }).load(data)

  const workerParams = {
    ready: true,
    datesInterval: {
      from: dataset[0].properties.d,
      to: dataset[dataset.length - 1].properties.d
    }
  }
  if (fitFeatures) {
    workerParams.features = data
  }
  postMessage(workerParams)
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
  const options = { tolerance: simplifyTolerance, highQuality: true }
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
    let found = false
    if (t.length) {
      const featureTags = t.split(',').map(t => t.trim())
      found = featureTags.some(r => filteringTags.includes(r))
    }
    return found
  })
  return filteredData
}

function filterRecordsId (data, reportsId) {
  const filteredData = data.filter(f => {
    const t = f.properties.report_id
    let found = false
    if (t.length) {
      const featureTags = t.split(',').map(t => t.trim())
      found = featureTags.some(r => reportsId.includes(r))
    }
    return found
  })
  return filteredData
}

function filterObservations (data, layers, filters) {
  if (!data) return []
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

function getExtent (clusterId) {
  const leaves = index.getLeaves(clusterId, Infinity)
  let xmin = leaves[0].geometry.coordinates[0]
  let ymin = leaves[0].geometry.coordinates[1]
  let xmax = leaves[0].geometry.coordinates[0]
  let ymax = leaves[0].geometry.coordinates[1]
  leaves.forEach(l => {
    if (l.geometry.coordinates[0] < xmin) xmin = l.geometry.coordinates[0]
    else if (l.geometry.coordinates[0] > xmax) xmax = l.geometry.coordinates[0]

    if (l.geometry.coordinates[1] < ymin) ymin = l.geometry.coordinates[1]
    else if (l.geometry.coordinates[1] > ymax) ymax = l.geometry.coordinates[1]
  })
  return [xmin, ymin, xmax, ymax]
}

function getClusterByFeatureId (data) {
  const searchId = data.spiderfyId
  const fs = index.getClusters(data.bbox, parseInt(data.zoom))

  // First get all clusters within the view
  const clusters = fs.filter(f => {
    return f.properties.cluster
  })

  // Now get with cluster contains de searchId feature
  const parent = clusters.find(c => {
    const leaves = index.getLeaves(c.properties.cluster_id, Infinity)
    return leaves.find(l => {
      if (l.properties.id === searchId) {
        return c.properties.cluster_id
      } else {
        return false
      }
    })
  })
  return parent
}

self.onmessage = function (e) {
  let fitFeatures = false
  if (e.data.getClusterExpansionZoom && !e.data.spiderfyCluster) {
    // This is fired when the user clicks on a cluster.
    // Returns the zoom level to zoom in and the center.
    let z = parseInt(index.getClusterExpansionZoom(e.data.getClusterExpansionZoom))
    // Calculate the extent of the cluster to speed up zooming in
    const clusterExtent = getExtent(e.data.getClusterExpansionZoom)

    if (z >= 19) {
      z = 19
    }
    postMessage({
      expansionZoom: z,
      center: e.data.center,
      clusterExtent: clusterExtent
    })
  } else if (e.data.filters) {
    // This is fired when the map is filtered.
    all_layers = e.data.layers
    filters = e.data.filters
    let filteredData = []

    // Get the smallest dataset (reportFeatures) before start filtering
    if (filters.reportFeatures.length) {
      filteredData = filters.reportFeatures[0].features
    } else {
      if (filters.mode === 'increaseFilter') {
        filteredData = filteredDataset
      } else {
        filteredData = dataset
      }
    }
    if (filters.observations.length > 0) {
      filteredData = filterObservations(filteredData, e.data.layers, filters.observations)
    } else {
      filteredData = []
    }
    if (filters.dates.length > 0) {
      // array with only one date
      filteredData = filterDate(filteredData, filters.dates[0])
    }
    if (filters.hashtags.length > 0) {
      // TODO: Check for report_id filtering. That is a tag stating with :
      // array with only one date
      filteredData = filterTags(filteredData, filters.hashtags)
      fitFeatures = true
    }
    if (filters.report_id.length > 0) {
      // TODO: Check for report_id filtering. That is a tag stating with :
      // array with only one date
      filteredData = filterRecordsId(filteredData, filters.report_id)
      fitFeatures = true
    }
    if (filters.locations.length > 0) {
      if (filters.tolerance) {
        simplifyTolerance = filters.tolerance
      }
      const poly = JSON.parse(filters.locations[0]).features[0]
      filteredData = filterLocations(filteredData, poly)
    }
    // Update filteredDataset
    filteredDataset = filteredData
    loadMapData(filteredData, fitFeatures)
  } else if (e.data.spiderfyCluster) {
    let openPopupId = ''
    if (e.data.spiderfyId) {
      const cluster = getClusterByFeatureId(e.data)
      e.data.getClusterExpansionZoom = cluster.id
      e.data.center = cluster.geometry.coordinates
      openPopupId = e.data.spiderfyId
    }
    if (e.data.getClusterExpansionZoom) {
      postMessage({
        map: index.getClusters(e.data.bbox, parseInt(e.data.zoom)),
        spiderfyFeatures: index.getLeaves(e.data.getClusterExpansionZoom, Infinity),
        spiderfyCluster: e.data.spiderfyCluster,
        openPopupId: openPopupId,
        center: e.data.center,
        clusterId: e.data.getClusterExpansionZoom
      })
    } else {
      postMessage({
        map: index.getClusters(e.data.bbox, e.data.zoom),
        spiderfyCluster: e.data.spiderfyCluster,
        center: e.data.center
      })
    }
  }
  else if (e.data) {
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
      spiderfyCluster: e.data.spiderfyCluster,
      timeseries: {
        dates: dates,
        data: series
      }
    })
  }
}