<template>
  <CardDrawer>
    <template #title> Herramientas de análisis </template>
    <template #content>
      <div class="analize-tools border-gray-500 border-1 rounded-lg p-0.5">
        <SelectButton
          v-model="toolSelected"
          :options="toolOptions"
          optionLabel="value"
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
        <div v-if="toolSelected.value === toolsEnum.CLICK" class="p-2">
          Haz click en el mapa para analizar una región administrativa.
        </div>
        <div v-else-if="toolSelected.value === toolsEnum.SEARCH" class="p-2">
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
          <div>
            <span>O si tienes el hashtag de la región, puedes buscar por este.</span>
          </div>
        </div>
        <div v-else-if="toolSelected.value === toolsEnum.DRAW" class="p-2">
          Dibuja un polígono en el mapa para analizar la región que delimites. Dibuja una región no
          muy grande para evitar tiempos de análisis prolongados.
        </div>
      </div>
    </template>
  </CardDrawer>
</template>
<script setup lang="ts">
import { useObservationsStore } from '@/stores/observationsStore'
import { AutoComplete, InputGroup, InputGroupAddon, SelectButton } from 'primevue'
import { ref, shallowRef, watch } from 'vue'
import CardDrawer from '../CardDrawer.vue'

const observationsStore = useObservationsStore()

enum toolsEnum {
  CLICK = 'click',
  SEARCH = 'search',
  DRAW = 'draw',
}

const toolOptions = ref([
  { value: toolsEnum.CLICK, icon: 'ads_click', text: 'Click' },
  { value: toolsEnum.SEARCH, icon: 'search', text: 'Search' },
  { value: toolsEnum.DRAW, icon: 'architecture', text: 'Draw' },
])
const toolSelected = ref(toolOptions.value[0] as { value: toolsEnum; icon: string; text: string })
const observationPointsInBoundary = shallowRef([])
const boundary = shallowRef(null)
const searchQuery = ref('')
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
  console.log(event)
  const regionSelected = event.value.display_name

  // We want now the geometry and other details of the selected region
  const url =
    `https://nominatim.openstreetmap.org/search` +
    `?q=${encodeURIComponent(regionSelected)}` +
    `&format=geojson` +
    `&polygon_geojson=1` +
    `&limit=1` +
    `&addressdetails=1`

  const res = await fetch(url)

  searchResults.value = []
  boundary.value = await res.json()
}

watch(boundary, async (newBoundary) => {
  if (newBoundary) {
    // Fetch observation points within the boundary
    const response = await observationsStore.fetchObservations(newBoundary)
    observationPointsInBoundary.value = response
  } else {
    observationPointsInBoundary.value = []
  }
})
</script>
