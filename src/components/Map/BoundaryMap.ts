import { computed } from 'vue'
import { useMapStore } from '../../stores/mapStore'

const mapStore = useMapStore()

const map = computed(() => mapStore.map) // Computed ref to react to map changes

let hoveredBoundaryId: string | null = null
let boundaryEventsAttached = false

// Function to add boundary layers for different regions
export const addBoundaryLayers = async () => {
  if (!map.value) return

  const sourceId = mapStore.gadmSourceId
  const layerId = mapStore.gadmLayerId

  if (!map.value.getSource(sourceId)) {
    map.value.addSource(sourceId, {
      type: 'vector',
      tiles: ['https://maps.heigit.org/vector/tiles/public.admin_boundaries_layer/{z}/{x}/{y}.pbf'],
      scheme: 'xyz',
      minzoom: 0,
      maxzoom: 22,
      bounds: [-180, -90, 180, 90],
      attribution: 'Data from OpenStreetMap',
      promoteId: 'id',
      volatile: false,
      encoding: 'mvt',
    })
  }

  if (!map.value.getLayer(layerId)) {
    map.value.addLayer({
      id: layerId,
      source: sourceId,
      'source-layer': 'default',
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

// ######### EVENT HANDLERS FOR LAYER #########
const onBoundaryMouseMove = (e: any) => {
  if (!map.value) return

  map.value.getCanvas().style.cursor = 'pointer'

  console.log(e.features[0])

  if (!e.features || e.features.length === 0) return

  const newId = e.features[0].properties.id

  if (hoveredBoundaryId === newId) return

  // remove old hover
  if (hoveredBoundaryId) {
    map.value.setFeatureState(
      { source: mapStore.gadmSourceId, sourceLayer: 'default', id: hoveredBoundaryId },
      { hover: false },
    )
  }

  hoveredBoundaryId = newId

  // set new hover
  map.value.setFeatureState(
    { source: mapStore.gadmSourceId, sourceLayer: 'default', id: hoveredBoundaryId as string },
    { hover: true },
  )
}

const onBoundaryMouseLeave = () => {
  if (!map.value) return

  map.value.getCanvas().style.cursor = ''

  if (hoveredBoundaryId) {
    map.value.setFeatureState(
      { source: mapStore.gadmSourceId, sourceLayer: 'default', id: hoveredBoundaryId },
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
  if (!map.value.getLayer(mapStore.gadmLayerId)) return

  map.value.on('mouseleave', mapStore.gadmLayerId, onBoundaryMouseLeave)
  map.value.on('mousemove', mapStore.gadmLayerId, onBoundaryMouseMove)
  // map.value.on('click', mapStore.gadmLayerId, onBoundaryClick)

  boundaryEventsAttached = true
}
export const detachBoundaryEvents = () => {
  if (!map.value) return
  if (!boundaryEventsAttached) return
  if (!map.value.getLayer(mapStore.gadmLayerId)) return

  map.value.on('mousemove', mapStore.gadmLayerId, onBoundaryMouseMove)
  map.value.off('mouseleave', mapStore.gadmLayerId, onBoundaryMouseLeave)
  // map.value.off('click', mapStore.gadmLayerId, onBoundaryClick)

  // Cleanup hover state, in case mouse is currently hovering an observation when layer is hidden
  onBoundaryMouseLeave()

  boundaryEventsAttached = false
}
