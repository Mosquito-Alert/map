<template>
  <main class="size-screen mx-auto relative">
    <div class="map absolute h-screen w-screen" ref="mapContainer">
      <div class="absolute bottom-10 right-2 z-10 flex flex-row items-end">
        <TimeSeries :timeSeriesData="originalDateAggregationData" />
        <MapLegend v-if="mapStore.showLegend" :mapColors="mapColors[currentResolution as number]" />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { MapInfoControl, MapLegendControl } from '@/utils/mapControls'
import { cellToBoundary, latLngToCell } from 'h3-js'
import maplibregl, { type StyleSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import TimeSeries from './TimeSeries.vue'
import MapLegend from './MapLegend.vue'
import { useObservationsStore } from '../../stores/observationsStore'
import { useMapStore } from '../../stores/mapStore'
import { quantile } from '../../utils/utils'

type ObservationFeatureCollection = GeoJSON.FeatureCollection<
  GeoJSON.Point,
  {
    uuid: string
    received_at: string
    ts?: number
    day?: number
  }
>

const DAY_MS = 86_400_000 // Number of milliseconds in a day

const observationsStore = useObservationsStore()
const mapStore = useMapStore()

const mapContainer = ref<HTMLElement | null>(null)
const map = shallowRef<maplibregl.Map | null>(null) // Shallow ref to optimize performance of deep reactivity
const geojsonCache = ref<ObservationFeatureCollection | null>(null)
const processedResolutions = ref<Set<number>>(new Set()) // Track processed resolutions
const currentResolution = ref<number | null>(null)
const originalHexData = ref<Record<number, Record<string, any>>>({})
const originalDateAggregationData = ref<Record<string, number>>({})
const renderedHexData = ref<Record<number, Record<string, any>>>({})
const ascSortedArrHexCounts = ref<number[]>([]) // Sorted array of hex counts for quantile calculation
const mapColors = ref<Record<number, Record<string, { value: number; color: string }>>>({}) // Color mapping for current resolution

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

const data_geojson = 'http://localhost:5173/observations_culicidae.geojson'

// Function to get appropriate resolution based on zoom level
const getResolutionForZoom = (zoom: number): number => {
  if (zoom <= 4) return 4
  if (zoom <= 6) return 5
  return 6
}

const buildOriginalData = () => {
  const resolution = currentResolution.value as number
  console.log('Building original data for resolution:', resolution)
  if (!geojsonCache.value) return

  if (!processedResolutions.value.has(resolution)) {
    // Determine if we need to aggregate by date (this is done only once)
    const aggregateByDate: boolean = Object.keys(originalDateAggregationData.value).length == 0

    originalHexData.value[resolution] = {}

    for (const feature of geojsonCache.value!.features) {
      const [lng, lat] = feature.geometry.coordinates as [number, number]
      const receivedAt = feature.properties.received_at

      // ------------------------------------------------
      // Timestamp + day precomputation (ONCE)
      // ------------------------------------------------
      let ts = feature.properties.ts
      let day = feature.properties.day

      if (ts === undefined || day === undefined) {
        ts = Date.parse(receivedAt)
        day = ts - (ts % DAY_MS)
        feature.properties.ts = ts
        feature.properties.day = day
      }

      // ------------------------------------------------
      // H3 aggregation
      // ------------------------------------------------
      const hex = latLngToCell(lat, lng, resolution)
      let hexFeature = originalHexData.value[resolution][hex]

      if (!hexFeature) {
        hexFeature = originalHexData.value[resolution][hex] = {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [cellToBoundary(hex, true)],
          },
          properties: {
            hex,
            countsByDay: new Map<number, number>(),
            count: 0,
          },
        }
      }

      // ------------------------------------------------
      // Per-hex histogram update
      // ------------------------------------------------
      const countsByDay = hexFeature.properties.countsByDay
      countsByDay.set(day, (countsByDay.get(day) ?? 0) + 1)
      hexFeature.properties.count += 1

      //  ------------------------------------------------
      // Global date aggregation (once)
      // ------------------------------------------------
      if (aggregateByDate) {
        originalDateAggregationData.value[day] = (originalDateAggregationData.value[day] ?? 0) + 1
      }
    }

    // Trigger reactivity once
    if (aggregateByDate) {
      originalDateAggregationData.value = { ...originalDateAggregationData.value }
    }
    processedResolutions.value.add(resolution)
  }

  // Initialize rendered data
  renderedHexData.value[resolution] = originalHexData.value[resolution] as Record<string, any>
}

const filterData = () => {
  const resolution = currentResolution.value as number
  const { start, end } = observationsStore.dateFilter
  const startingDate = start ? Date.parse(start) : -Infinity
  const endingDate = end ? Date.parse(end) : Infinity

  renderedHexData.value[resolution] = {}
  ascSortedArrHexCounts.value = []

  for (const [hex, feature] of Object.entries(
    originalHexData.value[resolution] as Record<string, any>,
  )) {
    let count = 0

    for (const [day, c] of feature.properties.countsByDay) {
      if (day >= startingDate && day <= endingDate) {
        count += c
      }
    }

    if (count > 0) {
      renderedHexData.value[resolution][hex] = {
        ...feature,
        properties: {
          ...feature.properties,
          count,
        },
      }
    }
  }
}

const getMapColors = () => {
  const resolution = currentResolution.value as number
  if (!renderedHexData.value[resolution]) return

  if (ascSortedArrHexCounts.value.length === 0) {
    ascSortedArrHexCounts.value = Object.values(renderedHexData.value[resolution]).map(
      (f: any) => f.properties.count,
    )
    ascSortedArrHexCounts.value.sort((a, b) => a - b)
  }
  mapColors.value[resolution] = {
    '0': { value: 0, color: 'rgba(255, 255, 204, 0.2)' },
    '25': {
      value: quantile(ascSortedArrHexCounts.value, 0.25),
      color: 'rgba(255, 200, 150, 0.35)',
    },
    '50': { value: quantile(ascSortedArrHexCounts.value, 0.5), color: 'rgba(255, 100, 50, 0.5)' },
    '75': { value: quantile(ascSortedArrHexCounts.value, 0.75), color: 'rgba(255, 50, 20, 0.7)' },
    max: { value: quantile(ascSortedArrHexCounts.value, 0.95), color: 'rgba(204, 0, 0, 0.9)' }, // Cap at 95th percentile to avoid outliers
    actualMax: {
      value: ascSortedArrHexCounts.value[ascSortedArrHexCounts.value.length - 1] || 0,
      color: 'rgba(204, 0, 0, 0.9)',
    },
  }

  // Ensure quantiles are different, adding small offsets if necessary
  for (let i = 0; i < Object.keys(mapColors.value[resolution]).length - 1; i++) {
    const previousKey = i > 0 ? Object.keys(mapColors.value[resolution])[i - 1] : null
    const currentKey = Object.keys(mapColors.value[resolution])[i] as string
    if (
      previousKey &&
      mapColors.value[resolution][currentKey] &&
      mapColors.value[resolution][previousKey] &&
      mapColors.value[resolution][currentKey].value ===
        mapColors.value[resolution][previousKey].value
    ) {
      mapColors.value[resolution][currentKey].value += 0.1
    }
  }
}

// Function to add/update H3 layer for a resolution
const addOrUpdateH3Layer = () => {
  const resolution = currentResolution.value as number
  const mapInstance = map.value

  if (!mapInstance) return
  const dataForRes = renderedHexData.value[resolution]
  const colorsForRes = mapColors.value[resolution]

  if (!dataForRes || !colorsForRes) return

  const sourceId = `h3-res-${resolution}`
  const layerId = `h3-layer-res-${resolution}`

  const featureCollection: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: Object.values(dataForRes),
  }

  // --------------------------------------------------
  // Source: create once, then update via setData()
  // --------------------------------------------------
  const existingSource = mapInstance.getSource(sourceId) as maplibregl.GeoJSONSource | undefined

  if (existingSource) {
    existingSource.setData(featureCollection)
  } else {
    mapInstance.addSource(sourceId, {
      type: 'geojson',
      data: featureCollection,
    })
  }

  // --------------------------------------------------
  // Layer: create once
  // --------------------------------------------------
  if (!mapInstance.getLayer(layerId)) {
    mapInstance.addLayer({
      id: layerId,
      source: sourceId,
      type: 'fill',
      layout: {
        visibility: 'visible',
      },
      paint: {
        'fill-outline-color': 'rgba(255, 255, 255, 0.2)',
      },
    })
  }

  // --------------------------------------------------
  // Paint: update color stops dynamically
  // --------------------------------------------------
  const colorStops = Object.values(colorsForRes).flatMap((stop) => [stop.value, stop.color])

  mapInstance.setPaintProperty(layerId, 'fill-color', [
    'interpolate',
    ['linear'],
    ['get', 'count'],
    ...colorStops,
  ])
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

// Handle zoom events for dynamic resolution switching
const handleZoomChange = async () => {
  if (!map.value) return

  const zoom = map.value.getZoom()
  const targetResolution = getResolutionForZoom(zoom)

  if (zoom >= 10) {
    showOnlyResolution(null)
    return
  }

  // Skip everything if resolution did not change
  if (currentResolution.value === targetResolution) {
    showOnlyResolution(currentResolution.value)
    return
  }

  // Resolution actually changed
  currentResolution.value = targetResolution

  // Build original data ONLY if missing
  if (!processedResolutions.value.has(targetResolution)) {
    buildOriginalData()
  }

  // Always filter + recolor + render
  filterData()
  getMapColors()
  addOrUpdateH3Layer()

  // Show appropriate hexagon resolution
  showOnlyResolution(targetResolution)
}

onMounted(async () => {
  if (mapContainer.value) {
    // Initialize map immediately for faster perceived load time
    map.value = new maplibregl.Map({
      container: mapContainer.value,
      center: [11.39831, 47.26244],
      zoom: 2,
      // attributionControl: false,
    })
    if (!map.value) return

    // map.value.setStyle(styleEOX)
    // map.value.setStyle('https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json')
    map.value.setStyle('https://basemaps.cartocdn.com/gl/positron-gl-style/style.json')
    map.value.on('styledata', () => {
      map.value?.setProjection({ type: 'globe' })
    })
    map.value.addControl(new maplibregl.FullscreenControl(), 'top-right')
    map.value.addControl(
      new maplibregl.NavigationControl({
        visualizePitch: true,
        visualizeRoll: true,
        showZoom: true,
        showCompass: true,
      }),
      'top-right',
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
      'top-right',
    )
    map.value.addControl(new MapLegendControl(), 'top-right')
    map.value.addControl(new MapInfoControl(), 'top-right')
    // map.value.addControl(
    //   new maplibregl.AttributionControl({
    //     compact: true,
    //   }),
    //   'bottom-right',
    // )

    // Start data loading in background
    const geojsonPromise = fetch(data_geojson).then((r) => r.json())

    map.value.on('load', async () => {
      if (!map.value) return

      // Load and cache data
      geojsonCache.value = await geojsonPromise

      // Process initial resolution (3) for immediate display
      const initialZoom = map.value.getZoom()
      currentResolution.value = getResolutionForZoom(initialZoom)

      buildOriginalData()

      // Add observation points layer for high zoom levels
      map.value.addSource('observationsSource', {
        type: 'geojson',
        data: geojsonCache.value as GeoJSON.FeatureCollection,
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

      getMapColors()

      // Add initial H3 layer
      addOrUpdateH3Layer()

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
  ({ start, end }, oldValue) => {
    // Skip initial assignment, because initially the dateFilter has null values and has to be computed
    if (!oldValue.start && !oldValue.end) return

    // Clear processed resolutions to force reprocessing
    processedResolutions.value.clear()
    // Reprocess current zoom level
    if (map.value) {
      const zoom = map.value.getZoom()
      currentResolution.value = getResolutionForZoom(zoom)
      filterData()
      getMapColors()
      addOrUpdateH3Layer()
      showOnlyResolution(zoom >= 10 ? null : currentResolution.value)
      if (start && end) {
        const startTs = Date.parse(start)
        const endTs = Date.parse(end)
        map.value?.setFilter('observationsLayer', [
          'all',
          ['>=', ['get', 'ts'], startTs],
          ['<=', ['get', 'ts'], endTs],
        ])
      }
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
