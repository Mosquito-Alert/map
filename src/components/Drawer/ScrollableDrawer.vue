<template>
  <ScrollPanel
    :pt="{
      barY: 'bg-gray-300 ',
      root: 'overflow-y-auto',
    }"
  >
    <div class="flex flex-col gap-2">
      <TaxonSelector v-if="!taxaStore.taxonSelected" />
      <MosquitoDetail v-else />
      <VariablesLayers />
      <OtherObservations />
    </div>
  </ScrollPanel>
</template>
<script setup lang="ts">
import ScrollPanel from 'primevue/scrollpanel'
import VariablesLayers from './VariablesLayers.vue'
import OtherObservations from './OtherObservations.vue'
import { useTaxaStore } from '../../stores/taxaStore'
import MosquitoDetail from './MosquitoDetail.vue'
import TaxonSelector from './TaxonSelector.vue'

const taxaStore = useTaxaStore()
</script>
