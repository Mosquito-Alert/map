import { computed } from 'vue'
import { useMapStore } from '../../../stores/mapStore'
import { useTaxaStore } from '../../../stores/taxaStore'
import { GBIF_DENSITY_STYLE } from '../../../utils/constants'

const mapStore = useMapStore()
const taxaStore = useTaxaStore()

const map = computed(() => mapStore.map) // Computed ref to react to map changes

// GBIF tile configuration constants
const GBIF_CONFIG = {
  hexPerTile: 70, // Higher values mean more hexagons per tile === better representation of data but worse performance.
  srs: 'EPSG:3857',
  style: GBIF_DENSITY_STYLE,
  defaultFirstYear: 1900,
}

// Build GBIF tile URL with date range
const buildGBIFTileUrl = (
  gbifId: string,
  startDate?: string | null,
  endDate?: string | null,
): string => {
  const firstYear = startDate ? new Date(startDate).getFullYear() : GBIF_CONFIG.defaultFirstYear
  const lastYear = endDate ? new Date(endDate).getFullYear() : new Date().getFullYear()
  const { hexPerTile, srs, style } = GBIF_CONFIG

  return `https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}@1x.png?style=${style}&bin=hex&hexPerTile=${hexPerTile}&taxonKey=${gbifId}&srs=${srs}&year=${firstYear},${lastYear}`
}

// Function to add GBIF occurences for different species
export const addGBIFOccurrencesLayer = async (
  startDate?: string | null,
  endDate?: string | null,
) => {
  if (!map.value) return

  const gbifId = (await taxaStore.getGbifIdForSelectedTaxon()) || ''
  const sourceId = mapStore.getGbifSourceId(gbifId)
  const layerId = mapStore.getGbifLayerId(gbifId)

  if (!map.value.getSource(sourceId)) {
    const tileUrl = buildGBIFTileUrl(gbifId, startDate, endDate)
    map.value.addSource(sourceId, {
      type: 'raster',
      tiles: [tileUrl],
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

// Function to update only the GBIF source tiles with new year range
export const updateGBIFSourceTiles = async (startDate?: string | null, endDate?: string | null) => {
  if (!map.value) return

  const gbifId = (await taxaStore.getGbifIdForSelectedTaxon()) || ''
  const sourceId = mapStore.getGbifSourceId(gbifId)
  const source = map.value.getSource(sourceId) as maplibregl.RasterTileSource | undefined

  if (!source) return

  const tileUrl = buildGBIFTileUrl(gbifId, startDate, endDate)
  source.setTiles([tileUrl])
}
