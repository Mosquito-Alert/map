import { computed } from 'vue'
import { useMapStore } from '../../stores/mapStore'

const mapStore = useMapStore()

const map = computed(() => mapStore.map) // Computed ref to react to map changes

let hoveredBoundaryId: string | null = null
let boundaryEventsAttached = false

const getADMUrl = (level: number) => {
  return (
    import.meta.env.VITE_GEOSERVER_GWC_URL +
    '?REQUEST=GetTile' +
    '&SERVICE=WMTS' +
    '&VERSION=1.0.0' +
    `&LAYER=mosquitoalert:ADM_${level}` +
    '&STYLE=' +
    '&TILEMATRIXSET=EPSG:900913' +
    '&TILEMATRIX=EPSG:900913:{z}' +
    '&FORMAT=application/vnd.mapbox-vector-tile' +
    '&TILECOL={x}' +
    '&TILEROW={y}'
  )
}

export const gadmLevels = [
  {
    level: 1,
    minZoom: 0,
    maxZoom: 6,
    url: new URL(getADMUrl(1), window.location.origin).toString(),
  },
  {
    level: 2,
    minZoom: 6,
    maxZoom: 8,
    url: new URL(getADMUrl(2), window.location.origin).toString(),
  },
]

// Function to add boundary layers for different regions
export const addBoundaryLayers = async () => {
  if (!map.value) return

  for (const gadmLevel of Object.values(gadmLevels)) {
    const sourceId = mapStore.getGadmSourceId(gadmLevel.level)
    const layerId = mapStore.getGadmLayerId(gadmLevel.level)

    if (!map.value.getSource(sourceId)) {
      map.value.addSource(sourceId, {
        type: 'vector',
        tiles: [gadmLevel.url],
        minzoom: gadmLevel.minZoom,
        maxzoom: gadmLevel.maxZoom,
      })
    }

    if (!map.value.getLayer(layerId)) {
      map.value.addLayer({
        id: layerId,
        source: sourceId,
        'source-layer': `ADM_${gadmLevel.level}`,
        type: 'fill',
        layout: {
          visibility: 'none',
        },
        paint: {
          'fill-color': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            'rgba(255, 0, 0, 0.5)', // Red with opacity when hovered
            'rgba(150, 180, 180, 0.5)', // Default color with opacity
          ],
          'fill-outline-color': 'rgba(150, 180, 180, 1)',
        },
      })
    }
  }
}

// ######### EVENT HANDLERS FOR LAYER #########
const onBoundaryMouseMove = (e: any, gadmLevel: number) => {
  if (!map.value) return

  map.value.getCanvas().style.cursor = 'pointer'

  if (!e.features || e.features.length === 0) return

  const newId = e.features[0].id

  if (hoveredBoundaryId === newId) return

  // remove old hover
  if (hoveredBoundaryId) {
    map.value.setFeatureState(
      {
        source: mapStore.getGadmSourceId(gadmLevel),
        sourceLayer: `ADM_${gadmLevel}`,
        id: hoveredBoundaryId,
      },
      { hover: false },
    )
  }

  hoveredBoundaryId = newId

  // set new hover
  map.value.setFeatureState(
    {
      source: mapStore.getGadmSourceId(gadmLevel),
      sourceLayer: `ADM_${gadmLevel}`,
      id: hoveredBoundaryId as string,
    },
    { hover: true },
  )
}

const onBoundaryMouseLeave = (gadmLevel: number) => {
  if (!map.value) return

  map.value.getCanvas().style.cursor = ''

  if (hoveredBoundaryId) {
    map.value.setFeatureState(
      {
        source: mapStore.getGadmSourceId(gadmLevel),
        sourceLayer: `ADM_${gadmLevel}`,
        id: hoveredBoundaryId,
      },
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

export const attachBoundaryEvents = (gadmLevel: number) => {
  if (!map.value) return
  if (boundaryEventsAttached) return
  if (!map.value.getLayer(mapStore.getGadmLayerId(gadmLevel))) return

  map.value.on('mouseleave', mapStore.getGadmLayerId(gadmLevel), () =>
    onBoundaryMouseLeave(gadmLevel),
  )
  map.value.on('mousemove', mapStore.getGadmLayerId(gadmLevel), (e) =>
    onBoundaryMouseMove(e, gadmLevel),
  )
  // map.value.on('click', mapStore.getGadmLayerId(gadmLevel), (e) => onBoundaryClick(e, gadmLevel))

  boundaryEventsAttached = true
}
export const detachBoundaryEvents = (gadmLevel: number) => {
  if (!map.value) return
  if (!boundaryEventsAttached) return
  if (!map.value.getLayer(mapStore.getGadmLayerId(gadmLevel))) return

  map.value.on('mousemove', mapStore.getGadmLayerId(gadmLevel), (e) =>
    onBoundaryMouseMove(e, gadmLevel),
  )
  map.value.off('mouseleave', mapStore.getGadmLayerId(gadmLevel), () =>
    onBoundaryMouseLeave(gadmLevel),
  )
  // map.value.off('click', mapStore.getGadmLayerId(gadmLevel), (e) => onBoundaryClick(e, gadmLevel))

  // Cleanup hover state, in case mouse is currently hovering an observation when layer is hidden
  onBoundaryMouseLeave(gadmLevel)

  boundaryEventsAttached = false
}

export const handleZoomChangeInBoundaries = async () => {
  if (!map.value) return

  const zoom = map.value.getZoom()

  for (const gadmLevel of Object.values(gadmLevels)) {
    if (zoom >= gadmLevel.minZoom && zoom <= gadmLevel.maxZoom) {
      map.value.setLayoutProperty(mapStore.getGadmLayerId(gadmLevel.level), 'visibility', 'visible')
    } else {
      map.value.setLayoutProperty(mapStore.getGadmLayerId(gadmLevel.level), 'visibility', 'none')
    }
  }
}
