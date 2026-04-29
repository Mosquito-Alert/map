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
            @click="
              () => {
                taxaStore.taxonSelected = culicidaeTaxon as Taxon
                mapStore.layerSelected = MosquitoLayersEnum.MA_OBSERVATIONS
              }
            "
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

      <div class="near-discoveries mt-6">
        <div class="mb-2">
          <h4 class="text-lg font-semibold text-gray-800">Observaciones recientes</h4>
        </div>
        <!-- TODO: Make this lazy: fetch photos on request -->
        <Carousel
          v-if="!fetchingObservations"
          :value="observationsStore.recent_observations"
          :numVisible="2"
          :numScroll="1"
          :responsiveOptions="responsiveOptions"
          :showIndicators="false"
        >
          <template #item="slotProps">
            <div
              class="outline outline-surface-200 dark:outline-surface-700 rounded my-0.5 mx-1 cursor-pointer"
              @click="() => observationsStore.fetchObservationById(slotProps.data.uuid)"
            >
              <div class="relative mx-auto">
                <img
                  :src="slotProps.data.photos[0].url"
                  class="h-[250px] w-xs aspect-2/3 object-cover rounded"
                />
                <Tag
                  v-if="slotProps.data.location?.display_name"
                  :value="slotProps.data.location.display_name?.split(',')[0]"
                  class="absolute text-xs font-normal"
                  severity="secondary"
                  style="right: 0.25rem; top: 0.25rem"
                  :pt="{ root: { class: 'py-0' } }"
                >
                  <template #icon>
                    <span class="material-icons-outlined text-sm!"> location_on </span>
                  </template>
                </Tag>
              </div>
            </div>
          </template>
          <template #empty>
            <Card
              class="h-[250px] flex items-center justify-center border-dashed border-1 border-gray-400 my-0.5"
            >
              <template #content>
                <div class="flex flex-col items-center justify-center gap-3 py-10">
                  <span class="material-icons-outlined text-4xl text-gray-400"> info </span>
                  <p class="text-gray-500">No hay observaciones recientes para este mosquito.</p>
                </div>
              </template>
            </Card>
          </template>
        </Carousel>
        <Skeleton v-else height="250px" class="mx-1 my-2.5 rounded" />

        <div
          class="flex items-center justify-self-end gap-2 mt-2"
          v-tooltip.right="{
            value: userDeniedGeolocation
              ? 'Permite el acceso a tu ubicación para ver las observaciones cerca de ti'
              : 'Mostrar solo las observaciones cerca de tu ubicación',
            pt: { root: { class: 'max-w-xs' } },
          }"
        >
          <label for="showObservationsNearMe" class="cursor-pointer"> Cerca de mi </label>
          <ToggleSwitch
            v-model="observationsStore.are_observations_near"
            :inputId="'showObservationsNearMe'"
            name="showObservationsNearMe"
            :disabled="userDeniedGeolocation"
          />
        </div>
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
            <div
              v-for="layer in visibleMosquitoLayers"
              :key="layer.key"
              class="flex items-start gap-2"
            >
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
import {
  Button,
  Card,
  Carousel,
  ProgressSpinner,
  RadioButton,
  Skeleton,
  Tag,
  ToggleSwitch,
} from 'primevue'
import { computed, onMounted, ref, watch } from 'vue'
import { summary as wikipediaSummary } from 'wikipedia'
import { useMapStore } from '../../../stores/mapStore'
import { useObservationsStore } from '../../../stores/observationsStore'
import { culicidaeTaxon, mapTaxonToDiscoveriesId, useTaxaStore } from '../../../stores/taxaStore'
import { mosquitoLayers, MosquitoLayersEnum } from '../../../utils/constants'
import CardDrawer from '../CardDrawer.vue'

const taxaStore = useTaxaStore()
const mapStore = useMapStore()
const observationsStore = useObservationsStore()

const fetchingObservations = ref(false)
const diseases = ['Dengue', 'Fiebre Amarilla', 'Virus del Nilo Occidental']
const seeAdditionalDetails = ref(false)
const mosquitoInfo = ref('')
const fetchingMosquitoInfo = ref(false)
const userDeniedGeolocation = ref(false)

const visibleMosquitoLayers = computed(() => {
  const taxonId = taxaStore.taxonSelected?.id
  const discoveriesTaxonId = taxaStore.discoveriesTaxonId

  return mosquitoLayers.filter((layer) => {
    // Discoveries only if discovery id exists
    if (layer.key === MosquitoLayersEnum.DISCOVERIES) {
      return !!discoveriesTaxonId
    }

    // rm0 only for albopictus
    if (layer.key === MosquitoLayersEnum.RM0) {
      return taxonId === mapTaxonToDiscoveriesId.albopictus
    }

    // bite index only for culex
    if (layer.key === MosquitoLayersEnum.BITE_INDEX) {
      return taxonId === mapTaxonToDiscoveriesId.culex_pipiens
    }

    return true
  })
})

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
    numVisible: 2,
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
          observationsStore.are_observations_near = false
          userDeniedGeolocation.value = true
          reject(new Error('No se pudo obtener la ubicación del usuario.'))
        },
      )
    }
  })
}

watch(
  () => observationsStore.are_observations_near,
  async (newValue, oldValue) => {
    if (oldValue === newValue) return
    fetchingObservations.value = true
    let latitude, longitude
    if (newValue) {
      try {
        const location = await getUserLocation()
        latitude = location.latitude
        longitude = location.longitude
        observationsStore.user_location = location
      } catch (error) {
        console.error(error)
      }
    }
    await observationsStore.fetchObservationsNearMe(10, latitude, longitude)
    fetchingObservations.value = false
  },
)
</script>
