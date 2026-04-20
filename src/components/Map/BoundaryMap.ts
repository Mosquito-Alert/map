import { computed } from 'vue'
import { FeatureLayer } from '@esri/maplibre-arcgis'
import { useAnalizeStore } from '../../stores/analizeStore'
import { useMapStore } from '../../stores/mapStore'

const mapStore = useMapStore()
const analizeStore = useAnalizeStore()
const WB_GAD_FEATURESERVER_BASE_URL =
  'https://services.arcgis.com/iQ1dY19aHwbSDYIF/arcgis/rest/services/World_Bank_Global_Administrative_Divisions/FeatureServer'

const map = computed(() => mapStore.map) // Computed ref to react to map changes

let hoveredBoundaryId: string | number | null = null
let boundaryEventsAttached = false
const loadedBoundaryLevels = new Set<1 | 2>()
const layerIdByLevel: Partial<Record<1 | 2, string>> = {}
const sourceIdByLevel: Partial<Record<1 | 2, string>> = {}

const getBoundaryLevelForZoom = (zoom: number): 1 | 2 => {
  if (zoom < 7) return 1
  return 2
}

const WB_GAD_LAYER_BY_LEVEL: Record<1 | 2, number> = {
  // Keep app levels (0,1,2) mapped to administrative levels ADM0, ADM1 and ADM2.
  1: 2,
  2: 3,
}

const getBoundaryUrlForLevel = (level: 1 | 2) =>
  `${WB_GAD_FEATURESERVER_BASE_URL}/${WB_GAD_LAYER_BY_LEVEL[level]}`

const hideAllBoundaryLevels = () => {
  if (!map.value) return
  ;([1, 2] as const).forEach((level) => {
    const layerId = layerIdByLevel[level]
    if (layerId && map.value?.getLayer(layerId)) {
      map.value.setLayoutProperty(layerId, 'visibility', 'none')
    }
  })
}

const activateBoundaryLevel = (level: 1 | 2, visible: boolean) => {
  if (!map.value) return

  const layerId = layerIdByLevel[level]
  const sourceId = sourceIdByLevel[level]
  if (!layerId || !sourceId) return
  if (!map.value.getLayer(layerId)) return

  hideAllBoundaryLevels()
  map.value.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none')

  mapStore.gadmLayerId = layerId
  mapStore.gadmSourceId = sourceId
}

const loadBoundaryLevel = async (level: 1 | 2) => {
  if (!map.value) return
  if (loadedBoundaryLevels.has(level)) return

  const boundaryLayer = await FeatureLayer.fromUrl(getBoundaryUrlForLevel(level), {
    // Keep network usage scoped to the view and avoid snapshot checks.
    // _loadingMode: 'ondemand',
  } as any)

  const firstLayer = boundaryLayer.layer ?? boundaryLayer.layers?.[0]
  if (!firstLayer) return

  if (!map.value.getLayer(firstLayer.id)) {
    boundaryLayer.addSourcesAndLayersTo(map.value)
  }

  layerIdByLevel[level] = firstLayer.id
  sourceIdByLevel[level] = firstLayer.source
  loadedBoundaryLevels.add(level)

  map.value.setLayoutProperty(firstLayer.id, 'visibility', 'none')

  if (map.value.getLayer(firstLayer.id)?.type === 'fill') {
    map.value.setPaintProperty(firstLayer.id, 'fill-color', [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      'rgba(255, 0, 0, 0.5)',
      'rgba(150, 180, 180, 0.5)',
    ])
    map.value.setPaintProperty(firstLayer.id, 'fill-outline-color', 'rgba(150, 180, 180, 1)')
  }
}

const syncBoundaryLevelWithZoom = (visible: boolean) => {
  if (!map.value) return
  const targetLevel = getBoundaryLevelForZoom(map.value.getZoom())
  activateBoundaryLevel(targetLevel, visible)
}

const onBoundaryZoomEnd = () => {
  if (!map.value) return

  const previousLayerId = mapStore.gadmLayerId
  syncBoundaryLevelWithZoom(true)

  if (previousLayerId === mapStore.gadmLayerId) return

  if (map.value.getLayer(previousLayerId)) {
    map.value.off('mouseleave', previousLayerId, onBoundaryMouseLeave)
    map.value.off('mousemove', previousLayerId, onBoundaryMouseMove)
    map.value.off('click', previousLayerId, onBoundaryClick)
  }

  if (map.value.getLayer(mapStore.gadmLayerId)) {
    map.value.on('mouseleave', mapStore.gadmLayerId, onBoundaryMouseLeave)
    map.value.on('mousemove', mapStore.gadmLayerId, onBoundaryMouseMove)
    map.value.on('click', mapStore.gadmLayerId, onBoundaryClick)
  }
}

// Function to add boundary layers for different regions
export const addBoundaryLayers = async () => {
  if (!map.value) return

  try {
    // Equivalent of layers=show:1,2 using FeatureServer sublayers.
    await Promise.all([loadBoundaryLevel(1), loadBoundaryLevel(2)])
  } catch (error) {
    console.error('Failed to initialize ArcGIS boundary levels 1 and 2', error)
    return
  }

  syncBoundaryLevelWithZoom(false)
}

// ######### EVENT HANDLERS FOR LAYER #########
const onBoundaryMouseMove = (e: any) => {
  if (!map.value) return

  map.value.getCanvas().style.cursor = 'pointer'

  if (!e.features || e.features.length === 0) return

  const newId = e.features[0].id as string | number | undefined
  if (newId === undefined) return

  if (hoveredBoundaryId === newId) return

  // remove old hover
  if (hoveredBoundaryId !== null) {
    map.value.setFeatureState(
      { source: mapStore.gadmSourceId, id: hoveredBoundaryId },
      { hover: false },
    )
  }

  hoveredBoundaryId = newId

  // set new hover
  map.value.setFeatureState(
    { source: mapStore.gadmSourceId, id: hoveredBoundaryId },
    { hover: true },
  )
}

const onBoundaryClick = async (e: any) => {
  // TODO: Reset store related to the selected region when clicking
  if (!map.value) return

  console.log('HOLA')
  console.log(e.features[0].properties)

  const clickedFeature = e.features?.[0]
  if (!clickedFeature?.geometry) return

  const properties = { ...(clickedFeature.properties || {}) }
  let displayName = properties.NAM_2 || properties.NAM_1 || properties.NAM_0 || 'Selected region'
  displayName = `${displayName.split('/')[0].trim()}`
  const featureId = clickedFeature.id ?? properties.FID ?? properties.OBJECTID

  analizeStore.selectedRegion = {
    type: 'FeatureCollection',
    features: [
      {
        id: featureId,
        type: 'Feature',
        properties: {
          ...properties,
          name: displayName,
          display_name: displayName,
        },
        geometry: clickedFeature.geometry,
      },
    ],
  } as GeoJSON.FeatureCollection

  await analizeStore.getDataOfRegion()
}

const onBoundaryMouseLeave = () => {
  if (!map.value) return

  map.value.getCanvas().style.cursor = ''

  if (hoveredBoundaryId !== null) {
    map.value.setFeatureState(
      { source: mapStore.gadmSourceId, id: hoveredBoundaryId },
      { hover: false },
    )
  }

  hoveredBoundaryId = null
}

// const onBoundaryClick = (e: any) => {
//   if (!map.value) return

//   const features = map.value.queryRenderedFeatures(e.point, {
//     layers: [mapStore.observationsPointsLayerId],
//   })

//   if (!features.length) return

//   if (observationsStore.selectedObservationId) {
//     map.value.setFeatureState(
//       { source: mapStore.observationsPointsSourceId, id: observationsStore.selectedObservationId },
//       { click: false },
//     )
//   }

//   const clickedId = features[0]?.properties.uuid as string

//   // If clicking the already selected one → deselect
//   if (observationsStore.selectedObservationId === clickedId) {
//     map.value.setFeatureState(
//       { source: mapStore.observationsPointsSourceId, id: observationsStore.selectedObservationId },
//       { click: false },
//     )

//     observationsStore.selectedObservationId = null

//     // Reset: all red
//     map.value.setPaintProperty(mapStore.observationsPointsLayerId, 'circle-color', '#FF5722')
//     return
//   }

//   observationsStore.fetchObservationById(clickedId)
// }

export const attachBoundaryEvents = () => {
  if (!map.value) return
  if (boundaryEventsAttached) return

  syncBoundaryLevelWithZoom(true)
  if (!map.value.getLayer(mapStore.gadmLayerId)) return

  map.value.on('mouseleave', mapStore.gadmLayerId, onBoundaryMouseLeave)
  map.value.on('mousemove', mapStore.gadmLayerId, onBoundaryMouseMove)
  map.value.on('zoomend', onBoundaryZoomEnd)
  map.value.on('click', mapStore.gadmLayerId, onBoundaryClick)

  boundaryEventsAttached = true
}
export const detachBoundaryEvents = () => {
  if (!map.value) return
  if (!boundaryEventsAttached) return

  if (map.value.getLayer(mapStore.gadmLayerId)) {
    map.value.off('mousemove', mapStore.gadmLayerId, onBoundaryMouseMove)
    map.value.off('mouseleave', mapStore.gadmLayerId, onBoundaryMouseLeave)
    map.value.off('click', mapStore.gadmLayerId, onBoundaryClick)
    map.value.setLayoutProperty(mapStore.gadmLayerId, 'visibility', 'none')
  }

  map.value.off('zoomend', onBoundaryZoomEnd)

  // Cleanup hover state, in case mouse is currently hovering an observation when layer is hidden
  onBoundaryMouseLeave()

  boundaryEventsAttached = false
}
