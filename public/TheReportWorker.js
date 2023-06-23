/* global importScripts Supercluster */
importScripts('supercluster.min.js')

let index

self.onmessage = function (e) {
  if (e.data.features) {
    const geojsonFeatures = e.data.features.map(f => {
      return {
        type: 'Feature',
        properties: {
          c: f.private_webmap_layer
        },
        geometry: {
          type: 'Point',
          coordinates: [f.lon, f.lat]
        }
      }
    })

    index = new Supercluster({
      radius: 10,
      extent: 256,
      maxZoom: 19
    }).load(geojsonFeatures)
  }

  if (e.data.bbox && e.data.zoom) {
    postMessage({
      map: index.getClusters(e.data.bbox, parseInt(e.data.zoom))
    })
  }
}
