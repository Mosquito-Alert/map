<template>
  <main class="size-screen mx-auto relative">
    <div class="map absolute h-screen w-screen" ref="mapContainer"></div>
  </main>
</template>

<script setup lang="ts">
import maplibregl from 'maplibre-gl'
import { cogProtocol } from '@geomatico/maplibre-cog-protocol'
import { onMounted, onUnmounted, ref } from 'vue'

const mapContainer = ref<HTMLElement | null>(null)
const map = ref<maplibregl.Map | null>(null)

async function modifyMapStyle() {
  const url = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'

  try {
    // Fetch and parse JSON
    const response = await fetch(url)
    const styleJson = await response.json()

    // Modify the "type" property under sources.carto
    styleJson.projection = { type: 'globe' }

    console.log(styleJson)
    return styleJson
  } catch (error) {
    console.error('Error fetching or modifying JSON:', error)
  }
}
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

const data = 'http://localhost:5173/observations_culicidae.geojson'

onMounted(async () => {
  const styleCARTO = await modifyMapStyle()
  if (mapContainer.value) {
    maplibregl.addProtocol('cog', cogProtocol)

    map.value = new maplibregl.Map({
      container: mapContainer.value,
      // style: styleCARTO,
      style: styleEOX,
      center: [11.39831, 47.26244],
      zoom: 2,
    })

    map.value.on('load', () => {
      map.value.addSource('observationsSource', {
        type: 'geojson',
        data,
        // tileSize: 256,
      })
      map.value.addLayer({
        id: 'observationsLayer',
        source: 'observationsSource',
        type: 'circle',
        minzoom: 9,
        paint: {
          'circle-radius': 3,
          'circle-color': '#FF5722',
          'circle-stroke-width': 1,
          'circle-stroke-color': '#FFFFFF',
        },
      })
    })
  }
})

onUnmounted(() => {
  if (map.value) {
    map.value.remove()
  }
})
</script>
