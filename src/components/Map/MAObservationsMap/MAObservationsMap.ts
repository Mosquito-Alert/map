import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { computed, markRaw, ref } from 'vue'
import { useMapStore } from '../../../stores/mapStore'
import { useObservationsStore } from '../../../stores/observationsStore'
import { useTaxaStore } from '../../../stores/taxaStore'
import { MosquitoLayersEnum } from '../../../utils/constants'
import { quantile } from '../../../utils/utils'
import { MessageType } from '../../../workers/h3Aggregation.worker'

export const h3AggregationWorker = new Worker(
  new URL('@/workers/h3Aggregation.worker.ts', import.meta.url),
  {
    type: 'module',
  },
)

const observationsStore = useObservationsStore()
const mapStore = useMapStore()
const taxaStore = useTaxaStore()

const map = computed(() => mapStore.map) // Computed ref to react to map changes
export const geojsonCache = ref<ObservationFeatureCollection | null>(null)
export const currentResolution = ref<number | null>(null)
const originalHexData = ref<Record<number, Record<number, Record<string, any>>>>({}) // taxonId -> resolution -> hex -> feature
const originalDateAggregationData = ref<Record<number, Record<string, number>>>({}) // taxonId -> date -> count
const renderedHexData = ref<Record<number, Record<number, Record<string, any>>>>({}) // taxonId -> resolution -> hex -> feature (after filtering)
const ascSortedArrHexCounts = ref<number[]>([]) // Sorted array of hex counts for quantile calculation
export const mapColors = ref<
  Record<number, Record<number, Record<string, { value: number; color: string }>>> // taxonId -> resolution -> quantile -> { value, color }
>({}) // Color mapping for current resolution

export const renderedOriginalDateAggregationData = computed<Record<string, number>>(() => {
  const taxonSelectedId = taxaStore.taxonSelected.id as number
  return originalDateAggregationData.value[taxonSelectedId] || {}
})

const observationPointsZoom = 10
let hoveredObservationId: string | null = null
let observationEventsAttached = false

h3AggregationWorker.onmessage = (e) => {
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

export type ObservationFeatureCollection = GeoJSON.FeatureCollection<
  GeoJSON.Point,
  {
    uuid: string
    received_at: string
    ts?: number
    day?: number
  }
>

// Function to get appropriate resolution based on zoom level
export const getResolutionForZoom = (zoom: number): number => {
  if (zoom <= 4) return 4
  if (zoom <= 6) return 5
  return 6
}

export const buildOriginalData = () => {
  h3AggregationWorker.postMessage({
    type: MessageType.BUILD_ORIGINAL,
    features: geojsonCache.value?.features,
    resolution: currentResolution.value,
    selectedTaxonId: taxaStore.taxonSelected.id,
  })
}

export const filterData = () => {
  const { start, end } = observationsStore.dateFilter

  h3AggregationWorker.postMessage({
    type: MessageType.FILTER,
    resolution: currentResolution.value,
    selectedTaxonId: taxaStore.taxonSelected.id,
    start: start ? Date.parse(start) : -Infinity,
    end: end ? Date.parse(end) : Infinity,
  })
}

export const getMapColors = () => {
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
        { source: mapStore.maObservationsPointsSourceId, id: hoveredObservationId },
        { hover: false },
      )
    }

    hoveredObservationId = e.features[0]?.properties.uuid as string

    map.value.setFeatureState(
      { source: mapStore.maObservationsPointsSourceId, id: hoveredObservationId },
      { hover: true },
    )
  }
}
const onObservationPointsMouseLeave = () => {
  if (!map.value) return
  map.value.getCanvas().style.cursor = ''

  if (hoveredObservationId) {
    map.value.setFeatureState(
      { source: mapStore.maObservationsPointsSourceId, id: hoveredObservationId },
      { hover: false },
    )
    hoveredObservationId = null
  }
}
const onObservationPointsClick = (e: any) => {
  if (!map.value) return

  const features = map.value.queryRenderedFeatures(e.point, {
    layers: [mapStore.maObservationsPointsLayerId],
  })

  if (!features.length) return

  if (observationsStore.selectedObservationId) {
    map.value.setFeatureState(
      {
        source: mapStore.maObservationsPointsSourceId,
        id: observationsStore.selectedObservationId,
      },
      { click: false },
    )
  }

  const clickedId = features[0]?.properties.uuid as string

  // If clicking the already selected one → deselect
  if (observationsStore.selectedObservationId === clickedId) {
    map.value.setFeatureState(
      {
        source: mapStore.maObservationsPointsSourceId,
        id: observationsStore.selectedObservationId,
      },
      { click: false },
    )

    observationsStore.selectedObservationId = null

    // Reset: all red
    map.value.setPaintProperty(mapStore.maObservationsPointsLayerId, 'circle-color', '#FF5722')
    return
  }

  observationsStore.fetchObservationById(clickedId)
}

export const attachObservationEvents = () => {
  if (!map.value) return
  if (observationEventsAttached) return
  if (!map.value.getLayer(mapStore.maObservationsPointsLayerId)) return

  map.value.on('mouseenter', mapStore.maObservationsPointsLayerId, onObservationPointsMouseEnter)
  map.value.on('mouseleave', mapStore.maObservationsPointsLayerId, onObservationPointsMouseLeave)
  map.value.on('click', mapStore.maObservationsPointsLayerId, onObservationPointsClick)

  observationEventsAttached = true
}

export const detachObservationEvents = () => {
  if (!map.value) return
  if (!observationEventsAttached) return
  if (!map.value.getLayer(mapStore.maObservationsPointsLayerId)) return

  map.value.off('mouseenter', mapStore.maObservationsPointsLayerId, onObservationPointsMouseEnter)
  map.value.off('mouseleave', mapStore.maObservationsPointsLayerId, onObservationPointsMouseLeave)
  map.value.off('click', mapStore.maObservationsPointsLayerId, onObservationPointsClick)

  // Cleanup hover state, in case mouse is currently hovering an observation when layer is hidden
  onObservationPointsMouseLeave()

  observationEventsAttached = false
}

// ########## LAYER HANDLING BASED ON ZOOM AND RESOLUTION #########
// Function to add/update H3 layer for a resolution
export const addOrUpdateH3Layer = () => {
  const taxonSelectedId = taxaStore.taxonSelected.id as number
  const resolution = currentResolution.value as number
  const mapInstance = map.value

  if (!mapInstance) return

  const dataForRes = renderedHexData.value[taxonSelectedId]?.[resolution]
  const colorsForRes = mapColors.value[taxonSelectedId]?.[resolution]

  if (!dataForRes || !colorsForRes) return

  const sourceId = mapStore.getH3SourceId(resolution)
  const layerId = mapStore.getH3LayerId(resolution)

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
export const showOnlyResolution = () => {
  if (!map.value) return
  if (mapStore.layerSelected !== MosquitoLayersEnum.OBSERVATIONS) return

  const zoom = map.value.getZoom()
  const resolution = zoom >= observationPointsZoom ? null : currentResolution.value

  mapStore.resolutionsAvailable.forEach((res) => {
    const layerId = mapStore.getH3LayerId(res)
    if (map.value!.getLayer(layerId)) {
      map.value!.setLayoutProperty(layerId, 'visibility', res === resolution ? 'visible' : 'none')
    }
  })

  // Handle observation points
  if (map.value.getLayer(mapStore.maObservationsPointsLayerId)) {
    const visible = resolution === null

    map.value.setLayoutProperty(
      mapStore.maObservationsPointsLayerId,
      'visibility',
      resolution === null ? 'visible' : 'none',
    )

    if (visible) attachObservationEvents()
    else detachObservationEvents()
  }
}

// Function to add observation points layer for high zoom levels
export const addObservationLayers = () => {
  if (!map.value || !geojsonCache.value) return

  // Observations
  if (!map.value.getSource(mapStore.maObservationsPointsSourceId)) {
    map.value.addSource(mapStore.maObservationsPointsSourceId, {
      type: 'geojson',
      data: geojsonCache.value as GeoJSON.FeatureCollection,
      buffer: 0,
      maxzoom: 14,
      promoteId: 'uuid', // Promote feature id to top-level for better performance
    })
  }

  if (!map.value.getLayer(mapStore.maObservationsPointsLayerId)) {
    map.value.addLayer({
      id: mapStore.maObservationsPointsLayerId,
      source: mapStore.maObservationsPointsSourceId,
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

// Function to add sources and layers for nearby observations circle
export const addNearbyObservationsCircleLayer = () => {
  if (!map.value) return

  // Add circle for nearby observations if enabled
  map.value.addSource(mapStore.nearObservationsCircleSourceId, {
    type: 'geojson',
    data: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[]], // Empty polygon by default
      },
      properties: null,
    },
  })

  map.value.addLayer({
    id: mapStore.nearObservationsCircleLayerId,
    type: 'fill',
    source: mapStore.nearObservationsCircleSourceId,
    layout: {
      visibility: 'none', // hidden by default
    },
    paint: {
      'fill-color': '#007cbf',
      'fill-opacity': 0.3,
    },
  })

  // Center point that shows the user location
  map.value.addSource(mapStore.centerSourceId, {
    type: 'geojson',
    data: {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [0, 0], // Default coordinates, will be updated when shown
      },
      properties: null,
    },
  })

  map.value.addLayer({
    id: mapStore.centerLayerId,
    type: 'circle',
    source: mapStore.centerSourceId,
    layout: {
      visibility: 'none',
    },
    paint: {
      'circle-radius': 4,
      'circle-color': '#ffffff',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#007cbf',
    },
  })

  // Ensure the circle layer is shown above all other layers
  map.value.moveLayer(mapStore.nearObservationsCircleLayerId)
  map.value.moveLayer(mapStore.centerLayerId)
}

// Handle zoom events for dynamic resolution switching
export const handleZoomChangeInObservations = async () => {
  if (!map.value) return
  if (mapStore.layerSelected !== MosquitoLayersEnum.OBSERVATIONS) return

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
