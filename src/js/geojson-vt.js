import 'ol/ol.css'
import GeoJSON from 'ol/format/GeoJSON'
import Projection from 'ol/proj/Projection'
import VectorTileSource from 'ol/source/VectorTile'
import geojsonvt from 'geojson-vt'

// import VectorTileLayer from 'ol/layer/VectorTile'
// import Map from 'ol/Map'
// import View from 'ol/View'
// import {Fill, Style} from 'ol/style'

export function geojsonVT (map, layer, url) {
  const replacer = function (key, value) {
    if (!value || !value.geometry) {
      return value
    }

    let type
    const rawType = value.type
    let geometry = value.geometry
    if (rawType === 1) {
      type = 'MultiPoint'
      if (geometry.length === 1) {
        type = 'Point'
        geometry = geometry[0]
      }
    } else if (rawType === 2) {
      type = 'MultiLineString'
      if (geometry.length === 1) {
        type = 'LineString'
        geometry = geometry[0]
      }
    } else if (rawType === 3) {
      type = 'Polygon'
      if (geometry.length > 1) {
        type = 'MultiPolygon'
        geometry = [geometry]
      }
    }

    return {
      type: 'Feature',
      geometry: {
        type: type,
        coordinates: geometry
      },
      properties: value.tags
    }
  }

  fetch(url)
    .then(function (response) {
      return response.json()
    })
    .then(function (json) {
      const tileIndex = geojsonvt(json, {
        extent: 4096,
        debug: 1
      })
      const format = new GeoJSON({
        // Data returned from geojson-vt is in tile pixel units
        dataProjection: new Projection({
          code: 'TILE_PIXELS',
          units: 'tile-pixels',
          extent: [0, 0, 4096, 4096]
        })
      })
      const vectorSource = new VectorTileSource({
        tileUrlFunction: function (tileCoord) {
        // Use the tile coordinate as a pseudo URL for caching purposes
          return JSON.stringify(tileCoord)
        },
        tileLoadFunction: function (tile, url) {
          const tileCoord = JSON.parse(url)
          const data = tileIndex.getTile(
            tileCoord[0],
            tileCoord[1],
            tileCoord[2]
          )
          const geojson = JSON.stringify(
            {
              type: 'FeatureCollection',
              features: data ? data.features : []
            },
            replacer
          )
          const features = format.readFeatures(geojson, {
            extent: vectorSource.getTileGrid().getTileCoordExtent(tileCoord),
            featureProjection: map.getView().getProjection()
          })
          tile.setFeatures(features)
        }
      })
      layer.value.setSource(vectorSource)
    })
}

export default geojsonVT
