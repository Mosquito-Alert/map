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
import * as turf from '@turf/turf'
import maplibregl, { type StyleSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { computed, markRaw, onMounted, onUnmounted, ref, watch } from 'vue'
import { useMapStore } from '../../stores/mapStore'
import { useObservationsStore } from '../../stores/observationsStore'
import { culicidaeTaxon, useTaxaStore } from '../../stores/taxaStore'
import { useUIStore } from '../../stores/uiStore'
import { MosquitoLayersEnum } from '../../utils/constants'
import { debounce } from '../../utils/debouncer'
import type {
  BasemapType,
  MapLibreBasemapsControlOptions,
} from '../../utils/mapControls/MapBaseLayerControl'
import { MapGlobeControl } from '../../utils/mapControls/MapGlobeControl'
import MapLegend from './MapLegend.vue'
import TimeSeries from './TimeSeries.vue'
import {
  addNearbyObservationsCircleLayer,
  addObservationLayers,
  addOrUpdateH3Layer,
  attachObservationEvents,
  buildOriginalData,
  currentResolution,
  detachObservationEvents,
  filterData,
  geojsonCache,
  getMapColors,
  getResolutionForZoom,
  h3AggregationWorker,
  handleZoomChange,
  mapColors,
  renderedOriginalDateAggregationData,
  showOnlyResolution,
} from './ObservationsMap'
import { addGBIFOccurrencesLayer } from './DistributionMap'

const observationsStore = useObservationsStore()
const mapStore = useMapStore()
const taxaStore = useTaxaStore()
const uiStore = useUIStore()

const mapContainer = ref<HTMLElement | null>(null)
const map = computed(() => mapStore.map) // Computed ref to react to map changes
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

const toggleDataLayers = async () => {
  if (!map.value) return

  const showOwnData = mapStore.layerSelected === MosquitoLayersEnum.observations
  const showGbif = mapStore.layerSelected === MosquitoLayersEnum.distribution

  // ---- Toggle H3 layers ----
  if (showOwnData) {
    showOnlyResolution()
  } else {
    mapStore.resolutionsAvailable.forEach((res) => {
      const layerId = mapStore.getH3LayerId(res)
      if (map.value!.getLayer(layerId)) {
        map.value!.setLayoutProperty(layerId, 'visibility', 'none')
      }
    })
  }

  // ---- Toggle observation points ----
  if (map.value.getLayer(mapStore.observationsPointsLayerId)) {
    map.value.setLayoutProperty(
      mapStore.observationsPointsLayerId,
      'visibility',
      showOwnData ? 'visible' : 'none',
    )

    if (showOwnData) attachObservationEvents()
    else detachObservationEvents()
  }

  // ---- Handle GBIF layer ----
  if (showGbif) {
    //  Ensure GBIF layer exists
    await addGBIFOccurrencesLayer()
    // Ensure GBIF layer is visible
    const gbifId = (await taxaStore.getGbifIdForSelectedTaxon()) || ''
    const gbifLayerId = mapStore.getGbifLayerId(gbifId)
    map.value.setLayoutProperty(gbifLayerId, 'visibility', 'visible')
  } else {
    // Get all the GBIF layers and hide them.
    // NOTE: we can have multiple GBIF layers if user switched between different taxa with GBIF data
    const allLayers = map.value.getLayersOrder()
    allLayers.forEach((layerId) => {
      if (layerId.startsWith('distribution-layer-')) {
        map.value!.setLayoutProperty(layerId, 'visibility', 'none')
      }
    })
  }
}

onMounted(async () => {
  if (mapContainer.value) {
    // Initialize map immediately for faster perceived load time
    const mapDeclaration = new maplibregl.Map({
      container: mapContainer.value,
      center: [11.39831, 47.26244],
      zoom: 2,
      // attributionControl: false,
    })
    if (!mapDeclaration) return
    pushMapPaddingUpdate()

    mapStore.baselayer =
      // @ts-ignore // FIXME:
      basemapOptions?.basemaps.find((b) => b.id === basemapOptions?.initialBasemap) ||
      (basemapOptions.basemaps[0] as BasemapType)
    mapDeclaration.setStyle(mapStore.baselayer?.url || '')
    mapDeclaration.on('style.load', () => {
      mapDeclaration?.setProjection({ type: 'globe' })
    })
    mapDeclaration.addControl(
      new maplibregl.NavigationControl({
        visualizePitch: true,
        visualizeRoll: true,
        showZoom: true,
        showCompass: true,
      }),
      'top-right',
    )
    // Add geolocate control to the map
    const geolocate = new maplibregl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserLocation: false,
    })
    mapDeclaration.addControl(geolocate, 'top-right')
    mapDeclaration.addControl(new MapLegendControl(), 'top-right')
    mapDeclaration.addControl(new MapGlobeControl(), 'top-right')
    mapDeclaration.addControl(new MapBaseLayerControl(basemapOptions), 'top-right')
    // mapDeclaration.addControl(new MapInfoControl(), 'top-right')

    // Start data loading in background
    const observationsPromise = observationsStore.fetchObservations()

    mapDeclaration.on('load', async () => {
      if (!mapDeclaration) return
      mapStore.setMap(mapDeclaration)
      if (!map.value) return

      mapStore.mapLoaded = true

      // Load and cache data. Mark as raw to avoid deep reactivity overhead. This object is never modified.
      geojsonCache.value = markRaw(await observationsPromise)

      // Process initial resolution (3) for immediate display
      const initialZoom = map.value.getZoom()
      currentResolution.value = getResolutionForZoom(initialZoom)

      // Add sources and layers for nearby observations circle
      addNearbyObservationsCircleLayer()

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
  h3AggregationWorker.terminate()
  if (map.value) {
    map.value.remove()
  }
})

watch(
  () => mapStore.layerSelected,
  async () => {
    await toggleDataLayers()
  },
)

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
      map.value.setFilter(mapStore.observationsPointsLayerId, ['all', ...filters])
    }
  },
  { deep: true },
)

watch(
  () => observationsStore.observationInDrawer,
  (newObservation) => {
    if (!map.value) return
    if (!newObservation) {
      // No observation selected → reset all to red
      map.value.setPaintProperty(mapStore.observationsPointsLayerId, 'circle-color', '#FF5722')
      if (observationsStore.selectedObservationId) {
        map.value.setFeatureState(
          {
            source: mapStore.observationsPointsSourceId,
            id: observationsStore.selectedObservationId,
          },
          { click: false },
        )
      }
      observationsStore.selectedObservationId = null
    } else {
      observationsStore.selectedObservationId = newObservation.uuid
      // paint selected one as red, others as gray
      map.value.setPaintProperty(mapStore.observationsPointsLayerId, 'circle-color', [
        'case',
        ['==', ['id'], newObservation.uuid],
        '#FF5722', // selected
        '#888888', // others
      ])
      map.value.setFeatureState(
        { source: mapStore.observationsPointsSourceId, id: newObservation.uuid },
        { click: true },
      )
      // zoom to selected observation
      const { latitude, longitude } = newObservation.location.point
      map.value.easeTo({
        center: [longitude, latitude],
        zoom: 14,
      })
    }
  },
)

watch(
  () =>
    [
      observationsStore.are_observations_near,
      observationsStore.user_location,
      observationsStore.radius_for_nearby_observations,
    ] as const,
  async (
    [areObservationsNear, location, radius],
    [oldAreObservationsNear, oldLocation, oldRadius],
  ) => {
    if (!map.value || !map.value?.isStyleLoaded() || !location) return

    const circleSource = map.value.getSource(
      mapStore.nearObservationsCircleSourceId,
    ) as maplibregl.GeoJSONSource
    const centerSource = map.value.getSource(mapStore.centerSourceId) as maplibregl.GeoJSONSource

    if (!circleSource || !centerSource) return

    // Toggle visibility of the layer
    map.value.setLayoutProperty(
      mapStore.nearObservationsCircleLayerId,
      'visibility',
      areObservationsNear ? 'visible' : 'none',
    )

    if (!areObservationsNear) return

    // Only recreate circle if either location or radius changed, to avoid unnecessary updates
    const locationChanged =
      !oldLocation ||
      location.latitude !== oldLocation.latitude ||
      location.longitude !== oldLocation.longitude

    const radiusChanged = radius !== oldRadius

    if (!locationChanged && !radiusChanged && oldAreObservationsNear) return

    const center = [location.longitude, location.latitude]

    // Create circle polygon using Turf
    const circle = turf.circle(center, radius, {
      steps: 64,
      units: 'kilometers',
    })

    circleSource.setData(circle)

    // Update center point for better visibility
    map.value.setLayoutProperty(
      mapStore.centerLayerId,
      'visibility',
      areObservationsNear ? 'visible' : 'none',
    )

    centerSource.setData({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: center,
      },
    } as GeoJSON.Feature)
  },
  { deep: true },
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
      map.value.once('style.load', async () => {
        addObservationLayers()
        addOrUpdateH3Layer()
        showOnlyResolution()
        await toggleDataLayers()
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
</script>
