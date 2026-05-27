import { computed } from 'vue'
import { useMapStore } from '../../../stores/mapStore'

const mapStore = useMapStore()

const map = computed(() => mapStore.map) // Computed ref to react to map changes

const buildRM0SourceUrl = (date: string) => {
  const minValue = 1 // The minimum value in the dataset is 0, but 1 is the threshold for R0
  // The maximum value in the dataset is dynamic, but we consider that a value
  // of 7 or higher indicates a very high R0, so we set it as the upper bound for the color scale
  const maxValue = 7
  const datePart = date.slice(0, 10)
  // Styles: https://labs.geomatico.es/maplibre-cog-protocol/color-cheatsheet.html
  return `cog://${import.meta.env.VITE_METRICS_RASTER_URL}/${datePart}T00:00.tiff#color:BrewerOrRd9,${minValue},${maxValue},c`
}

export const updateRM0SourceUrl = async (date?: string | null) => {
  if (!map.value || !date) return

  const source = map.value.getSource(mapStore.rm0SourceId) as
    | { setUrl: (url: string) => void }
    | undefined

  if (!source) return

  source.setUrl(buildRM0SourceUrl(date))
}

// Function to add RM0 layer
export const addRM0Layer = async (date?: string | null) => {
  if (!map.value) return

  if (!map.value.getSource(mapStore.rm0SourceId)) {
    map.value.addSource(mapStore.rm0SourceId, {
      type: 'raster',
      url: buildRM0SourceUrl(date || new Date().toISOString()),
      tileSize: 256,
    })
  }

  if (!map.value.getLayer(mapStore.rm0LayerId)) {
    map.value.addLayer({
      id: mapStore.rm0LayerId,
      type: 'raster',
      source: mapStore.rm0SourceId,
      paint: {
        // 'raster-opacity': 0.7,
      },
    })
  }
}
