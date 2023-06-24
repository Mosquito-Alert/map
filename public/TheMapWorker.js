  /* global importScripts Supercluster */
importScripts('supercluster.min.js')
importScripts('https://cdn.jsdelivr.net/npm/@turf/turf@5/turf.min.js')
importScripts('moment.js')

let dataset = []
let filteredDataset = []
const LAYER_TYPES = ['observations', 'otherObservations', 'breeding', 'bites']
const DEBUG = false
let cluseredIndex, unclusteredIndex
const now = Date.now()
let filters = {
  lastFilterApplied: false
}
let all_layers = null
// let simplifyTolerance = null
let YEARS = []
const initialYear = 2014
const currentYear = new Date(Date.now()).getFullYear()
let getdataUrl = ''
let getAllDates = false
let firstDate = '01-01-' + moment(new Date(Date.now())).format('YYYY')
let lastDate = moment(new Date(Date.now())).format('YYYY-MM-DD')
let loadSharedView = false
let graphData = null
let fitFeatures = false

for (let a = initialYear; a <= currentYear; a++) {
  YEARS.push({ year: a, data: {} })
}

function log (text) {
  if (DEBUG) console.log('[TheMapWorker]', text)
}

self.onmessage = async function (e) {
  loadSharedView = isSharingView(e.data.loadSharedView)
  if (e.data.initData) {
    // If it is first app call 
    indexInitialMapView(e.data.data)
    return
  }
  if (e.data.filters) {
    // Init worker vars
    filters = e.data.filters
    all_layers = e.data.layers
    filteredData = []
    getAllDates = false
    if (e.data.dataset) {
      dataset = e.data.dataset
    }
  }

  fitFeatures = false
  if (clickOnMapCluster(e.data)) {
    // Returns the zoom level to zoom in and the center.
    let z = parseInt(cluseredIndex.getClusterExpansionZoom(e.data.getClusterExpansionZoom))
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
  } else if (e.data.spiderfyCluster) {
    // Cluster must be spiderfied
    let openPopupId = ''
    if (e.data.spiderfyId && e.data.dataset) {
      // Sharing spiderfied view
      filteredData = dataset
      filteredData = doFilters(filters, e.data.layers)
      cluseredIndex = doClusteredIndex(filteredData)
      const cluster = getClusterByFeatureId(e.data)
      e.data.getClusterExpansionZoom = cluster.id
      e.data.center = cluster.geometry.coordinates
      openPopupId = e.data.spiderfyId
    }
    if (e.data.getClusterExpansionZoom) {
      // Send data to spiderfy cluster
      postMessage({
        map: cluseredIndex.getClusters(e.data.bbox, parseInt(e.data.zoom)),
        spiderfyFeatures: cluseredIndex.getLeaves(e.data.getClusterExpansionZoom, Infinity),
        spiderfyCluster: e.data.spiderfyCluster,
        openPopupId: openPopupId,
        center: e.data.center,
        clusterId: e.data.getClusterExpansionZoom
      })
    } else {
      postMessage({
        map: cluseredIndex.getClusters(e.data.bbox, e.data.zoom),
        spiderfyCluster: e.data.spiderfyCluster,
        center: e.data.center
      })
    }
  } else if (e.data.filters) {
    // Do new index
    // Get the smallest dataset (maybe featuresSet) before start filtering
    filteredData = getDefaultData(filters, dataset)
    // Filter observations that pass filters
    filteredData = doFilters(filters, e.data.layers)
    // Update filteredDataset
    filteredDataset = filteredData
    loadMapData(filteredData, fitFeatures, false)
  } else if (e.data) {
    // When map is just panned
    if (filters.observations) {
      grahData = getGraphData (e, filteredData)
      postMessage({
        timeseries: grahData
      })
    }
  }
}

function getGraphData (e, dataset) {
  if (!unclusteredIndex){
    uncluseredIndex = doUnclusteredIndex(dataset)
  }
  const time = uncluseredIndex.getClusters(e.data.bbox, e.data.zoom)
  const map = cluseredIndex.getClusters(e.data.bbox, e.data.zoom)

  postMessage({
    map: map,
    spiderfyCluster: e.data.spiderfyCluster
  })

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
  let key
  time.forEach(feature => {
    if (time.length < 1000000) {
      key = feature.properties.d
    } else if (time.length < 15000) {
      key = moment(feature.properties.d).startOf('week').format('YYYY-MM-DD')
    } else {
      key = moment(feature.properties.d).startOf('month').format('YYYY-MM-DD')
    }

    if (!(key in temp)) temp[key] = {}

    const dateSeries = temp[key]
    const type = seriesMap[feature.properties.c]

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

  return {
    dates: dates,
    data: series
  }
}

function doClusteredIndex (data) {
  return new Supercluster({
    log: DEBUG,
    radius: 10,
    extent: 256,
    maxZoom: 19
  }).load(data)
}

function doUnclusteredIndex (data) {
  return new Supercluster({
    log: DEBUG,
    radius: 1,
    extent: 256,
    maxZoom: 0,
    minPoints: 10000
  }).load(data)
}

function loadMapData (data, fitFeatures, initData) {
  cluseredIndex = doClusteredIndex(data)
  uncluseredIndex = doUnclusteredIndex(data)
  const workerParams = {
    indexing: filters.lastFilterApplied,
    ready: true,
    minMaxDates: { min: firstDate, max: lastDate },
    datesInterval: {
      from: dataset.length ? dataset[0].properties.d : '01-01-' + moment(new Date(Date.now())).format('YYYY'),
      to: dataset.length ? dataset[dataset.length - 1].properties.d : moment(new Date(Date.now())).format('DD') + '-01-2023'
    }
  }
  if (getAllDates) {
    workerParams.getAllDates = true
  }

  if (initData) {
    workerParams.initData = true
  }

  if (loadSharedView) {
    workerParams.loadSharedView = true
  } else {
    workerParams.loadSharedView = false
  }

  if (fitFeatures) {
    workerParams.features = data
  }
  postMessage(workerParams)
}

function filterDate (data, date) {
  // If date.from is empty, it means no date filter applies
  if (!date.from) return data
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
  }

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

  // from candidates get points inside poly
  filtered = candidates.filter(point => {
    const pt = turf.toMercator(point)
    const ptCoords = pt.geometry.coordinates
    return turf.booleanPointInPolygon(ptCoords, polyMercator)
  })

  return filtered
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
  if (!data || !data.length) return []
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

function getExtent (clusterId) {
  const leaves = cluseredIndex.getLeaves(clusterId, Infinity)
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

// Get a feature Id and return the cluster that contains that feature
function getClusterByFeatureId (data) {
  const searchId = data.spiderfyId
  const fs = cluseredIndex.getClusters(data.bbox, data.zoom)
  // First get all clusters within the view
  const clusters = fs.filter(f => {
    return f.properties.cluster
  })
  // Now get with cluster contains de searchId feature
  const parent = clusters.find(c => {
    const leaves = cluseredIndex.getLeaves(c.properties.cluster_id, Infinity)
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

function isSharingView (param) {
  if (param){
    return true
  } else {
    return false
  }
}

// Index default map data
function indexInitialMapView (data) {
  // Init dataset var for the rest of calls
  dataset = data.features
  loadMapData(dataset, false, true)
}

function clickOnMapCluster (param) {
  return (param.getClusterExpansionZoom && !param.spiderfyCluster)
}

function getDefaultData (filters, dataset) {
  if (filters.featuresSet.length) {
    return filters.featuresSet[0].features
  } else {
    if (filters.mode === 'increaseFilter') {
      return filteredDataset
    } else {
      return dataset
    }
  }
}

function doFilters(filters, layers) {
  if (filters.observations.length > 0) {
    filteredData = filterObservations(filteredData, layers, filters.observations)
  } else {
    filteredData = []
  }
  if (filters.dates.length > 0) { 
    // array with only one date
    if (filters.dates[0].from === '') {
      getAllDates = true
    }
    filteredData = filterDate(filteredData, filters.dates[0])
  }
  if (filters.hashtags.length > 0) {
    if (filters.lastFilterApplied === 'hashtags') {
      fitFeatures = true
    }
  }
  if (filters.report_id.length > 0) {
    filteredData = filterRecordsId(filteredData, filters.report_id)
    if (filters.lastFilterApplied === 'reports') {
      fitFeatures = true
    }
  }
  if (filters.locations.length > 0) {
    const poly = JSON.parse(filters.locations[0]).features[0]
    filteredData = filterLocations(filteredData, poly)
  }
  return filteredData
}