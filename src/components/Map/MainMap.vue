<template>
  <main class="size-screen mx-auto relative">
    <div class="map absolute h-screen w-screen" ref="mapContainer">
      <TimeSeries :timeSeriesData="originalDateAggregationData" />
    </div>
  </main>
</template>

<script setup lang="ts">
import { MapInfoControl } from '@/utils/mapControls'
import { cellToBoundary, latLngToCell } from 'h3-js'
import maplibregl, { type StyleSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import TimeSeries from './TimeSeries.vue'
import { useObservationsStore } from '../../stores/observationsStore'

type DataPoint = {
  uuid: string
  received_at: string
  point: {
    latitude: number
    longitude: number
  }
}

const observationsStore = useObservationsStore()

const mapContainer = ref<HTMLElement | null>(null)
const map = shallowRef<maplibregl.Map | null>(null) // Shallow ref to optimize performance of deep reactivity
const dataCache = ref<DataPoint[]>([]) // Cache for lazy loading
const processedResolutions = ref<Set<number>>(new Set()) // Track processed resolutions
const originalHexData = ref<Record<number, Record<string, any>>>({})
const originalDateAggregationData = ref<Record<string, number>>({})
const renderedHexData = ref<Record<number, Record<string, any>>>({})

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

const data = 'http://localhost:5173/observations_culicidae.json'
const data_geojson = 'http://localhost:5173/observations_culicidae.geojson'

// Function to get appropriate resolution based on zoom level
const getResolutionForZoom = (zoom: number): number => {
  if (zoom <= 4) return 4
  if (zoom <= 6) return 5
  return 6
}

const buildOriginalData = (resolution: number, data_objects: DataPoint[]) => {
  if (processedResolutions.value.has(resolution)) return

  const aggregateByDate: boolean = Object.keys(originalDateAggregationData.value).length == 0

  originalHexData.value[resolution] = {}

  for (const { point, received_at } of data_objects) {
    const hex = latLngToCell(point.latitude, point.longitude, resolution)
    if (!originalHexData.value[resolution][hex]) {
      originalHexData.value[resolution][hex] = {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [cellToBoundary(hex, true)],
        },
        properties: { hex, count: 1, date: received_at },
      }
    } else {
      originalHexData.value[resolution][hex].properties.count += 1
    }
    if (aggregateByDate) {
      const dateKey = received_at.split('T')[0] || received_at
      if (!originalDateAggregationData.value[dateKey]) {
        originalDateAggregationData.value[dateKey] = 1
      } else {
        originalDateAggregationData.value[dateKey] += 1
      }
    }
  }

  originalDateAggregationData.value = { ...originalDateAggregationData.value } // Trigger reactivity
  renderedHexData.value[resolution] = originalHexData.value[resolution] // Initialize rendered data
  processedResolutions.value.add(resolution)
}

const filterData = (resolution: number) => {
  const startingDate = observationsStore.dateFilter.start
  const endingDate = observationsStore.dateFilter.end

  renderedHexData.value[resolution] = {}

  for (const [hex, feature] of Object.entries(
    originalHexData.value[resolution] as Record<string, any>,
  )) {
    const featureDate = feature.properties.date
    if (featureDate >= startingDate! && featureDate <= endingDate!) {
      renderedHexData.value[resolution][hex] = feature
    }
  }
}

// Function to add/update H3 layer for a resolution
const addOrUpdateH3Layer = (resolution: number) => {
  if (!map.value || !renderedHexData.value[resolution]) return

  const sourceId = `h3-res-${resolution}`
  const layerId = `h3-layer-res-${resolution}`

  // Remove existing source and layer if they exist
  if (map.value.getLayer(layerId)) {
    map.value.removeLayer(layerId)
  }
  if (map.value.getSource(sourceId)) {
    map.value.removeSource(sourceId)
  }

  // Add new source and layer
  map.value.addSource(sourceId, {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: Object.values(renderedHexData.value[resolution]),
    },
  })

  map.value.addLayer({
    id: layerId,
    source: sourceId,
    type: 'fill',
    layout: {
      visibility: 'visible',
    },
    paint: {
      'fill-color': [
        'interpolate',
        ['linear'],
        ['get', 'count'],
        0,
        'rgba(255, 255, 204, 0.3)',
        50,
        'rgba(255, 200, 150, 0.6)',
        200,
        'rgba(255, 100, 50, 0.8)',
        500,
        'rgba(204, 0, 0, 0.9)',
      ],
      'fill-outline-color': 'rgba(255, 255, 255, 0.2)',
    },
  })
}

// Function to hide all H3 layers except the target one
const showOnlyResolution = (targetResolution: number | null) => {
  if (!map.value) return

  const allResolutions = [4, 5, 6]
  allResolutions.forEach((res) => {
    const layerId = `h3-layer-res-${res}`
    if (map.value!.getLayer(layerId)) {
      map.value!.setLayoutProperty(
        layerId,
        'visibility',
        res === targetResolution ? 'visible' : 'none',
      )
    }
  })

  // Handle observation points
  if (map.value.getLayer('observationsLayer')) {
    map.value.setLayoutProperty(
      'observationsLayer',
      'visibility',
      targetResolution === null ? 'visible' : 'none',
    )
  }
}

onMounted(async () => {
  if (mapContainer.value) {
    // Initialize map immediately for faster perceived load time
    map.value = new maplibregl.Map({
      container: mapContainer.value,
      center: [11.39831, 47.26244],
      zoom: 2,
    })
    if (!map.value) return

    // map.value.setStyle(styleEOX)
    // map.value.setStyle('https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json')
    map.value.setStyle('https://basemaps.cartocdn.com/gl/positron-gl-style/style.json')
    map.value.on('styledata', () => {
      map.value?.setProjection({ type: 'globe' })
    })
    map.value.addControl(
      new maplibregl.NavigationControl({
        visualizePitch: true,
        visualizeRoll: true,
        showZoom: true,
        showCompass: true,
      }),
      'bottom-right',
    )
    // Add geolocate control to the map.
    map.value.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserLocation: false,
      }),
      'bottom-right',
    )
    map.value.addControl(new maplibregl.FullscreenControl(), 'top-right')
    map.value.addControl(new MapInfoControl(), 'top-right')

    // Start data loading in background
    const dataPromise = fetch(data).then((resp) => resp.json())

    map.value.on('load', async () => {
      if (!map.value) return

      // Load and cache data
      dataCache.value = await dataPromise

      // Process initial resolution (3) for immediate display
      const initialZoom = map.value.getZoom()
      const initialResolution = getResolutionForZoom(initialZoom)

      buildOriginalData(initialResolution, dataCache.value)

      // Add observation points layer for high zoom levels
      map.value.addSource('observationsSource', {
        type: 'geojson',
        data: data_geojson,
        buffer: 0,
        maxzoom: 14,
      })

      map.value.addLayer({
        id: 'observationsLayer',
        source: 'observationsSource',
        type: 'circle',
        minzoom: 10,
        layout: {
          visibility: 'none',
        },
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 11, 3, 18, 10],
          'circle-color': '#FF5722',
          'circle-stroke-width': 1,
          'circle-stroke-color': '#FFFFFF',
        },
      })

      // Add initial H3 layer
      addOrUpdateH3Layer(initialResolution)

      // Handle zoom events for dynamic resolution switching
      const handleZoomChange = async () => {
        if (!map.value) return
        const zoom = map.value.getZoom()
        const targetResolution = getResolutionForZoom(zoom)

        if (zoom >= 10) {
          // Show individual points at high zoom
          showOnlyResolution(null)
        } else {
          // Process resolution if not already processed
          if (!processedResolutions.value.has(targetResolution)) {
            buildOriginalData(targetResolution, dataCache.value)
            filterData(targetResolution)
            addOrUpdateH3Layer(targetResolution)
          }

          // Show appropriate hexagon resolution
          showOnlyResolution(targetResolution)
        }
      }

      // TODO:
      // Debounced zoom event handler to prevent multiple calls
      // const debouncedZoomChange = () => {
      //   if (zoomTimeoutId) clearTimeout(zoomTimeoutId)
      //   zoomTimeoutId = setTimeout(handleZoomChange, 300)
      // }

      // Add zoom event listeners - only on zoomend to prevent constant processing
      map.value.on('zoomend', handleZoomChange)
    })
  }
})

watch(
  () => observationsStore.dateFilter,
  (newValue, oldValue) => {
    // Skip initial assignment, because initially the dateFilter has null values and has to be computed
    if (!oldValue.start && !oldValue.end) return
    // Clear processed resolutions to force reprocessing
    processedResolutions.value.clear()
    // Reprocess current zoom level
    if (map.value) {
      const zoom = map.value.getZoom()
      const targetResolution = getResolutionForZoom(zoom)
      filterData(targetResolution)
      addOrUpdateH3Layer(targetResolution)
      showOnlyResolution(zoom >= 10 ? null : targetResolution)
    }
  },
  { deep: true },
)

onUnmounted(() => {
  if (map.value) {
    map.value.remove()
  }
})
</script>
