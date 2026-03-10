import { computed } from 'vue'
import { useMapStore } from '../../stores/mapStore'
import { useTaxaStore } from '../../stores/taxaStore'

const mapStore = useMapStore()
const taxaStore = useTaxaStore()

const map = computed(() => mapStore.map) // Computed ref to react to map changes

// Function to add GBIF occurences for different species
export const addGBIFOccurrencesLayer = async () => {
  if (!map.value) return

  const gbifId = (await taxaStore.getGbifIdForSelectedTaxon()) || ''

  const sourceId = mapStore.getGbifSourceId(gbifId)
  const layerId = mapStore.getGbifLayerId(gbifId)

  if (!map.value.getSource(sourceId)) {
    const hexPerTile = 70 // Higher values mean more hexagons per tile === better representation of data but worse performance.
    const srs = 'EPSG:3857'
    const style = 'green2.poly'
    map.value.addSource(sourceId, {
      type: 'raster',
      tiles: [
        `https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}@1x.png?style=${style}&bin=hex&hexPerTile=${hexPerTile}&taxonKey=${gbifId}&srs=${srs}`,
      ],
      tileSize: 256,
    })
  }

  if (!map.value.getLayer(layerId)) {
    map.value.addLayer({
      id: layerId,
      source: sourceId,
      type: 'raster',
      layout: {
        visibility: 'none',
      },
      paint: {},
    })
  }
}
