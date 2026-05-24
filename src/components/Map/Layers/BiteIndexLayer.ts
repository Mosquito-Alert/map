import { computed, ref } from 'vue'
import { useMapStore } from '../../../stores/mapStore'
import { BiteIndexStyleEnum } from '../../../utils/constants'

const mapStore = useMapStore()

const map = computed(() => mapStore.map) // Computed ref to react to map changes
export const selectedBiteIndexStyle = ref<BiteIndexStyleEnum>(BiteIndexStyleEnum.RISE) // Default style, can be made dynamic based on user selection

const buildBiteIndexSourceUrl = (date: string, style: BiteIndexStyleEnum) => {
  const datePart = date.slice(0, 10)
  // const styleName = `metricstyle-${style}`
  const styleName = `metricstyle-rise`

  return (
    `${import.meta.env.VITE_GEOSERVER_PROD_URL}/mosquitoalert/wms?` +
    `service=WMS&` +
    `version=1.3.0&` +
    `request=GetMap&` +
    `layers=mosquitoalert:metric&` +
    `STYLES=${styleName}&` +
    // `viewparams=date:${datePart}&` +
    `viewparams=date:2025-05-05&` +
    `format=image/png&` +
    `transparent=true` +
    `tiled=true&` +
    `srs=EPSG:3857&` +
    `bbox={bbox-epsg-3857}&` +
    `width=256&` +
    `height=256`
  )
}

// Function to add Bite Index layers
export const addBiteIndexLayers = async (date?: string | null) => {
  if (!map.value) return

  for (const style of Object.values(BiteIndexStyleEnum)) {
    const sourceId = mapStore.getBiteIndexSourceId(style)
    const layerId = mapStore.getBiteIndexLayerId(style)

    if (!map.value.getSource(sourceId)) {
      map.value.addSource(sourceId, {
        type: 'raster',
        tiles: [buildBiteIndexSourceUrl(date || new Date().toISOString(), style)],
        tileSize: 256,
      })
    }

    if (!map.value.getLayer(layerId)) {
      map.value.addLayer({
        id: layerId,
        type: 'raster',
        source: sourceId,
      })
    }
  }
}
