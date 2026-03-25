<template>
  <CardDrawer>
    <template #title>
      <h3 class="text-xl text-gray-700">
        Índice de picadura del mosquito <span class="italic">(Culex pipiens)</span>
      </h3>
    </template>
    <template #content>
      <BiteIndexTimeSeriesChart />
    </template>
  </CardDrawer>
</template>
<script setup lang="ts">
import BiteIndexTimeSeriesChart from './BiteIndexTimeSeriesChart.vue'
import CardDrawer from '../CardDrawer.vue'
</script>
