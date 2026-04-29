import { computed } from 'vue'
import { useMapStore } from '../../../stores/mapStore'
import { useTaxaStore } from '../../../stores/taxaStore'

const mapStore = useMapStore()
const taxaStore = useTaxaStore()

const map = computed(() => mapStore.map) // Computed ref to react to map changes

// Function to add discoveries layer
export const addDiscoveriesLayer = async () => {
  if (!map.value) return

  if (!map.value.getSource(mapStore.extObservationsSourceId)) {
    const discoveriesTaxonId = taxaStore.discoveriesTaxonId
    const width = 256
    const height = 256
    const crs = 'EPSG:3857'
    map.value.addSource(mapStore.extObservationsSourceId, {
      type: 'raster',
      tiles: [
        `/geoserver/mosquitoalert/wms?REQUEST=GetMap&SERVICE=WMS&VERSION=1.3.0&TRANSPARENT=TRUE&FORMAT=image/png&env=field:${discoveriesTaxonId}&LAYERS=mosquitoalert:discoveries&WIDTH=${width}&HEIGHT=${height}&CRS=${crs}&bbox={bbox-epsg-3857}`,
      ],
      tileSize: 256,
    })
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
