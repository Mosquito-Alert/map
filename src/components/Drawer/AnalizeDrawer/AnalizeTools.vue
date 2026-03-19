<template>
  <CardDrawer>
    <template #title> Herramientas de análisis </template>
    <template #content>
      <div class="analize-tools border-gray-500 border-1 rounded-lg p-0.5">
        <SelectButton
          v-model="analizeStore.toolSelected"
          :options="toolOptions"
          optionLabel="text"
          optionValue="value"
          dataKey="value"
          fluid
        >
          <template #option="slotProps">
            <div class="flex flex-col items-center">
              <span class="material-icons-outlined"> {{ slotProps.option.icon }} </span>
              <span class="ml-2"> {{ slotProps.option.text }} </span>
            </div>
          </template>
        </SelectButton>
        <div v-if="analizeStore.toolSelected === toolsEnum.CLICK" class="p-2">
          Haz click en el mapa para analizar una región administrativa.
        </div>
        <div v-else-if="analizeStore.toolSelected === toolsEnum.SEARCH" class="p-2">
          <div>
            <span>Busca una región administrativa para analizarla.</span>
            <InputGroup>
              <InputGroupAddon>
                <span class="material-icons-outlined"> location_on </span>
              </InputGroupAddon>
              <AutoComplete
                v-model="searchQuery"
                :suggestions="searchResults"
                optionLabel="display_name"
                :loading="loading"
                @optionSelect="selectResult"
                @complete="searchNominatim"
                :delay="350"
                placeholder="Busca por una región administrativa..."
              />
              <InputGroupAddon>
                <!-- <Button severity="secondary" variant="text" @click="searchNominatim"> -->
                <span class="material-icons-outlined"> search </span>
                <!-- </Button> -->
              </InputGroupAddon>
            </InputGroup>
          </div>
          <div class="mt-5">
            <span>O si tienes el hashtag de la región, puedes buscar por este.</span>
            <InputGroup>
              <InputGroupAddon>
                <span class="material-icons-outlined"> tag </span>
              </InputGroupAddon>
              <InputText
                v-model="searchTagQuery"
                type="text"
                id="hashtag-search"
                placeholder="Busca por hashtag..."
                disabled
              />
              <InputGroupAddon>
                <span class="material-icons-outlined"> search </span>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </div>
        <div v-else-if="analizeStore.toolSelected === toolsEnum.DRAW" class="p-2">
          Dibuja un polígono en el mapa para analizar la región que delimites. Dibuja una región no
          muy grande para evitar tiempos de análisis prolongados.
        </div>
      </div>
    </template>
  </CardDrawer>
</template>
<script setup lang="ts">
import { toolsEnum, useAnalizeStore } from '@/stores/analizeStore'
import { useMapStore } from '@/stores/mapStore'
import { bbox } from '@turf/turf'
import { AutoComplete, InputGroup, InputGroupAddon, InputText, SelectButton } from 'primevue'
import { computed, ref, watch } from 'vue'
import CardDrawer from '../CardDrawer.vue'

const analizeStore = useAnalizeStore()
const mapStore = useMapStore()

const map = computed(() => mapStore.map) // Computed ref to react to map changes
const toolOptions = ref([
  { value: toolsEnum.CLICK, icon: 'ads_click', text: 'Click' },
  { value: toolsEnum.SEARCH, icon: 'search', text: 'Search' },
  { value: toolsEnum.DRAW, icon: 'architecture', text: 'Draw' },
])
const searchQuery = ref('')
const searchTagQuery = ref('')
const searchResults = ref([])
const loading = ref(false)

const searchNominatim = async (event: { query: string }) => {
  loading.value = true

  // Minimum data response (we only want the names)
  const url =
    `https://nominatim.openstreetmap.org/search` +
    `?q=${encodeURIComponent(event.query)}` +
    `&format=json` +
    `&limit=5`

  const res = await fetch(url)

  searchResults.value = await res.json()
  loading.value = false
}

const selectResult = async (event: { value: any }) => {
  const selectedRegion = event.value.display_name

  // We want now the geometry and other details of the selected region
  const url =
    `https://nominatim.openstreetmap.org/search` +
    `?q=${encodeURIComponent(selectedRegion)}` +
    `&format=geojson` +
    `&polygon_geojson=1` +
    `&limit=1` +
    `&addressdetails=1` +
    `&extratags=1`

  const res = await fetch(url)

  searchResults.value = []
  analizeStore.selectedRegion = await res.json()
  await analizeStore.getDataOfRegion()
}

const showBoundary = (geojson: GeoJSON.FeatureCollection) => {
  if (!map.value) return

  const selectedRegionSource = map.value.getSource(mapStore.selectedRegionSourceId) as
    | maplibregl.GeoJSONSource
    | undefined
  const selectedRegionLayer = map.value.getLayer(mapStore.selectedRegionLayerId)
  if (selectedRegionSource && selectedRegionLayer) {
    selectedRegionSource.setData(geojson)
    map.value.setLayoutProperty(mapStore.selectedRegionLayerId, 'visibility', 'visible')
  } else {
    map.value.addSource(mapStore.selectedRegionSourceId, {
      type: 'geojson',
      data: geojson,
    })

    map.value.addLayer({
      id: mapStore.selectedRegionLayerId,
      source: mapStore.selectedRegionSourceId,
      type: 'line',
      layout: {
        visibility: 'visible',
      },
      paint: {
        'line-color': '#0044aa',
        'line-width': 2,
      },
    })
  }

  zoomToRegion(geojson)
}

const zoomToRegion = (geojson: GeoJSON.FeatureCollection) => {
  if (!map.value) return
  const bounds = geojson.features[0]?.bbox || bbox(geojson)

  map.value.fitBounds(
    [
      [bounds[0], bounds[1]],
      [bounds[2], bounds[3]],
    ],
    { padding: 40 },
  )
}

watch(
  () => analizeStore.selectedRegion,
  async (newBoundary: GeoJSON.FeatureCollection | null) => {
    if (newBoundary) {
      showBoundary(newBoundary as any)
    } else {
      map.value?.setLayoutProperty(mapStore.selectedRegionLayerId, 'visibility', 'none')
    }
  },
  {
    deep: true,
  },
)
</script>
