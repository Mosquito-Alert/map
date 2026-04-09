<template>
  <CardDrawer>
    <template #title>
      <h3 class="text-xl text-gray-700">Modelos</h3>
    </template>

    <template #content>
      <div class="model-taxon-selector">
        <label for="taxon-select" class="block mb-2 text-sm font-medium text-gray-700"
          >Taxón con modelo asociado disponible:</label
        >
        <select
          id="taxon-select"
          v-model="selectedTaxon"
          class="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option :value="null" disabled>Selecciona un taxón</option>
          <option :value="mapTaxonToDiscoveriesId.culex_pipiens">Culex pipiens</option>
          <option :value="mapTaxonToDiscoveriesId.albopictus">Aedes albopictus</option>
        </select>
      </div>
      <div v-if="selectedTaxon === null" class="mt-4 text-center text-gray-500">
        Por favor, selecciona un taxón para visualizar sus modelos correspondientes.
      </div>

      <div class="model-options mt-6">
        <BiteIndex v-if="selectedTaxon === mapTaxonToDiscoveriesId.culex_pipiens" />
        <RM0 v-if="selectedTaxon === mapTaxonToDiscoveriesId.albopictus" />
      </div>
    </template>
  </CardDrawer>
</template>
<script setup lang="ts">
import BiteIndex from './BiteIndex.vue'
import RM0 from './RM0.vue'
import CardDrawer from '../CardDrawer.vue'
import { ref } from 'vue'
import { mapTaxonToDiscoveriesId } from '../../../stores/taxaStore'

const selectedTaxon = ref<number | null>(null)
</script>
