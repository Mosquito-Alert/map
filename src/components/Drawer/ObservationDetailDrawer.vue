<template>
  <aside
    class="fixed top-0 left-0 flex flex-col z-100 max-h-[calc(100vh-2rem)] sm:w-[25%] mx-auto pl-4 mt-4"
  >
    <div class="overflow-y-auto flex-1 mb-0 p-0">
      <CardDrawer>
        <template #title>
          <Button
            severity="secondary"
            rounded
            size="small"
            class="z-10 absolute right-3 top-4"
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
                'm-0 p-0 absolute right-0! left-0!  bottom-8! pl-4 flex justify-center w-full',
              indicatorButton: 'size-4! mx-1! p-0! border-0!',
            }"
          >
            <template #item="slotProps">
              <div>
                <img
                  :src="slotProps.data.url"
                  class="w-xs! aspect-3/3 border border-surface-200 dark:border-surface-700 object-cover rounded"
                />
              </div>
            </template>
          </Carousel>
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
        </template>
        <template #content> </template>
      </CardDrawer>
    </div>
  </aside>
</template>
<script lang="ts" setup>
import Carousel from 'primevue/carousel'
import { Button } from 'primevue'
import { onMounted, watch } from 'vue'
import { useObservationsStore } from '../../stores/observationsStore'
import CardDrawer from './CardDrawer.vue'

const observationStore = useObservationsStore()

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
