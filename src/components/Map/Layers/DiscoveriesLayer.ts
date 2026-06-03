import { computed } from 'vue'
import { useMapStore } from '../../../stores/mapStore'
import { useTaxaStore } from '../../../stores/taxaStore'

const mapStore = useMapStore()
const taxaStore = useTaxaStore()

const map = computed(() => mapStore.map) // Computed ref to react to map changes

const buildDiscoveriesSourceUrl = () => {
  const discoveriesTaxonId = taxaStore.discoveriesTaxonId
  if (discoveriesTaxonId == null) return null

  return (
    import.meta.env.VITE_GEOSERVER_URL +
    `/mosquitoalert/wms?` +
    `REQUEST=GetMap&` +
    `SERVICE=WMS&` +
    `VERSION=1.3.0&` +
    `TRANSPARENT=TRUE&` +
    `FORMAT=image/png&` +
    `env=field:${discoveriesTaxonId}&` +
    `LAYERS=mosquitoalert:discoveries&` +
    `WIDTH=256&` +
    `HEIGHT=256&` +
    `CRS=EPSG:3857&` +
    `bbox={bbox-epsg-3857}`
  )
}

const updateDiscoveriesSourceUrl = async () => {
  if (!map.value) return

  const source = map.value.getSource(mapStore.extObservationsSourceId) as
    | { setTiles: (tiles: string[]) => void }
    | undefined

  if (!source) return

  const url = buildDiscoveriesSourceUrl()
  if (!url) return

  source.setTiles([url])
}

// Function to add discoveries layer
export const addDiscoveriesLayer = async () => {
  if (!map.value) return

  const url = buildDiscoveriesSourceUrl()
  if (!url) return

  if (!map.value.getSource(mapStore.extObservationsSourceId)) {
    map.value.addSource(mapStore.extObservationsSourceId, {
      type: 'raster',
      tiles: [url],
      tileSize: 256,
    })
  } else {
    await updateDiscoveriesSourceUrl()
  }

  if (!map.value.getLayer(mapStore.extObservationsLayerId)) {
    map.value.addLayer({
      id: mapStore.extObservationsLayerId,
      type: 'raster',
      source: mapStore.extObservationsSourceId,
      paint: {},
    })
  }
}
