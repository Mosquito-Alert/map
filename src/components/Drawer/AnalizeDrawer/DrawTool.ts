import MapboxDraw from '@mapbox/mapbox-gl-draw'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'

const drawActiveColor = '#fbb03b'
const drawInactiveColor = '#3bb2d0'

const styles = [
  {
    id: 'gl-draw-polygon-fill-inactive',
    type: 'fill',
    filter: [
      'all',
      ['==', 'active', 'false'],
      ['==', '$type', 'Polygon'],
      ['!=', 'mode', 'static'],
    ],
    paint: {
      'fill-color': drawInactiveColor,
      'fill-outline-color': drawInactiveColor,
      'fill-opacity': 0.1,
    },
  },
  {
    id: 'gl-draw-polygon-fill-active',
    type: 'fill',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    paint: {
      'fill-color': drawActiveColor,
      'fill-outline-color': drawActiveColor,
      'fill-opacity': 0.1,
    },
  },
  {
    id: 'gl-draw-polygon-midpoint',
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
    paint: { 'circle-radius': 5, 'circle-color': drawActiveColor },
  },
  {
    id: 'gl-draw-polygon-stroke-inactive',
    type: 'line',
    filter: [
      'all',
      ['==', 'active', 'false'],
      ['==', '$type', 'Polygon'],
      ['!=', 'mode', 'static'],
    ],
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': drawInactiveColor, 'line-width': 4 },
  },
  {
    id: 'gl-draw-polygon-stroke-active',
    type: 'line',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': drawActiveColor, 'line-dasharray': [0.2, 2], 'line-width': 4 },
  },
  {
    id: 'gl-draw-line-inactive',
    type: 'line',
    filter: [
      'all',
      ['==', 'active', 'false'],
      ['==', '$type', 'LineString'],
      ['!=', 'mode', 'static'],
    ],
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': drawInactiveColor, 'line-width': 4 },
  },
  {
    id: 'gl-draw-line-active',
    type: 'line',
    filter: ['all', ['==', '$type', 'LineString'], ['==', 'active', 'true']],
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': drawActiveColor, 'line-dasharray': [0.2, 2], 'line-width': 4 },
  },
  {
    id: 'gl-draw-polygon-and-line-vertex-stroke-inactive',
    type: 'circle',
    filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
    paint: { 'circle-radius': 7, 'circle-color': '#fff' },
  },
  {
    id: 'gl-draw-polygon-and-line-vertex-inactive',
    type: 'circle',
    filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
    paint: { 'circle-radius': 5, 'circle-color': drawActiveColor },
  },
  {
    id: 'gl-draw-point-point-stroke-inactive',
    type: 'circle',
    filter: [
      'all',
      ['==', 'active', 'false'],
      ['==', '$type', 'Point'],
      ['==', 'meta', 'feature'],
      ['!=', 'mode', 'static'],
    ],
    paint: { 'circle-radius': 7, 'circle-opacity': 1, 'circle-color': '#fff' },
  },
  {
    id: 'gl-draw-point-inactive',
    type: 'circle',
    filter: [
      'all',
      ['==', 'active', 'false'],
      ['==', '$type', 'Point'],
      ['==', 'meta', 'feature'],
      ['!=', 'mode', 'static'],
    ],
    paint: { 'circle-radius': 5, 'circle-color': drawInactiveColor },
  },
  {
    id: 'gl-draw-point-stroke-active',
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['==', 'active', 'true'], ['!=', 'meta', 'midpoint']],
    paint: { 'circle-radius': 9, 'circle-color': '#fff' },
  },
  {
    id: 'gl-draw-point-active',
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['!=', 'meta', 'midpoint'], ['==', 'active', 'true']],
    paint: { 'circle-radius': 7, 'circle-color': drawActiveColor },
  },
  {
    id: 'gl-draw-polygon-fill-static',
    type: 'fill',
    filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
    paint: { 'fill-color': '#404040', 'fill-outline-color': '#404040', 'fill-opacity': 0.1 },
  },
  {
    id: 'gl-draw-polygon-stroke-static',
    type: 'line',
    filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': '#404040', 'line-width': 4 },
  },
  {
    id: 'gl-draw-line-static',
    type: 'line',
    filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'LineString']],
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': '#404040', 'line-width': 4 },
  },
  {
    id: 'gl-draw-point-static',
    type: 'circle',
    filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Point']],
    paint: { 'circle-radius': 7, 'circle-color': '#404040' },
  },
]

// MapboxDraw ships with mapboxgl-* class names; remap them to maplibregl-* so controls render.
const drawClassMap = (MapboxDraw.constants as unknown as { classes: Record<string, string> })
  .classes
drawClassMap.CANVAS = 'maplibregl-canvas'
drawClassMap.CONTROL_BASE = 'maplibregl-ctrl'
drawClassMap.CONTROL_PREFIX = 'maplibregl-ctrl-'
drawClassMap.CONTROL_GROUP = 'maplibregl-ctrl-group'
drawClassMap.ATTRIBUTION = 'maplibregl-ctrl-attrib'

export const drawTool = new MapboxDraw({
  displayControlsDefault: false,
  controls: {
    polygon: true,
    trash: true,
  },
  styles,
})

export const updateDrawArea = (e: any) => {
  // Delete previously drawn features to allow only one feature at a time, but only if the event contains features (e.g. not on draw.selectionchange)
  if (e?.features?.length) {
    const createdFeatureIds = e.features
      .map((feature: { id?: string }) => feature.id)
      .filter((id: string | undefined): id is string => typeof id === 'string')

    const existingFeatureIds = drawTool
      .getAll()
      .features.map((feature: { id?: string }) => feature.id)
      .filter(
        (id: string | undefined): id is string =>
          typeof id === 'string' && !createdFeatureIds.includes(id),
      )

    if (existingFeatureIds.length) {
      drawTool.delete(existingFeatureIds)
    }
  }

  console.log(e) // DELETE:
}
