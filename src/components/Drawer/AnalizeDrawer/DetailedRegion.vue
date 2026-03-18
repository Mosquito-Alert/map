<template>
  <CardDrawer>
    <template #title>
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-700">
          {{ regionName }}
        </h2>
        <Button
          aria-label="Close"
          variant="text"
          severity="secondary"
          @click="
            () => {
              analizeStore.clearSelectedRegion()
            }
          "
        >
          <span class="material-icons-outlined"> close </span>
        </Button>
      </div>
    </template>
    <template #content>
      <div class="region-subname italic" v-if="regionSubname">
        {{ regionSubname }}
      </div>
      <div class="region-data mt-4 flex justify-center gap-10 border-1 rounded-lg p-3">
        <div class="population flex items-center gap-2">
          <span class="material-icons-outlined"> people </span>
          <span v-if="analizeStore.populationOfSelectedRegion !== null">
            {{ analizeStore.populationOfSelectedRegion.toLocaleString().replace(/,/gi, '.') }}
            habitantes
          </span>
          <span v-else> No disponible </span>
        </div>
        <div class="extension flex items-center gap-2">
          <span class="material-icons-outlined"> settings_overscan </span>
          <span v-if="analizeStore.extensionOfSelectedRegion !== null">
            {{ analizeStore.extensionOfSelectedRegion.toLocaleString() }} km²
          </span>
          <span v-else> No disponible </span>
        </div>
      </div>
    </template>
  </CardDrawer>
</template>
<script setup lang="ts">
import { useAnalizeStore } from '@/stores/analizeStore'
import { Button } from 'primevue'
import { computed } from 'vue'
import CardDrawer from '../CardDrawer.vue'

const analizeStore = useAnalizeStore()

const regionName = computed(
  () => analizeStore.selectedRegion?.features?.[0]?.properties?.name || 'Región personalizada.',
)
const regionSubname = computed(
  () => analizeStore.selectedRegion?.features?.[0]?.properties?.display_name || null,
)
</script>
