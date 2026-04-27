import { computed } from 'vue'
import { toolsEnum, useAnalizeStore } from '../../stores/analizeStore'
import { useMapStore } from '../../stores/mapStore'
import { drawerTabs, useUIStore } from '../../stores/uiStore'
import { calculateArea } from '../../utils/regionDetails'

const uiStore = useUIStore()
const mapStore = useMapStore()
const analizeStore = useAnalizeStore()

const map = computed(() => mapStore.map) // Computed ref to react to map changes

let hoveredBoundaryId: string | null = null

const getADMUrl = (level: number) => {
  return (
    import.meta.env.VITE_GEOSERVER_URL +
    '/mosquitoalert/gwc/service/wmts' +
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
type BoundaryEventHandlers = {
  mouseleave: () => void
  mousemove: (e: any) => void
  click: (e: any) => void
}

// The handlers ensure that we only create one set of event handlers per GADM level and can reuse them when attaching/detaching events, avoiding unnecessary re-creations of functions on every zoom change.
const boundaryEventHandlers = new Map<number, BoundaryEventHandlers>()
const attachedBoundaryLevels = new Set<number>()

const getBoundaryEventHandlers = (gadmLevel: number) => {
  const existingHandlers = boundaryEventHandlers.get(gadmLevel)

  if (existingHandlers) {
    return existingHandlers
  }

  const handlers: BoundaryEventHandlers = {
    mouseleave: () => onBoundaryMouseLeave(gadmLevel),
    mousemove: (e) => onBoundaryMouseMove(e, gadmLevel),
    click: (e) => onBoundaryClick(e, gadmLevel),
  }

  boundaryEventHandlers.set(gadmLevel, handlers)

  return handlers
}

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

const onBoundaryClick = async (e: any, gadmLevel: number) => {
  if (!map.value) return

  if (!e.features || e.features.length === 0) return

  const id = e.features[0].id

  const wfsUrl =
    import.meta.env.VITE_GEOSERVER_URL +
    '/wfs' +
    '?service=WFS' +
    '&version=1.0.0' +
    '&request=GetFeature' +
    `&typeName=mosquitoalert:ADM_${gadmLevel}` +
    '&outputFormat=application/json' +
    `&featureID=${id}`

  const feature = await fetch(wfsUrl)
    .then((response) => response.json())
    .catch((error) => {
      console.error('Error fetching boundary details:', error)
    })

  analizeStore.clearSelectedRegion()
  analizeStore.selectedRegion = feature as GeoJSON.FeatureCollection
  analizeStore.extensionOfSelectedRegion = calculateArea(feature.features[0])
}

export const attachBoundaryEvents = (gadmLevel: number) => {
  if (!map.value) return

  const layerId = mapStore.getGadmLayerId(gadmLevel)
  if (!map.value.getLayer(layerId)) return
  if (attachedBoundaryLevels.has(gadmLevel)) return

  const handlers = getBoundaryEventHandlers(gadmLevel)

  map.value.on('mouseleave', layerId, handlers.mouseleave)
  map.value.on('mousemove', layerId, handlers.mousemove)
  map.value.on('click', layerId, handlers.click)

  attachedBoundaryLevels.add(gadmLevel)
}
export const detachBoundaryEvents = (gadmLevel: number) => {
  if (!map.value) return

  const layerId = mapStore.getGadmLayerId(gadmLevel)
  const handlers = boundaryEventHandlers.get(gadmLevel)

  if (!handlers) return

  if (map.value.getLayer(layerId)) {
    map.value.off('mouseleave', layerId, handlers.mouseleave)
    map.value.off('mousemove', layerId, handlers.mousemove)
    map.value.off('click', layerId, handlers.click)
  }

  attachedBoundaryLevels.delete(gadmLevel)

  // Cleanup hover state in case the hidden layer was the one being hovered.
  onBoundaryMouseLeave(gadmLevel)
}

export const handleZoomChangeInBoundaries = async () => {
  if (
    !map.value ||
    uiStore.activeTab !== drawerTabs.analize.value ||
    analizeStore.toolSelected !== toolsEnum.CLICK
  )
    return

  const zoom = map.value.getZoom()

  for (const gadmLevel of Object.values(gadmLevels)) {
    if (zoom >= gadmLevel.minZoom && zoom <= gadmLevel.maxZoom) {
      map.value.setLayoutProperty(mapStore.getGadmLayerId(gadmLevel.level), 'visibility', 'visible')
      attachBoundaryEvents(gadmLevel.level)
    } else {
      map.value.setLayoutProperty(mapStore.getGadmLayerId(gadmLevel.level), 'visibility', 'none')
      detachBoundaryEvents(gadmLevel.level)
    }
  }
}
