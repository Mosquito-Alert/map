<template>
  <main class="size-screen mx-auto relative">
    <div class="map absolute h-screen w-screen" ref="mapContainer"></div>
  </main>
</template>

<script setup lang="ts">
import { MapboxOverlay } from '@deck.gl/mapbox'
import { H3HexagonLayer, type PickingInfo } from 'deck.gl'
import { latLngToCell } from 'h3-js'
import maplibregl, { type StyleSpecification } from 'maplibre-gl'
import { onMounted, onUnmounted, ref, shallowRef } from 'vue'

type DataType = {
  hex: string
  count: number
}
type DataPoint = {
  uuid: string
  received_at: string
  point: {
    latitude: number
    longitude: number
  }
}
const mapContainer = ref<HTMLElement | null>(null)
const map = shallowRef<maplibregl.Map | null>(null) // Shallow ref to optimize performance of deep reactivity
const deckglLayers = ref<MapboxOverlay | null>(null)
const hex_data_res6 = ref<DataType[]>([])
const hex_data_res5 = ref<DataType[]>([])
const hex_data_res4 = ref<DataType[]>([])

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

const getH3HexagonLayer = (res: number) => {
  return new H3HexagonLayer<DataType>({
    id: `H3HexagonLayer_res${res}`,
    data: res === 6 ? hex_data_res6.value : res === 5 ? hex_data_res5.value : hex_data_res4.value,
    extruded: false,
    getHexagon: (d) => d.hex,
    getFillColor: (d) => [255, (1 - d.count / 500) * 255, 0],
    getElevation: (d) => d.count,
    elevationScale: 20,
    pickable: true,
    parameters: {
      depthCompare: 'always',
      cullMode: 'back',
    },
  })
}

function updateLayers() {
  const zoom = map.value?.getZoom() || 0

  if (zoom >= 12) {
    deckglLayers.value?.setProps({ layers: [] }) // Hide
    map.value?.setLayoutProperty('observationsLayer', 'visibility', 'visible')
  } else {
    deckglLayers.value?.setProps({
      layers: [getH3HexagonLayer(zoom >= 9 ? 6 : zoom >= 6 ? 5 : 4)],
      getTooltip: ({ object }: PickingInfo) => (!object ? null : `${object.count} Observations`),
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

    const counts_res6 = new Map<string, number>()
    const counts_res5 = new Map<string, number>()
    const counts_res4 = new Map<string, number>()

    for (const { point } of data_objects) {
      const hex_res6 = latLngToCell(point.latitude, point.longitude, 6)
      counts_res6.set(hex_res6, (counts_res6.get(hex_res6) ?? 0) + 1)
      const hex_res5 = latLngToCell(point.latitude, point.longitude, 5)
      counts_res5.set(hex_res5, (counts_res5.get(hex_res5) ?? 0) + 1)
      const hex_res4 = latLngToCell(point.latitude, point.longitude, 4)
      counts_res4.set(hex_res4, (counts_res4.get(hex_res4) ?? 0) + 1)
    }

    hex_data_res6.value = Array.from(counts_res6, ([hex, count]) => ({ hex, count }))
    hex_data_res5.value = Array.from(counts_res5, ([hex, count]) => ({ hex, count }))
    hex_data_res4.value = Array.from(counts_res4, ([hex, count]) => ({ hex, count }))

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

      deckglLayers.value = new MapboxOverlay({
        interleaved: true,
        layers: [],
        getTooltip: ({ object }: PickingInfo) => (!object ? null : `${object.count} Observations`),
      })

      updateLayers()

      map.value.on('zoom', updateLayers)
      map.value.addControl(deckglLayers.value)
      map.value.addControl(new maplibregl.NavigationControl())
    })
  }
})

onUnmounted(() => {
  if (map.value) {
    map.value.remove()
  }
})
</script>
