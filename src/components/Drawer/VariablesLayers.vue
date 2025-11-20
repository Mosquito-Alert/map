<template>
  <CardDrawer isCollapsed>
    <template #title>Variables influyentes</template>
    <template #content>
      <div class="flex flex-col gap-3">
        <div v-for="layer in variablesLayers" :key="layer.key" class="flex items-start gap-2">
          <Checkbox
            v-model="mapStore.variablesSelected"
            :inputId="layer.key"
            name="variable layer"
            :value="layer.label"
          />
          <label :for="layer.key" class="cursor-pointer">{{ layer.label }}</label>
        </div>
      </div>
    </template>
  </CardDrawer>
</template>
<script setup lang="ts">
import { Checkbox } from 'primevue'

import CardDrawer from './CardDrawer.vue'
import { variablesLayers } from '../../utils/constants'
import { useMapStore } from '../../stores/mapStore'

const mapStore = useMapStore()
</script>
