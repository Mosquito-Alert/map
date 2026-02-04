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
        <h4 class="text-lg font-semibold text-gray-800 mb-2">Observaciones cerca de ti</h4>
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
import { Button, Carousel, Checkbox, ProgressSpinner, RadioButton } from 'primevue'
import Tag from 'primevue/tag'
import { onMounted, ref } from 'vue'
import { summary as wikipediaSummary } from 'wikipedia'

import { useMapStore } from '../../stores/mapStore'
import { useObservationsStore } from '../../stores/observationsStore'
import { culicidaeTaxon, useTaxaStore } from '../../stores/taxaStore'
import { daysSince } from '../../utils/date'
import CardDrawer from './CardDrawer.vue'
import { mosquitoLayers } from '../../utils/constants'
import type { Taxon } from 'mosquito-alert'

const taxaStore = useTaxaStore()
const mapStore = useMapStore()
const observationsStore = useObservationsStore()

const fetchingObservations = ref(false)
const diseases = ['Dengue', 'Fiebre Amarilla', 'Virus del Nilo Occidental']
const seeAdditionalDetails = ref(false)
const mosquitoInfo = ref('')
const fetchingMosquitoInfo = ref(false)

onMounted(async () => {
  if (taxaStore.taxonSelected) {
    fetchingObservations.value = true
    await observationsStore.fetchObservationsNearMe(10, 40.4168, -3.7038) // Example coordinates (Madrid)
    fetchingObservations.value = false
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
</script>
