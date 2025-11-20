<template>
  <CardDrawer isCollapsed isLastCard>
    <template #title>Otras observaciones</template>
    <template #content>
      <!-- BREEDING SITES -->
      <div class="other-observations flex flex-col gap-4 mt-2">
        <div class="breeding-observations">
          <p class="font-semibold text-gray-700 mb-2">Lugares de cría</p>
          <div class="flex flex-wrap gap-5 items-start">
            <div
              class="other-observation-item w-16 flex flex-col items-center justify-start"
              v-for="(layer, code) in Object.values(breedingObservations)"
              :key="code"
            >
              <img
                :src="layer.icon"
                :alt="layer.common_name"
                class="py-1 px-2 mb-1 border border-gray-400 rounded shadow-lg/10 hover:shadow-lg/30 transition-shadow duration-300 cursor-pointer"
                style="color: red"
              />
              <p class="text-xs text-center">{{ layer.common_name }}</p>
            </div>
          </div>
        </div>

        <!-- BITES -->
        <div class="bites-observations">
          <p class="font-semibold text-gray-700 mb-2">Lugares de cría</p>
          <div class="flex flex-wrap items-start">
            <div
              class="other-observation-item w-12 flex flex-col items-center justify-center"
              v-for="(layer, code) in Object.values(bitesObservations)"
              :key="code"
            >
              <img
                :src="layer.icon"
                :alt="layer.common_name"
                class="py-1 px-2 mb-1 border border-gray-400 rounded shadow-lg/10 hover:shadow-lg/30 transition-shadow duration-300 cursor-pointer"
              />
              <p class="text-xs text-center">{{ layer.common_name }}</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </CardDrawer>
</template>
<script setup lang="ts">
import CardDrawer from './CardDrawer.vue'
import { breedingObservations, bitesObservations } from '../../utils/other_observations'
</script>
