<template>
  <main class="size-screen mx-auto relative">
    <div class="map absolute h-screen w-screen" ref="mapContainer">
      <div class="absolute bottom-10 right-3 z-10 flex flex-row items-end pointer-events-none">
        <TimeSeries
          :timeSeriesData="renderedOriginalDateAggregationData"
          v-if="observationsStore.dataProcessed"
        />
        <MapLegend
          v-if="mapStore.showLegend"
          :mapColors="mapColors[taxaStore.taxonSelected.id]![currentResolution as number]"
        />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { MapBaseLayerControl, MapLegendControl } from '@/utils/mapControls'
import maplibregl, { type StyleSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { computed, markRaw, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { useMapStore } from '../../stores/mapStore'
import { useObservationsStore } from '../../stores/observationsStore'
import { culicidaeTaxon, useTaxaStore } from '../../stores/taxaStore'
import { useUIStore } from '../../stores/uiStore'
import { debounce } from '../../utils/debouncer'
import type {
  BasemapType,
  MapLibreBasemapsControlOptions,
} from '../../utils/mapControls/MapBaseLayerControl'
import { MapGlobeControl } from '../../utils/mapControls/MapGlobeControl'
import { quantile } from '../../utils/utils'
import { MessageType } from '../../workers/h3Aggregation.worker'
import MapLegend from './MapLegend.vue'
import TimeSeries from './TimeSeries.vue'

const worker = new Worker(new URL('@/workers/h3Aggregation.worker.ts', import.meta.url), {
  type: 'module',
})

const observationsStore = useObservationsStore()
const mapStore = useMapStore()
const taxaStore = useTaxaStore()
const uiStore = useUIStore()

const mapContainer = ref<HTMLElement | null>(null)
const map = shallowRef<maplibregl.Map | null>(null) // Shallow ref to optimize performance of deep reactivity
const geojsonCache = ref<ObservationFeatureCollection | null>(null)
const currentResolution = ref<number | null>(null)
const originalHexData = ref<Record<number, Record<number, Record<string, any>>>>({}) // taxonId -> resolution -> hex -> feature
const originalDateAggregationData = ref<Record<number, Record<string, number>>>({}) // taxonId -> date -> count
const renderedHexData = ref<Record<number, Record<number, Record<string, any>>>>({}) // taxonId -> resolution -> hex -> feature (after filtering)
const ascSortedArrHexCounts = ref<number[]>([]) // Sorted array of hex counts for quantile calculation
const mapColors = ref<
  Record<number, Record<number, Record<string, { value: number; color: string }>>> // taxonId -> resolution -> quantile -> { value, color }
>({}) // Color mapping for current resolution
const observationsFilters = ref<Record<string, any>>({}) // Filters for observation points layer

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
} as StyleSpecification

const renderedOriginalDateAggregationData = computed<Record<string, number>>(() => {
  const taxonSelectedId = taxaStore.taxonSelected.id as number
  return originalDateAggregationData.value[taxonSelectedId] || {}
})

const observationPointsZoom = 10
const observationPointsSourceLabel = 'observationsSource'
const observationPointsLayerLabel = 'observationPointsLayer'
let hoveredObservationId: string | null = null
let selectedObservationId: string | null = null
let observationEventsAttached = false

// Define map styles
const basemapOptions: MapLibreBasemapsControlOptions = {
  basemaps: [
    {
      id: 'carto-positron',
      url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      image: 'https://carto.com/help/images/building-maps/basemaps/positron_labels.png',
      name: 'Carto Positron',
    },
    {
      id: 'carto-dark',
      url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      image: 'https://carto.com/help/images/building-maps/basemaps/dark_labels.png',
      name: 'Carto Dark',
    },
    {
      id: 'carto-voyager',
      url: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
      image: 'https://carto.com/help/images/building-maps/basemaps/voyager_labels.png',
      name: 'Carto Voyager',
    },
    {
      id: 'eox-satellite',
      url: styleEOX,
      image:
        (styleEOX?.sources?.satellite as any).tiles[0] // FIXME: any type
          ?.replace('{x}', '0')
          .replace('{y}', '0')
          .replace('{z}', '1') || '',
      name: 'EOX Satellite',
    },
  ],
  initialBasemap: 'carto-positron',
}

worker.onmessage = (e) => {
  const msg = e.data
  const taxonSelectedId = taxaStore.taxonSelected.id as number

  if (msg.type === MessageType.BUILT) {
    originalHexData.value[taxonSelectedId] = originalHexData.value[taxonSelectedId] || {}
    originalHexData.value[taxonSelectedId][msg.resolution] = msg.originalHexData

    originalDateAggregationData.value[taxonSelectedId] = { ...msg.dateAggregation }
  }

  if (msg.type === MessageType.FILTERED) {
    renderedHexData.value[taxonSelectedId] = renderedHexData.value[taxonSelectedId] || {}
    renderedHexData.value[taxonSelectedId][msg.resolution] = Object.fromEntries(
      msg.featureCollection.features.map((f: any) => [f.properties.hex, f]),
    )

    ascSortedArrHexCounts.value = msg.counts
    getMapColors()
    addOrUpdateH3Layer()
    showOnlyResolution()
    observationsStore.dataProcessed = true
  }
}

type ObservationFeatureCollection = GeoJSON.FeatureCollection<
  GeoJSON.Point,
  {
    uuid: string
    received_at: string
    ts?: number
    day?: number
  }
>

const pushMapPaddingUpdate = debounce(() => {
  if (map.value) {
    map.value.easeTo({
      padding: {
        left: uiStore.drawerWidth / 2 || 0,
      },
      duration: 100, // In ms, CSS transition duration property for the sidebar matches this value
    })
  }
}, 100)

// Function to get appropriate resolution based on zoom level
const getResolutionForZoom = (zoom: number): number => {
  if (zoom <= 4) return 4
  if (zoom <= 6) return 5
  return 6
}

const buildOriginalData = () => {
  worker.postMessage({
    type: MessageType.BUILD_ORIGINAL,
    features: geojsonCache.value?.features,
    resolution: currentResolution.value,
    selectedTaxonId: taxaStore.taxonSelected.id,
  })
}

const filterData = () => {
  const { start, end } = observationsStore.dateFilter

  worker.postMessage({
    type: MessageType.FILTER,
    resolution: currentResolution.value,
    selectedTaxonId: taxaStore.taxonSelected.id,
    start: start ? Date.parse(start) : -Infinity,
    end: end ? Date.parse(end) : Infinity,
  })
}

const getMapColors = () => {
  const taxonSelectedId = taxaStore.taxonSelected.id as number
  const resolution = currentResolution.value as number
  if (!renderedHexData.value[taxonSelectedId]?.[resolution]) return

  if (ascSortedArrHexCounts.value.length === 0) {
    ascSortedArrHexCounts.value = Object.values(
      renderedHexData.value[taxonSelectedId][resolution],
    ).map((f: any) => f.properties.count)
    ascSortedArrHexCounts.value.sort((a, b) => a - b)
  }
  mapColors.value[taxonSelectedId] = mapColors.value[taxonSelectedId] || {}
  mapColors.value[taxonSelectedId][resolution] = {
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
  for (let i = 0; i < Object.keys(mapColors.value[taxonSelectedId]![resolution]).length - 1; i++) {
    const previousKey =
      i > 0 ? Object.keys(mapColors.value[taxonSelectedId]![resolution])[i - 1] : null
    const currentKey = Object.keys(mapColors.value[taxonSelectedId]![resolution])[i] as string
    if (
      previousKey &&
      mapColors.value[taxonSelectedId]![resolution][currentKey] &&
      mapColors.value[taxonSelectedId]![resolution][previousKey] &&
      mapColors.value[taxonSelectedId]![resolution][currentKey].value ===
        mapColors.value[taxonSelectedId]![resolution][previousKey].value
    ) {
      mapColors.value[taxonSelectedId]![resolution][currentKey].value += 0.1
    }
  }
}

// ######### EVENT HANDLERS FOR OBSERVATION POINTS LAYER #########
const onObservationPointsMouseEnter = (e: any) => {
  if (!map.value) return
  map.value.getCanvas().style.cursor = 'pointer'

  if (e.features && e.features.length > 0) {
    if (hoveredObservationId) {
      map.value.setFeatureState(
        { source: observationPointsSourceLabel, id: hoveredObservationId },
        { hover: false },
      )
    }

    hoveredObservationId = e.features[0]?.properties.uuid as string

    map.value.setFeatureState(
      { source: observationPointsSourceLabel, id: hoveredObservationId },
      { hover: true },
    )
  }
}
const onObservationPointsMouseLeave = () => {
  if (!map.value) return
  map.value.getCanvas().style.cursor = ''

  if (hoveredObservationId) {
    map.value.setFeatureState(
      { source: observationPointsSourceLabel, id: hoveredObservationId },
      { hover: false },
    )
    hoveredObservationId = null
  }
}
const onObservationPointsClick = (e: any) => {
  if (!map.value) return

  const features = map.value.queryRenderedFeatures(e.point, {
    layers: [observationPointsLayerLabel],
  })

  if (!features.length) return

  if (selectedObservationId) {
    map.value.setFeatureState(
      { source: observationPointsSourceLabel, id: selectedObservationId },
      { click: false },
    )
  }

  const clickedId = features[0]?.properties.uuid as string

  // If clicking the already selected one → deselect
  if (selectedObservationId === clickedId) {
    map.value.setFeatureState(
      { source: observationPointsSourceLabel, id: selectedObservationId },
      { click: false },
    )

    selectedObservationId = null

    // Reset: all red
    map.value.setPaintProperty(observationPointsLayerLabel, 'circle-color', '#FF5722')
    return
  }

  // Otherwise select new one
  selectedObservationId = clickedId

  // Selected = red, others = gray
  map.value.setPaintProperty(observationPointsLayerLabel, 'circle-color', [
    'case',
    ['==', ['id'], selectedObservationId],
    '#FF5722', // selected
    '#888888', // others
  ])

  map.value.setFeatureState(
    { source: observationPointsSourceLabel, id: clickedId },
    { click: true },
  )
  observationsStore.fetchObservationById(selectedObservationId)
}

const attachObservationEvents = () => {
  if (!map.value) return
  if (observationEventsAttached) return
  if (!map.value.getLayer(observationPointsLayerLabel)) return

  map.value.on('mouseenter', observationPointsLayerLabel, onObservationPointsMouseEnter)
  map.value.on('mouseleave', observationPointsLayerLabel, onObservationPointsMouseLeave)
  map.value.on('click', observationPointsLayerLabel, onObservationPointsClick)

  observationEventsAttached = true
}

const detachObservationEvents = () => {
  if (!map.value) return
  if (!observationEventsAttached) return
  if (!map.value.getLayer(observationPointsLayerLabel)) return

  map.value.off('mouseenter', observationPointsLayerLabel, onObservationPointsMouseEnter)
  map.value.off('mouseleave', observationPointsLayerLabel, onObservationPointsMouseLeave)
  map.value.off('click', observationPointsLayerLabel, onObservationPointsClick)

  // Cleanup hover state, in case mouse is currently hovering an observation when layer is hidden
  onObservationPointsMouseLeave()

  observationEventsAttached = false
}

// ########## LAYER HANDLING BASED ON ZOOM AND RESOLUTION #########
// Function to add/update H3 layer for a resolution
const addOrUpdateH3Layer = () => {
  const taxonSelectedId = taxaStore.taxonSelected.id as number
  const resolution = currentResolution.value as number
  const mapInstance = map.value

  if (!mapInstance) return

  const dataForRes = renderedHexData.value[taxonSelectedId]?.[resolution]
  const colorsForRes = mapColors.value[taxonSelectedId]?.[resolution]

  if (!dataForRes || !colorsForRes) return

  const sourceId = `h3-res-${resolution}`
  const layerId = `h3-layer-res-${resolution}`

  const featureCollection: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    // Maplibre does not need reactivity inside features, so we can mark them as raw to optimize performance
    features: markRaw(Object.values(dataForRes)),
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
        'fill-outline-color': 'rgba(255, 255, 255, 0)',
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
const showOnlyResolution = () => {
  if (!map.value) return

  const zoom = map.value.getZoom()
  const resolution = zoom >= observationPointsZoom ? null : currentResolution.value

  const allResolutions = [4, 5, 6]
  allResolutions.forEach((res) => {
    const layerId = `h3-layer-res-${res}`
    if (map.value!.getLayer(layerId)) {
      map.value!.setLayoutProperty(layerId, 'visibility', res === resolution ? 'visible' : 'none')
    }
  })

  // Handle observation points
  if (map.value.getLayer(observationPointsLayerLabel)) {
    const visible = resolution === null

    map.value.setLayoutProperty(
      observationPointsLayerLabel,
      'visibility',
      resolution === null ? 'visible' : 'none',
    )

    if (visible) attachObservationEvents()
    else detachObservationEvents()
  }
}

// Function to add observation points layer for high zoom levels
const addObservationLayers = () => {
  if (!map.value || !geojsonCache.value) return

  // Observations
  if (!map.value.getSource(observationPointsSourceLabel)) {
    map.value.addSource(observationPointsSourceLabel, {
      type: 'geojson',
      data: geojsonCache.value as GeoJSON.FeatureCollection,
      buffer: 0,
      maxzoom: 14,
      promoteId: 'uuid', // Promote feature id to top-level for better performance
    })
  }

  if (!map.value.getLayer(observationPointsLayerLabel)) {
    map.value.addLayer({
      id: observationPointsLayerLabel,
      source: observationPointsSourceLabel,
      type: 'circle',
      minzoom: observationPointsZoom,
      layout: { visibility: 'none' },
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          11,
          [
            'case',
            ['boolean', ['feature-state', 'click'], false],
            6, // selected
            ['boolean', ['feature-state', 'hover'], false],
            5, // hover
            3, // default
          ],
          18,
          [
            'case',
            ['boolean', ['feature-state', 'click'], false],
            17, // selected
            ['boolean', ['feature-state', 'hover'], false],
            16, // hover
            10, // default
          ],
        ],
        'circle-color': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          // FF5722 but darker for better visibility on hover, while still keeping selected ones more prominent
          '#FF1A00', // hover
          '#FF5722',
        ],
        'circle-stroke-width': 1,
        'circle-stroke-color': '#FFFFFF',
      },
    })
  }
}

// Handle zoom events for dynamic resolution switching
const handleZoomChange = async () => {
  if (!map.value) return

  const zoom = map.value.getZoom()
  const targetResolution = getResolutionForZoom(zoom)

  // Skip everything if resolution did not change or zoom is high enough
  if (zoom >= 10 || currentResolution.value === targetResolution) {
    showOnlyResolution()
    return
  }

  // Resolution actually changed
  currentResolution.value = targetResolution

  // Build original data ONLY if missing
  if (!originalHexData.value[taxaStore.taxonSelected.id]?.[targetResolution]) {
    buildOriginalData()
  }

  // Always filter + recolor + render
  filterData()
  getMapColors()
  addOrUpdateH3Layer()

  // Show appropriate hexagon resolution
  showOnlyResolution()
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
    pushMapPaddingUpdate()

    mapStore.baselayer =
      // @ts-ignore // FIXME:
      basemapOptions?.basemaps.find((b) => b.id === basemapOptions?.initialBasemap) ||
      (basemapOptions.basemaps[0] as BasemapType)
    map.value.setStyle(mapStore.baselayer?.url || '')
    map.value.on('style.load', () => {
      map.value?.setProjection({ type: 'globe' })
    })
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
    const geolocate = new maplibregl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserLocation: false,
    })
    map.value.addControl(geolocate, 'top-right')
    map.value.addControl(new MapLegendControl(), 'top-right')
    map.value.addControl(new MapGlobeControl(), 'top-right')
    map.value.addControl(new MapBaseLayerControl(basemapOptions), 'top-right')
    // map.value.addControl(new MapInfoControl(), 'top-right')

    // Start data loading in background
    const observationsPromise = observationsStore.fetchObservations()

    map.value.on('load', async () => {
      if (!map.value) return

      mapStore.mapLoaded = true

      // Load and cache data. Mark as raw to avoid deep reactivity overhead. This object is never modified.
      geojsonCache.value = markRaw(await observationsPromise)

      // Process initial resolution (3) for immediate display
      const initialZoom = map.value.getZoom()
      currentResolution.value = getResolutionForZoom(initialZoom)

      buildOriginalData()
      filterData()

      // Add observation points layer for high zoom levels
      addObservationLayers()

      getMapColors()

      // Add initial H3 layer
      addOrUpdateH3Layer()

      // Debounced zoom event handler to prevent multiple calls
      const handleZoomChangeDebounced = debounce(handleZoomChange, 50)

      // Add zoom event listeners - only on zoomend to prevent constant processing
      map.value.on('zoomend', handleZoomChangeDebounced)
    })
  }
})

onUnmounted(() => {
  worker.terminate()
})

watch(
  () => taxaStore.taxonSelected,
  async (newTaxon, oldTaxon) => {
    if (!oldTaxon || newTaxon === oldTaxon) return
    geojsonCache.value = markRaw(await observationsStore.fetchObservations())
    buildOriginalData()
    filterData()
    // Add observation points layer for high zoom levels
    addObservationLayers()
    getMapColors()
    // Add initial H3 layer
    addOrUpdateH3Layer()
    // Filter observation points
    if (map.value) {
      if (newTaxon.id !== culicidaeTaxon.id) {
        observationsFilters.value['taxon'] = ['==', ['get', 'identification_taxon_id'], newTaxon.id]
      } else {
        delete observationsFilters.value['taxon']
      }
    }
  },
)

watch(
  () => observationsStore.dateFilter,
  ({ start, end }, oldValue) => {
    // Skip initial assignment, because initially the dateFilter has null values and has to be computed
    if (!oldValue.start && !oldValue.end) return

    // Reprocess current zoom level
    if (map.value) {
      const zoom = map.value.getZoom()
      currentResolution.value = getResolutionForZoom(zoom)
      filterData()
      getMapColors()
      addOrUpdateH3Layer()
      showOnlyResolution()
      if (start) {
        observationsFilters.value['start'] = ['>=', ['get', 'received_at'], start]
      } else {
        delete observationsFilters.value['start']
      }
      if (end) {
        observationsFilters.value['end'] = ['<=', ['get', 'received_at'], end]
      } else {
        delete observationsFilters.value['end']
      }
    }
  },
  { deep: true },
)

watch(
  () => observationsFilters.value,
  (newFilters) => {
    if (map.value) {
      const filters = Object.values(newFilters)
      map.value.setFilter('observationsLayer', ['all', ...filters])
    }
  },
  { deep: true },
)

watch(
  () => observationsStore.observationInDrawer,
  (newObservation) => {
    console.log(newObservation)
    if (!map.value) return
    if (!newObservation) {
      // No observation selected → reset all to red
      map.value.setPaintProperty(observationPointsLayerLabel, 'circle-color', '#FF5722')
      if (selectedObservationId) {
        map.value.setFeatureState(
          { source: observationPointsSourceLabel, id: selectedObservationId },
          { click: false },
        )
      }
      selectedObservationId = null
    }
  },
)

watch(
  () => mapStore.baselayer,
  (newBaselayer, oldBaselayer) => {
    if (
      map.value &&
      Object.keys(newBaselayer || {}).length > 0 &&
      newBaselayer.id !== oldBaselayer?.id &&
      Object.keys(oldBaselayer || {}).length > 0
    ) {
      map.value.setStyle(newBaselayer.url)
      map.value.once('style.load', () => {
        addObservationLayers()
        addOrUpdateH3Layer()
        showOnlyResolution()
      })
    }
  },
)

watch(
  () => uiStore.drawerWidth,
  (newWidth, oldWidth) => {
    if (map.value && newWidth !== oldWidth) {
      pushMapPaddingUpdate()
    }
  },
)

onUnmounted(() => {
  if (map.value) {
    map.value.remove()
  }
})
</script>
