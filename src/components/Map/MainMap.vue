<template>
  <main class="size-screen mx-auto relative">
    <div class="map absolute h-screen w-screen" ref="mapContainer"></div>
  </main>
</template>

<script setup lang="ts">
import { MapboxOverlay } from '@deck.gl/mapbox'
import { _GlobeView, HexagonLayer, type Color } from 'deck.gl'
import maplibregl from 'maplibre-gl'
import { onMounted, onUnmounted, ref } from 'vue'

const mapContainer = ref<HTMLElement | null>(null)
const map = ref<maplibregl.Map | null>(null)
const deckglLayers = ref<HexagonLayer<any> | null>(null)

const styleEOX = {
  version: 8,
  projection: {
    type: 'globe',
  },
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

const data = 'http://localhost:5173/observations_culicidae.json'
// const data = 'http://161.111.254.237:5173/observations_culicidae.json'
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
type PropertiesType = {
  uuid: string
  received_at: string
}

function getRadiusForZoom(zoom) {
  if (zoom < 4) return 25000
  if (zoom < 7) return 10000
  if (zoom < 10) return 5000
  return 1000
}

function updateLayers() {
  const zoom = map.value.getZoom()
  const radius = getRadiusForZoom(zoom)

  deckglLayers.value.setProps({
    layers: [
      new HexagonLayer({
        id: 'hex-layer',
        data,
        gpuAggregation: false,
        getPosition: (d: DataPoint) => [d.point.longitude, d.point.latitude],
        getColorWeight: 1,
        colorAggregation: 'COUNT',
        extruded: false,
        radius: radius,
        pickable: false,
        colorRange,
        coverage: 0.995,
      }),
    ],
  })
}

onMounted(async () => {
  if (mapContainer.value) {
    map.value = new maplibregl.Map({
      container: mapContainer.value,
      center: [11.39831, 47.26244],
      zoom: 2,
    })

    // map.value.setStyle('https://basemaps.cartocdn.com/gl/positron-gl-style/style.json', {
    //   transformStyle: (previousStyle, nextStyle) => {
    //     nextStyle.projection = { type: 'globe' }
    //     return nextStyle
    //   },
    // })
    map.value.setStyle(styleEOX)

    deckglLayers.value = new MapboxOverlay({
      views: new _GlobeView(),
      layers: [],
      controller: false, // MapLibre handles interaction
    })
    map.value.on('zoom', updateLayers)

    map.value.addControl(deckglLayers.value)

    updateLayers()
  }
})

onUnmounted(() => {
  if (map.value) {
    map.value.remove()
  }
})
</script>
