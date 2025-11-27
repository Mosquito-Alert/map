<template>
  <main class="size-screen mx-auto relative">
    <div class="map absolute h-screen w-screen" ref="mapContainer"></div>
  </main>
</template>

<script setup lang="ts">
import { MapboxOverlay } from '@deck.gl/mapbox'
import { latLngToCell } from 'h3-js'
import {
  _GlobeView,
  ContourLayer,
  GeoJsonLayer,
  H3HexagonLayer,
  HeatmapLayer,
  HexagonLayer,
  type Color,
  type PickingInfo,
} from 'deck.gl'
import maplibregl, { type StyleSpecification } from 'maplibre-gl'
import { onMounted, onUnmounted, ref, shallowRef } from 'vue'

const mapContainer = ref<HTMLElement | null>(null)
const map = shallowRef<maplibregl.Map | null>(null) // Shallow ref to optimize performance of deep reactivity
const deckglLayers = ref<MapboxOverlay | null>(null)

const styleEOX: StyleSpecification = {
  version: 8,
  sources: {
    satellite: {
      tiles: [
        // 'https://tiles.maps.eox.at/wmts/1.0.0/overlay_base/default/WGS84/{z}/{y}/{x}.jpg',
        'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg',
      ],
      type: 'raster',
    },
  },
  layers: [
    {
      id: 'Satellite',
      type: 'raster',
      source: 'satellite',
    },
  ],
  sky: {
    'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 1, 5, 1, 7, 0],
  },
  light: {
    anchor: 'map',
    position: [1.5, 90, 80],
  },
}

// const data = 'http://localhost:5173/observations_culicidae.json'
// const data_geojson = 'http://localhost:5173/observations_culicidae.geojson'
const data_geojson = 'http://161.111.254.237:5173/observations_culicidae.geojson'
const data = 'http://161.111.254.237:5173/observations_culicidae.json'
// DECK.GL LAYERS
const colorRange: Color[] = [
  [1, 152, 189],
  [73, 227, 206],
  [216, 254, 181],
  [254, 237, 177],
  [254, 173, 84],
  [209, 55, 78],
]
// type DataPoint = [longitude: number, latitude: number]
type DataPoint = {
  uuid: string
  received_at: string
  point: {
    latitude: number
    longitude: number
  }
}

const getRadiusForZoom = (zoom: number) => {
  if (zoom < 4) return 25000
  if (zoom < 7) return 10000
  if (zoom < 10) return 5000
  return 1000
}

const getTooltip = ({ object }: PickingInfo) => {
  if (!object) {
    return null
  }

  return `${object.count} Observations`
}

function updateLayers() {
  const zoom = map.value?.getZoom() || 0
  const radius = getRadiusForZoom(zoom)

  if (zoom >= 12) {
    deckglLayers.value?.setProps({ layers: [] }) // Hide
    map.value?.setLayoutProperty('observationsLayer', 'visibility', 'visible')
  } else {
    deckglLayers.value?.setProps({
      layers: [
        new HexagonLayer({
          id: 'hex-layer',
          data,
          gpuAggregation: false,
          getPosition: (d: DataPoint) => [d.point.longitude, d.point.latitude],
          colorAggregation: 'COUNT',
          extruded: false,
          radius: radius,
          pickable: true,
          colorRange,
          coverage: 0.995,
        }),
      ],
      getTooltip,
    })
    map.value?.setLayoutProperty('observationsLayer', 'visibility', 'none')
  }
}

onMounted(async () => {
  if (mapContainer.value) {
    map.value = new maplibregl.Map({
      container: mapContainer.value,
      center: [11.39831, 47.26244],
      zoom: 2,
    })
    if (!map.value) return
    // map.value.setStyle(styleEOX)
    map.value.setStyle('https://basemaps.cartocdn.com/gl/positron-gl-style/style.json')
    map.value.on('styledata', () => {
      map.value?.setProjection({ type: 'globe' })
    })

    const data_objects: DataPoint[] = await fetch(data).then((resp) => resp.json())
    const h3_resolution = 5

    console.time('H3 aggregation')
    const aggregated_data = data_objects.reduce(
      (acc, current) => {
        const h3_cell = latLngToCell(current.point.latitude, current.point.longitude, h3_resolution)
        acc[h3_cell] = acc[h3_cell]
          ? { h3_cell, count: acc[h3_cell].count + 1 }
          : { h3_cell, count: 1 }
        return acc
      },
      {} as Record<string, { h3_cell: string; count: number }>,
    )
    console.timeEnd('H3 aggregation')

    map.value.on('load', () => {
      if (!map.value) return
      map.value.addSource('observationsSource', {
        type: 'geojson',
        data: data_geojson,
        // tileSize: 256,
      })

      map.value.addLayer({
        id: 'observationsLayer',
        source: 'observationsSource',
        type: 'circle',
        minzoom: 9,
        layout: {
          visibility: 'none',
        },
        paint: {
          'circle-radius': 3,
          'circle-color': '#FF5722',
          'circle-stroke-width': 1,
          'circle-stroke-color': '#FFFFFF',
        },
      })

      type DataType = {
        h3_cell: string
        count: number
      }

      deckglLayers.value = new MapboxOverlay({
        interleaved: true,
        layers: [
          new H3HexagonLayer<DataType>({
            id: 'H3HexagonLayer',
            data: Object.values(aggregated_data),

            extruded: false,
            getHexagon: (d) => d.h3_cell,
            getFillColor: (d) => [255, (1 - d.count / 500) * 255, 0],
            getElevation: (d) => d.count,
            elevationScale: 20,
            pickable: true,
            parameters: {
              depthCompare: 'always',
              cullMode: 'back',
            },
          }),
        ],
        getTooltip,
      })
      // map.value.on('zoom', updateLayers)

      map.value.addControl(deckglLayers.value)
      map.value.addControl(new maplibregl.NavigationControl())
    })
    // updateLayers()
  }
})

onUnmounted(() => {
  if (map.value) {
    map.value.remove()
  }
})
</script>
