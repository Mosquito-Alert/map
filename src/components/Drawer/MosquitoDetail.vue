<template>
  <CardDrawer :highlightBorder="diseases.length > 0" :supportingButton="!seeAdditionalDetails">
    <template #title>
      <div class="flex justify-between items-center">
        <h2
          class="text-2xl font-bold text-gray-700"
          :class="{
            italic: taxaStore.taxonSelected?.italicize,
          }"
        >
          {{ taxaStore.taxonSelected?.name }}
        </h2>
        <div>
          <Button
            aria-label="Download"
            variant="text"
            severity="primary"
            class="hidden sm:inline"
            disabled
          >
            <span class="material-icons-outlined"> file_download </span>
          </Button>
          <Button
            aria-label="Close"
            variant="text"
            severity="secondary"
            @click="() => (taxaStore.taxonSelected = culicidaeTaxon as Taxon)"
          >
            <span class="material-icons-outlined"> close </span>
          </Button>
        </div>
      </div>
    </template>
    <template #content>
      <Tag
        value="Vector de enfermedad"
        v-if="diseases.length > 0"
        v-tooltip.bottom="{
          value: diseases.join(', '),
          pt: { root: { class: 'max-w-xs' } },
        }"
      >
        <template #icon>
          <span class="material-icons-outlined text-2xl! leading-none">coronavirus</span>
        </template>
      </Tag>

      <div class="mosquito-details mt-3">
        <div class="flex items-center justify-start gap-1 mb-2">
          <div class="material-icons-outlined text-2xl! leading-none">location_on</div>
          <div>
            <span>Origen: </span>
            <span class="font-bold">Sudeste asiático</span>
          </div>
        </div>
      </div>

      <div class="discoveries flex items-center mt-5">
        <Checkbox v-model="mapStore.showDiscoveries" :inputId="'showDiscoveries'" binary />
        <label class="pl-3 font-semibold cursor-pointer" for="showDiscoveries">
          Mostrar descubrimientos de la comunidad
        </label>
      </div>

      <div class="near-discoveries mt-6">
        <!-- <h4 class="text-lg font-semibold text-gray-800 mb-2">Observaciones cerca de ti</h4> -->
        <div class="flex row items-center justify-between mb-2">
          <h4 class="text-lg font-semibold text-gray-800">Observaciones</h4>
          <div
            class="flex items-center gap-2"
            v-tooltip.right="{
              value: userDeniedGeolocation
                ? 'Permite el acceso a tu ubicación para ver las observaciones cerca de ti'
                : 'Mostrar solo las observaciones cerca de tu ubicación',
              pt: { root: { class: 'max-w-xs' } },
            }"
          >
            <Checkbox
              v-model="showObservationsNearMe"
              :inputId="'showObservationsNearMe'"
              name="showObservationsNearMe"
              :disabled="userDeniedGeolocation"
              binary
            />
            <label for="showObservationsNearMe" class="cursor-pointer"> Cerca de mi </label>
          </div>
        </div>
        <!-- TODO: Make this lazy: fetch photos on request -->
        <Carousel
          v-if="!fetchingObservations"
          :value="observationsStore.near_observations"
          :numVisible="2"
          :numScroll="1"
          :responsiveOptions="responsiveOptions"
          :showIndicators="false"
        >
          <template #item="slotProps">
            <div class="border border-surface-200 dark:border-surface-700 rounded mx-1">
              <div class="relative mx-auto">
                <img
                  :src="slotProps.data.photos[0].url"
                  class="w-2xs aspect-2/3 object-cover rounded"
                />
                <Tag
                  :value="`Hace ${daysSince(slotProps.data.created_at)} días`"
                  class="absolute text-xs"
                  style="right: 0.25rem; top: 0.25rem"
                />
                <Tag :value="'7 km'" class="absolute text-xs" style="right: 0.25rem; top: 2rem" />
              </div>
            </div>
          </template>
        </Carousel>
        <ProgressSpinner class="flex justify-center" v-else />
      </div>

      <div v-if="seeAdditionalDetails" class="additional-details">
        <div class="mosquito-info mt-6">
          <h4 class="text-lg font-semibold text-gray-800 mb-2">Información del mosquito</h4>
          <p v-if="!fetchingMosquitoInfo" class="text-gray-700">{{ mosquitoInfo }}</p>
          <ProgressSpinner v-else class="flex justify-center" />
        </div>
        <div class="mosquito-layers mt-6">
          <h4 class="text-lg font-semibold text-gray-800 mb-3">Capas</h4>
          <div class="flex flex-col gap-3">
            <div v-for="layer in mosquitoLayers" :key="layer.key" class="flex items-start gap-2">
              <RadioButton
                v-model="mapStore.layerSelected"
                :inputId="layer.key"
                name="mosquito layer"
                :value="layer.key"
              />
              <label :for="layer.key" class="cursor-pointer">{{ layer.label }}</label>
              <Button
                aria-label="Download"
                variant="text"
                class="hidden sm:inline p-0 m-0"
                disabled
              >
                <span class="material-icons-outlined text-gray-800"> file_download </span>
              </Button>
              <div
                class="layer-information"
                v-tooltip.right="{
                  value: layer.info,
                  pt: { root: { class: 'max-w-xs' } },
                }"
              >
                <span class="material-icons-outlined text-gray-800"> info </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #supporting-button>
      <Button
        label="Ver más"
        class="w-fit bg-white text-gray-800 border-gray-800 p-2 leading-none"
        @click="showAdditionalDetails"
      />
    </template>
  </CardDrawer>
</template>
<script setup lang="ts">
import type { Taxon } from 'mosquito-alert'
import { Button, Carousel, Checkbox, ProgressSpinner, RadioButton, Tag } from 'primevue'
import { onMounted, ref, watch } from 'vue'
import { summary as wikipediaSummary } from 'wikipedia'
import { useMapStore } from '../../stores/mapStore'
import { useObservationsStore } from '../../stores/observationsStore'
import { culicidaeTaxon, useTaxaStore } from '../../stores/taxaStore'
import { mosquitoLayers } from '../../utils/constants'
import { daysSince } from '../../utils/date'
import CardDrawer from './CardDrawer.vue'

const taxaStore = useTaxaStore()
const mapStore = useMapStore()
const observationsStore = useObservationsStore()

const fetchingObservations = ref(false)
const diseases = ['Dengue', 'Fiebre Amarilla', 'Virus del Nilo Occidental']
const seeAdditionalDetails = ref(false)
const mosquitoInfo = ref('')
const fetchingMosquitoInfo = ref(false)
const showObservationsNearMe = ref(false)
const userDeniedGeolocation = ref(false)

onMounted(async () => {
  if (taxaStore.taxonSelected) {
    fetchingObservations.value = true
    await observationsStore.fetchObservationsNearMe(10)
    fetchingObservations.value = false
  }

  // Check if user has geolocation permissions
  if (navigator.permissions) {
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'geolocation' })
      if (permissionStatus.state === 'denied') {
        userDeniedGeolocation.value = true
      }
    } catch (error) {
      console.error('Error checking geolocation permissions:', error)
    }
  }
})

const showAdditionalDetails = async () => {
  seeAdditionalDetails.value = true
  fetchingMosquitoInfo.value = true
  if (!taxaStore.taxonSelected) return ''
  const taxonName = taxaStore.taxonSelected.name
  const title = taxonName.toLowerCase().replace(/ /g, '_')
  const summary = await wikipediaSummary(title)
  mosquitoInfo.value = summary.extract || 'Información no disponible.'
  fetchingMosquitoInfo.value = false
}

const responsiveOptions = ref([
  {
    breakpoint: '1400px',
    numVisible: 2,
    numScroll: 1,
  },
  {
    breakpoint: '1199px',
    numVisible: 1,
    numScroll: 1,
  },
  {
    breakpoint: '767px',
    numVisible: 1,
    numScroll: 1,
  },
  {
    breakpoint: '575px',
    numVisible: 1,
    numScroll: 1,
  },
])

const getUserLocation = (): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalización no es soportada por este navegador.'))
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        (error) => {
          showObservationsNearMe.value = false
          userDeniedGeolocation.value = true
          reject(new Error('No se pudo obtener la ubicación del usuario.'))
        },
      )
    }
  })
}

watch(showObservationsNearMe, async (newValue, oldValue) => {
  if (oldValue === newValue) return
  fetchingObservations.value = true
  let latitude, longitude
  if (newValue) {
    try {
      const location = await getUserLocation()
      latitude = location.latitude
      longitude = location.longitude
    } catch (error) {
      console.error(error)
    }
  }
  await observationsStore.fetchObservationsNearMe(10, latitude, longitude)
  fetchingObservations.value = false
})
</script>
