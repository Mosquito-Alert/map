<template>
  <main class="size-screen mx-auto relative">
    <div class="absolute h-screen w-screen" ref="mapContainer"></div>
  </main>
</template>

<script setup lang="ts">
import maplibregl from 'maplibre-gl'
import { cogProtocol } from '@geomatico/maplibre-cog-protocol'
import { onMounted, onUnmounted, ref } from 'vue'
// import { HexagonLayer, ScatterplotLayer, type Color } from 'deck.gl'
// import { MapboxOverlay } from '@deck.gl/mapbox'

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
const styleCARTO = await modifyMapStyle()

// const colorRange: Color[] = [
//   [1, 152, 189],
//   [73, 227, 206],
//   [216, 254, 181],
//   [254, 237, 177],
//   [254, 173, 84],
//   [209, 55, 78],
// ]
const data = 'http://localhost:5173/src/assets/observations_culicidae.geojson'
// type DataPoint = [longitude: number, latitude: number]
// const deckLayers = [
//   new HexagonLayer<DataPoint>({
//     id: 'heatmap',
//     gpuAggregation: true,
//     colorRange,
//     coverage: 1,
//     data,
//     elevationRange: [0, 3000],
//     elevationScale: data && data.length ? 50 : 0,
//     extruded: true,
//     getPosition: (d) => d,
//     pickable: true,
//     radius: 1000,
//     upperPercentile: 100,
//     material: {
//       ambient: 0.64,
//       diffuse: 0.6,
//       shininess: 32,
//       specularColor: [51, 51, 51],
//     },
//     transitions: {
//       elevationScale: 3000,
//     },
//   }),
// ]

onMounted(async () => {
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
      //   // const deckOverlay = new MapboxOverlay({
      //   //   interleaved: true,
      //   //   layers: deckLayers,
      //   // })
      //   const deckOverlay = new MapboxOverlay({
      //     interleaved: true,
      //     layers: [
      //       new ScatterplotLayer({
      //         id: 'deckgl-circle',
      //         data: [{ position: [0.45, 51.47] }],
      //         getPosition: (d) => d.position,
      //         getFillColor: [255, 0, 0, 100],
      //         getRadius: 1000,
      //         beforeId: 'watername_ocean', // In interleaved mode render the layer under map labels
      //       }),
      //     ],
      //   })
      //   map.value.addControl(deckOverlay)
      // })
      // * OBSERVATION PONTS
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
    // // * RM0
    // map.value.on('load', () => {
    //   map.value.addSource('cogSource', {
    //     type: 'raster',
    //     url: 'cog://http://localhost:8080/tiles/metricvalues/rasters/2025-09-04T00:00.tiff#color:BrewerReds3,0,6,-c',
    //     // url: 'cog://http://localhost:8080/tiles/metricvalues/rasters/output_cog_res6_deflate_6k.tif#color:BrewerReds3,0,6,-c',
    //     // url: 'cog://https://maplibre.org/maplibre-gl-js/docs/assets/cog.tif',
    //     // tileSize: 256,
    //   })
    //   map.value.addLayer({
    //     id: 'cogLayer',
    //     source: 'cogSource',
    //     type: 'raster',
    //   })
    // })
  }
})

onUnmounted(() => {
  if (map.value) {
    map.value.remove()
  }
})
</script>
