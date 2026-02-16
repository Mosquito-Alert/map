<template>
  <aside
    class="fixed top-0 left-0 flex flex-col z-100 max-h-[calc(100vh-2rem)] sm:w-[25%] mx-auto pl-4 mt-4"
  >
    <div class="overflow-y-auto flex-1 mb-0 p-0">
      <CardDrawer class="px-0!">
        <template #title>
          <Button
            severity="secondary"
            rounded
            size="small"
            class="z-10 absolute right-0 top-0"
            @click="observationStore.observationInDrawer = null"
          >
            <span class="material-icons-outlined"> close </span>
          </Button>
          <Carousel
            :value="observationStore.observationInDrawer?.photos || []"
            :numVisible="1"
            :numScroll="1"
            :showIndicators="true"
            :circular="(observationStore.observationInDrawer?.photos || []).length > 1"
            :pt="{
              indicatorList:
                'm-0 p-0 relative absolute right-0! left-0!  bottom-8! pl-4 flex justify-center w-full',
              indicatorButton: 'size-4! mx-1! p-0! border-0!',
            }"
          >
            <template #item="slotProps">
              <div>
                <img
                  :src="slotProps.data.url"
                  class="w-xs! aspect-3/3 border border-surface-200 dark:border-surface-700 object-cover rounded"
                />
                <Button
                  severity="secondary"
                  rounded
                  class="z-300 absolute bottom-6 right-5 w-4 h-2 flex items-center justify-center"
                  v-tooltip.bottom="'Creative Commons Attribution License'"
                  target="_blank"
                  as="a"
                  href="https://creativecommons.org/licenses/by/4.0/"
                >
                  <span class="material-icons-outlined"> attribution </span>
                </Button>
              </div>
            </template>
          </Carousel>
        </template>
        <template #content>
          <div class="flex row items-center px-2 py-1 m-0 bg-[#edb20c] text-white">
            <span
              class="text-xl font-medium py-none pr-2"
              :class="titleWithStyle.italicize ? 'italic' : ''"
            >
              {{ titleWithStyle.value }}
            </span>
            <span
              v-if="
                observationStore.observationInDrawer?.identification?.result?.source ===
                IdentificationTaskResultSource.Expert
              "
              v-tooltip.top="{
                value: 'Confirmado por expertos',
                pt: {
                  text: 'whitespace-nowrap! text-sm!',
                },
              }"
              class="material-icons text-base!"
            >
              verified
            </span>
            <span
              v-if="
                observationStore.observationInDrawer?.identification?.result?.source ===
                IdentificationTaskResultSource.Ai
              "
              v-tooltip.top="{
                value: 'Identificado por IA',
                pt: {
                  text: 'whitespace-nowrap! text-sm!',
                },
              }"
              class="material-icons text-base!"
            >
              memory
            </span>
          </div>
          <div class="px-4">
            <div
              v-for="{ value, icon } in overviewObservationData"
              :key="icon"
              class="flex items-center mt-2 mb-3 gap-2"
            >
              <span
                class="material-icons-outlined mr-2 flex items-center justify-center text-[#edb20c]"
              >
                {{ icon }}
              </span>
              <span class="text-sm text-gray-900">{{ value }}</span>
            </div>
          </div>
          <div v-if="overviewObservationReview.confidenceLevel" class="px-4 mt-4">
            <Divider />

            <div class="flex items-center mb-3">
              <span class="material-icons-outlined mr-2 text-gray-800 bg-gray-200 rounded-full p-2">
                groups
              </span>
              <div class="flex flex-col">
                <span class="text-sm text-gray-900 font-semibold">Comunidad de expertos</span>
                <span class="text-xs text-gray-700">Miembro del proyecto</span>
              </div>
            </div>

            <div class="confidence flex flex-col mb-3">
              <div class="mb-1">
                <span class="text-sm font-normal text-gray-700 leading-[1.8] mr-1"
                  >NIVEL DE CONFIANZA:
                </span>
                <span
                  v-for="i in overviewObservationReview.confidenceLevel"
                  :key="i"
                  class="material-icons font-normal text-xl! text-[#edb20c]"
                >
                  check_circle_outline
                </span>
              </div>
              <span class="text-sm">{{ overviewObservationReview.publicNote }}</span>
            </div>
          </div>
        </template>
      </CardDrawer>
    </div>
  </aside>
</template>
<script lang="ts" setup>
import { Button, Carousel, Divider } from 'primevue'
import { computed, onMounted, watch } from 'vue'
import { useObservationsStore } from '../../stores/observationsStore'
import CardDrawer from './CardDrawer.vue'
import { IdentificationTaskResultSource } from 'mosquito-alert'

const observationStore = useObservationsStore()

type TextWithStyle = {
  value: string
  italicize: boolean
}

const hasTaxon = computed(() => {
  return observationStore.observationInDrawer?.identification?.result?.taxon !== undefined
})

const taxonCommonName = computed(() => {
  return observationStore.observationInDrawer?.identification?.result?.taxon?.common_name
})

const taxonScientificName = computed(() => {
  return observationStore.observationInDrawer?.identification?.result?.taxon?.name
})

const taxonItalicize = computed(() => {
  return observationStore.observationInDrawer?.identification?.result?.taxon?.italicize ?? false
})

const titleWithStyle = computed<TextWithStyle>(() => {
  if (!hasTaxon.value) {
    return { value: 'unidentified_mosquito', italicize: false }
  }
  if (taxonCommonName.value) {
    return { value: taxonCommonName.value, italicize: false }
  } else if (taxonScientificName.value) {
    return { value: taxonScientificName.value, italicize: taxonItalicize.value }
  }
  return { value: 'unidentified_mosquito', italicize: false }
})

const overviewObservationData = computed(() => ({
  location: {
    value: observationStore.observationInDrawer?.location?.display_name || '',
    icon: 'location_on',
  },
  date: {
    value: observationStore.observationInDrawer?.created_at_local
      ? new Date(observationStore.observationInDrawer.created_at_local).toLocaleString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '',
    icon: 'calendar_today',
  },
  shortId: {
    value: observationStore.observationInDrawer?.short_id || '',
    icon: 'tag',
  },
}))
const overviewObservationReview = computed(() =>
  observationStore.observationInDrawer?.identification?.result?.source !==
  IdentificationTaskResultSource.Expert
    ? {}
    : {
        confidenceLevel: observationStore.observationInDrawer?.identification?.result
          ?.is_high_confidence
          ? 3
          : 2,
        publicNote: observationStore.observationInDrawer?.identification?.public_note || '',
      },
)

onMounted(() => {
  console.log('Observation in drawer:', observationStore.observationInDrawer)
})
watch(
  () => observationStore.observationInDrawer,
  () => {
    console.log(observationStore.observationInDrawer)
  },
)
</script>
