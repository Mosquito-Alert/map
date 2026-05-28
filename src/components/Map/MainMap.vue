<template>
  <main class="size-screen mx-auto relative">
    <div class="map absolute h-screen w-screen" ref="mapContainer">
      <div class="absolute bottom-10 right-3 z-10 flex flex-row items-end pointer-events-none">
        <TemporalFilter
          v-if="mapStore.layerSelected !== MosquitoLayersEnum.DISCOVERIES"
          :dateLimits="dateLimits"
          :dataPeriodicity="dataPeriodicity"
          :isDataASnapshot="isDataASnapshot"
          :data="dataForTimeSeries"
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
import MaplibreCOGProtocol, { cogProtocol } from '@geomatico/maplibre-cog-protocol'
import * as turf from '@turf/turf'
import maplibregl, { type StyleSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { computed, markRaw, onMounted, onUnmounted, ref, watch } from 'vue'
import { toolsEnum, useAnalizeStore } from '../../stores/analizeStore'
import { useMapStore } from '../../stores/mapStore'
import { useObservationsStore } from '../../stores/observationsStore'
import { culicidaeTaxon, useTaxaStore } from '../../stores/taxaStore'
import { drawerTabs, useUIStore } from '../../stores/uiStore'
import {
  firstBiteIndexDateAvailable,
  firstGbifDateAvailable,
  firstRM0DateAvailable,
  lastRM0DateAvailable,
  BiteIndexStyleEnum,
  MosquitoLayersEnum,
  zoomToEurope,
  zoomToSpain,
  RM0_PALETTE,
} from '../../utils/constants'
import { PeriodicityEnum } from '../../utils/date'
import { debounce } from '../../utils/debouncer'
import type {
  BasemapType,
  MapLibreBasemapsControlOptions,
} from '../../utils/mapControls/MapBaseLayerControl'
import { MapGlobeControl } from '../../utils/mapControls/MapGlobeControl'
import {
  addBoundaryLayers,
  attachBoundaryEvents,
  detachBoundaryEvents,
  gadmLevels,
  handleZoomChangeInBoundaries,
} from './Layers/BoundaryLayer'
import { addDiscoveriesLayer } from './Layers/DiscoveriesLayer'
import { addGBIFOccurrencesLayer, updateGBIFSourceTiles } from './Layers/ExtendedObservationsLayer'
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
  handleZoomChangeInObservations,
  mapColors,
  renderedOriginalDateAggregationData,
  setDateLimitsForObservations,
  showOnlyResolution,
} from './Layers/MAObservationsLayer'
import { addRM0Layer, updateRM0SourceUrl } from './Layers/RM0Layer'
import MapLegend from './MapLegend.vue'
import TemporalFilter from './TemporalFilter.vue'
import {
  addBiteIndexLayers,
  selectedBiteIndexStyle,
  updateBiteIndexSourceUrl,
} from './Layers/BiteIndexLayer'
import { useBiteIndexStore } from '../../stores/biteIndexStore'

const observationsStore = useObservationsStore()
const mapStore = useMapStore()
const taxaStore = useTaxaStore()
const uiStore = useUIStore()
const analizeStore = useAnalizeStore()
const biteIndexStore = useBiteIndexStore()

const mapContainer = ref<HTMLElement | null>(null)
const map = computed(() => mapStore.map) // Computed ref to react to map changes
const observationsFilters = ref<Record<string, any>>({}) // Filters for observation points layer
const dateLimits = ref<{ first: Date; last: Date }>({
  first: new Date(1970, 0, 1),
  last: new Date(),
}) // Date limits for temporal filter, derived from currently shown data
const dataForTimeSeries = ref<Record<string, number> | null>(
  renderedOriginalDateAggregationData.value,
)
const dataPeriodicity = ref(PeriodicityEnum.Day) // Periodicity of the provided data
const isDataASnapshot = ref(false) // Tells if the shown data is either a snapshot or an aggregation, used to adapt temporal filter behavior

const getDrawerPaddingLeft = () => {
  const drawerWidth = document.querySelector('aside')?.clientWidth || uiStore.drawerWidth || 0
  return drawerWidth / 2 || 0
}

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
        left: getDrawerPaddingLeft(),
      },
      duration: 100, // In ms, CSS transition duration property for the sidebar matches this value
    })
  }
}, 100)

const hideAllBiteIndexLayers = () => {
  if (!map.value) return

  Object.values(BiteIndexStyleEnum).forEach((style) => {
    const layerId = mapStore.getBiteIndexLayerId(style)
    if (map.value?.getLayer(layerId)) {
      map.value.setLayoutProperty(layerId, 'visibility', 'none')
    }
  })
}

const showSelectedBiteIndexLayer = () => {
  if (!map.value) return

  const layerId = mapStore.getBiteIndexLayerId(selectedBiteIndexStyle.value)
  if (map.value.getLayer(layerId)) {
    map.value.setLayoutProperty(layerId, 'visibility', 'visible')
  }
}

const toggleDataLayers = async () => {
  if (!map.value) return

  const showOwnData = mapStore.layerSelected === MosquitoLayersEnum.MA_OBSERVATIONS
  const showGbif = mapStore.layerSelected === MosquitoLayersEnum.EXTENDED_OBSERVATIONS
  const showDiscoveries = mapStore.layerSelected === MosquitoLayersEnum.DISCOVERIES
  const showRM0 = mapStore.layerSelected === MosquitoLayersEnum.RM0
  const showBiteIndex = mapStore.layerSelected === MosquitoLayersEnum.BITE_INDEX

  // ######### OBSERVATIONS #########
  // ---- Toggle H3 layers ----
  if (showOwnData) {
    showOnlyResolution()
    dateLimits.value = setDateLimitsForObservations()
    isDataASnapshot.value = false
    dataPeriodicity.value = PeriodicityEnum.Day // TODO: derive from data
    dataForTimeSeries.value = renderedOriginalDateAggregationData.value
  } else {
    mapStore.resolutionsAvailable.forEach((res) => {
      const layerId = mapStore.getH3LayerId(res)
      if (map.value!.getLayer(layerId)) {
        map.value!.setLayoutProperty(layerId, 'visibility', 'none')
      }
    })
  }
  // ---- Toggle observation points ----
  if (map.value.getLayer(mapStore.maObservationsPointsLayerId)) {
    map.value.setLayoutProperty(
      mapStore.maObservationsPointsLayerId,
      'visibility',
      showOwnData ? 'visible' : 'none',
    )

    if (showOwnData) attachObservationEvents()
    else detachObservationEvents()
  }

  // ########## EXTENDED OBSERVATIONS #########
  if (showGbif) {
    //  Ensure GBIF layer exists
    await addGBIFOccurrencesLayer(
      observationsStore.dateFilter.start,
      observationsStore.dateFilter.end,
    )
    // Ensure GBIF layer is visible
    const gbifId = (await taxaStore.getGbifIdForSelectedTaxon()) || ''
    const gbifLayerId = mapStore.getGbifLayerId(gbifId)
    map.value.setLayoutProperty(gbifLayerId, 'visibility', 'visible')
    // Date Limits for temporal filter
    dateLimits.value = {
      first: firstGbifDateAvailable,
      last: new Date(),
    }
    dataForTimeSeries.value = null
    dataPeriodicity.value = PeriodicityEnum.Year
    isDataASnapshot.value = false
  } else {
    // Get all the GBIF layers and hide them.
    // NOTE: we can have multiple GBIF layers if user switched between different taxa with GBIF data
    const allLayers = map.value.getLayersOrder()
    allLayers.forEach((layerId) => {
      if (layerId.startsWith('extended-observations-layer-')) {
        map.value!.setLayoutProperty(layerId, 'visibility', 'none')
      }
    })
  }

  // ########## DISCOVERIES #########
  if (showDiscoveries) {
    // Ensure Discoveries layer exists
    await addDiscoveriesLayer()
    // Ensure Discoveries layer is visible
    if (map.value.getLayer(mapStore.extObservationsLayerId)) {
      map.value.setLayoutProperty(mapStore.extObservationsLayerId, 'visibility', 'visible')
    }
    dataForTimeSeries.value = null
    dataPeriodicity.value = PeriodicityEnum.Day
  } else {
    if (map.value.getLayer(mapStore.extObservationsLayerId)) {
      map.value.setLayoutProperty(mapStore.extObservationsLayerId, 'visibility', 'none')
    }
  }

  // ########## RM0 #########
  if (showRM0) {
    // Ensure RM0 layer exists
    await addRM0Layer(observationsStore.dateFilter.end)
    // Ensure RM0 layer is visible
    if (map.value.getLayer(mapStore.rm0LayerId)) {
      map.value.setLayoutProperty(mapStore.rm0LayerId, 'visibility', 'visible')
    }
    // TODO: API endpoint
    dateLimits.value = {
      first: firstRM0DateAvailable,
      last: lastRM0DateAvailable,
    }
    dataForTimeSeries.value = null
    dataPeriodicity.value = PeriodicityEnum.Day
    isDataASnapshot.value = true
  } else {
    if (map.value.getLayer(mapStore.rm0LayerId)) {
      map.value.setLayoutProperty(mapStore.rm0LayerId, 'visibility', 'none')
    }
  }

  // ########## BITE INDEX #########
  const biteIndexLayerId = mapStore.getBiteIndexLayerId(selectedBiteIndexStyle.value)
  if (showBiteIndex) {
    // Zoom to Spain
    map.value.easeTo(zoomToSpain)
    const biteIndexDate = observationsStore.dateFilter.end || biteIndexStore.lastDateAvailable
    // Ensure Bite Index layer exists
    await addBiteIndexLayers(biteIndexDate)
    await updateBiteIndexSourceUrl(biteIndexDate)
    // Ensure Bite Index layer is visible
    hideAllBiteIndexLayers()
    if (map.value.getLayer(biteIndexLayerId)) {
      showSelectedBiteIndexLayer()
    }
    dateLimits.value = {
      first: firstBiteIndexDateAvailable,
      last: new Date(biteIndexStore.lastDateAvailable),
    }
    dataForTimeSeries.value = null
    dataPeriodicity.value = PeriodicityEnum.Day
    isDataASnapshot.value = true
  } else {
    // Zoom to Europe
    map.value.easeTo(zoomToEurope)
    hideAllBiteIndexLayers()
  }
}

onMounted(async () => {
  if (mapContainer.value) {
    // Initialize map immediately for faster perceived load time
    const mapDeclaration = new maplibregl.Map({
      container: mapContainer.value,
      center: zoomToEurope.center,
      zoom: zoomToEurope.zoom,
      // attributionControl: false,
    })
    if (!mapDeclaration) return
    // set RMO_PALETTE as a custom color scheme for COG layers, to be used in Bite Index and RM0 layers. This allows us to have consistent colors between COG layers and legend, and to leverage MaplibreCOGProtocol's support for dynamic legends.

    maplibregl.addProtocol('cog', cogProtocol)
    mapDeclaration.setPadding({
      left: getDrawerPaddingLeft(),
    })

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
    const observationsPromise = observationsStore.fetchObservations(true)

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

      // Add boundary layer for selected region in Analize tab
      addBoundaryLayers()

      // Debounced zoom event handler to prevent multiple calls
      const handleZoomChangeDebounced = debounce(() => {
        handleZoomChangeInObservations()
        handleZoomChangeInBoundaries()
      }, 50)

      // Add zoom event listeners - only on zoomend to prevent constant processing
      map.value.on('zoomend', handleZoomChangeDebounced)
    })

    // Init state
    biteIndexStore.fetchLastDate()
  }
})

onUnmounted(() => {
  h3AggregationWorker.terminate()
  if (map.value) {
    map.value.remove()
  }
})

watch(
  () => renderedOriginalDateAggregationData.value,
  (newData) => {
    dataForTimeSeries.value = newData
  },
)

watch(
  () => mapStore.layerSelected,
  async () => {
    await toggleDataLayers()
  },
)

watch(
  () => selectedBiteIndexStyle.value,
  async () => {
    if (!map.value) return

    const biteIndexDate = observationsStore.dateFilter.end || biteIndexStore.lastDateAvailable
    await updateBiteIndexSourceUrl(biteIndexDate)
    hideAllBiteIndexLayers()

    if (mapStore.layerSelected === MosquitoLayersEnum.BITE_INDEX) {
      showSelectedBiteIndexLayer()
    }
  },
)

watch(
  () => taxaStore.taxonSelected,
  async (newTaxon, oldTaxon) => {
    if (!oldTaxon || newTaxon === oldTaxon) return
    geojsonCache.value = markRaw(await observationsStore.fetchObservations(true))
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
  async ({ start, end }, oldValue) => {
    // Skip initial assignment, because initially the dateFilter has null values and has to be computed
    if (!oldValue.start && !oldValue.end) return
    // If the new date filter is the same as the old one, skip processing to avoid unnecessary updates
    if (oldValue.start === start && oldValue.end === end) return
    if (!map.value) return

    if (mapStore.layerSelected === MosquitoLayersEnum.MA_OBSERVATIONS) {
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
    } else if (mapStore.layerSelected === MosquitoLayersEnum.EXTENDED_OBSERVATIONS) {
      // Update only the GBIF source tiles with new date range
      await updateGBIFSourceTiles(start, end)
    } else if (mapStore.layerSelected === MosquitoLayersEnum.RM0) {
      await updateRM0SourceUrl(end)
    } else if (mapStore.layerSelected === MosquitoLayersEnum.BITE_INDEX) {
      await updateBiteIndexSourceUrl(end)
    }
  },
  { deep: true },
)

watch(
  () => observationsFilters.value,
  (newFilters) => {
    if (map.value) {
      const filters = Object.values(newFilters)
      map.value.setFilter(mapStore.maObservationsPointsLayerId, ['all', ...filters])
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
      map.value.setPaintProperty(mapStore.maObservationsPointsLayerId, 'circle-color', '#FF5722')
      if (observationsStore.selectedObservationId) {
        map.value.setFeatureState(
          {
            source: mapStore.maObservationsPointsSourceId,
            id: observationsStore.selectedObservationId,
          },
          { click: false },
        )
      }
      observationsStore.selectedObservationId = null
    } else {
      observationsStore.selectedObservationId = newObservation.uuid
      // paint selected one as red, others as gray
      map.value.setPaintProperty(mapStore.maObservationsPointsLayerId, 'circle-color', [
        'case',
        ['==', ['id'], newObservation.uuid],
        '#FF5722', // selected
        '#888888', // others
      ])
      map.value.setFeatureState(
        { source: mapStore.maObservationsPointsSourceId, id: newObservation.uuid },
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
  () => [uiStore.activeTab, analizeStore.toolSelected],
  ([activeTab, toolSelected], [oldActiveTab, oldToolSelected]) => {
    if (!map.value) return

    const isAnalizeTab = activeTab === drawerTabs.analize.value
    const wasAnalizeTab = oldActiveTab === drawerTabs.analize.value
    const isToolWithBoundaryLayer = toolSelected === toolsEnum.CLICK
    const wasToolWithBoundaryLayer = oldToolSelected === toolsEnum.CLICK

    // If switched away from Analize tab or switched to a tool that doesn't require boundary layer, turn visibility off
    if ((!isAnalizeTab || !isToolWithBoundaryLayer) && wasAnalizeTab && wasToolWithBoundaryLayer) {
      for (const gadmLevel of gadmLevels) {
        const gadmLayer = map.value.getLayer(mapStore.getGadmLayerId(gadmLevel.level))
        if (gadmLayer) {
          map.value.setLayoutProperty(
            mapStore.getGadmLayerId(gadmLevel.level),
            'visibility',
            'none',
          )
        }
        detachBoundaryEvents(gadmLevel.level)
      }
    }

    // If switched to Analize tab and tool that requires boundary layer, turn visibility on
    if (isAnalizeTab && isToolWithBoundaryLayer && (!wasAnalizeTab || !wasToolWithBoundaryLayer)) {
      const zoom = map.value.getZoom()
      const gadmLevelToShow =
        gadmLevels.find((level) => zoom >= level.minZoom && zoom <= level.maxZoom)?.level || 1
      const gadmLayer = map.value.getLayer(mapStore.getGadmLayerId(gadmLevelToShow))
      if (gadmLayer) {
        map.value.setLayoutProperty(
          mapStore.getGadmLayerId(gadmLevelToShow),
          'visibility',
          'visible',
        )
      }
      attachBoundaryEvents(gadmLevelToShow)
      // TODO: Observations layers with less opacity (reset after analysis is done or tool is switched)
    }
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
  // drawer width or zoom level
  () => [uiStore.drawerWidth, map.value?.getZoom()],
  ([newDrawerWidth, newZoom], [oldDrawerWidth, oldZoom]) => {
    if (map.value) {
      // && newDrawerWidth !== oldDrawerWidth) {
      pushMapPaddingUpdate()
    }
  },
)
</script>
