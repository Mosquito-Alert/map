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
// let simplifyTolerance = null
let YEARS = []
const initialYear = 2014
const currentYear = new Date().getFullYear()
let getdataUrl = ''
let getAllDates = false
let firstDate = new Date()
let lastDate = new Date()
firstDate = firstDate.toISOString().split('T')[0]
lastDate = lastDate.toISOString().split('T')[0]

for (let a = initialYear; a <= currentYear; a++) {
  YEARS.push({ year: a, data: {} })
}

function log (text) {
  if (DEBUG) console.log('[TheMapWorker]', text)
}

// Download data and send message when ready including first and last date in dataset
function getData (year, flag = false) {
  fetch(getdataUrl + year +'/')
    .then(function (response) {
      return response.json()
    })
    .then(function (geojson) {
      dataset = geojson.features
      const index = YEARS.findIndex(y => {
        return (y.year === year)
      })
      YEARS[index].data = JSON.parse(JSON.stringify(geojson.features))

      if (flag) {
        loadMapData(YEARS[index].data, false)
      }
    })
}

function getMissingYears (date) {
  let sYear, eYear
  const d = date[0]

  if (d.from === '') {
    getAllDates = true
    sYear = YEARS[0].year
    eYear = YEARS[YEARS.length - 1].year
  } else {
    sYear = parseInt(d.from.substring(0, 4))
    eYear = parseInt(d.to.substring(0, 4))
  }

  const missing = YEARS.filter(set => {
    if ((set.year < sYear) || (set.year > eYear)) {
      return false
    } else {
      return Object.keys(set.data).length === 0
    }
  })
  return missing
}

self.onmessage = async function (e) {
  if (e.data.fetchUrl) {
    const year = e.data.year
    getdataUrl = e.data.fetchUrl
    getData(year, getdataUrl)
    return
  }
  // console.log(e.data)
  if (e.data.filters) {
    // Worker vars are init before time worker is called
    filters = e.data.filters
    all_layers = e.data.layers
    filteredData = []
    getAllDates = false
    const missing = getMissingYears(e.data.filters.dates)
    if (missing.length) {
      await Promise.all(missing.map(m =>
        fetch(getdataUrl + m.year).then(resp => resp.json())
      )).then(jsons => {
        // Check for errors
        jsons.forEach(j => {
          if ('status' in j) {
            console.log(j.msg)
          } else {
            const y = j.year
            const index = YEARS.findIndex(element => {
              return element.year === y
            })
            // Get first feature date
            if (j.features[0].properties.d < firstDate) {
              firstDate = j.features[0].properties.d
            }
            // Get last feature date
            if (j.features[j.features.length - 1].properties.d > lastDate) {
              lastDate = j.features[j.features.length - 1].properties.d
            }
            YEARS[index].data = JSON.parse(JSON.stringify(j.features))
            dataset = dataset.concat(j.features)
          }
        })
      })
    }
  }

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
    // Get the smallest dataset (featuresSet) before start filtering
    if (filters.featuresSet.length) {
      filteredData = filters.featuresSet[0].features
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
      // if (filters.tolerance) {
      //   simplifyTolerance = filters.tolerance
      // }
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

function loadMapData (data, fitFeatures) {
  index = new Supercluster({
    log: DEBUG,
    radius: 10,
    extent: 256,
    maxZoom: 19
    // ,minPoints: 5
  }).load(data)

  unclustered = new Supercluster({
    log: DEBUG,
    radius: 1,
    extent: 256,
    maxZoom: 1
  }).load(data)

  const workerParams = {
    indexing: filters.lastFilterApplied,
    ready: true,
    minMaxDates: { min: firstDate, max: lastDate },
    datesInterval: {
      from: dataset[0].properties.d,
      to: dataset[dataset.length - 1].properties.d
    },
  }
  if (getAllDates) {
    workerParams.getAllDates = true
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
  // else {
  //   polyCoords = poly.geometry.coordinates
  //   turfPoligon = turf.multiPolygon([polyMercator.geometry.coordinates])
  // }

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

// function getJSON (url, callback) {
//   const xhr = new XMLHttpRequest()
//   xhr.open('GET', url, true)
//   xhr.responseType = 'json'
//   xhr.setRequestHeader('Accept', 'application/json')
//   xhr.onload = function () {
//     if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 300 && xhr.response) {
//       callback(xhr.response)
//     }
//   }
//   xhr.send()
// }

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
