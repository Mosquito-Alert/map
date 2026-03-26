<template>
  <CardDrawer>
    <template #title>
      <h3 class="text-xl text-gray-700">
        Índice de picadura del mosquito <span class="italic">(Culex pipiens)</span>
      </h3>
    </template>
    <template #content>
      <BiteIndexTimeSeriesChart class="mb-6" />
      <BiteIndexSeasonalityChart />
    </template>
  </CardDrawer>
</template>
<script setup lang="ts">
import BiteIndexTimeSeriesChart from './BiteIndexTimeSeriesChart.vue'
import CardDrawer from '../CardDrawer.vue'
import { useAnalizeStore } from '../../../stores/analizeStore'
import { onMounted } from 'vue'
import BiteIndexSeasonalityChart from './BiteIndexSeasonalityChart.vue'

const analizeStore = useAnalizeStore()

onMounted(async () => {
  const selectedRegionAddress = analizeStore.selectedRegion?.features[0]?.properties?.address || {}
  const selectedRegionAddressType =
    analizeStore.selectedRegion?.features[0]?.properties?.addresstype || ''
  const city = selectedRegionAddress[selectedRegionAddressType] || ''

  await analizeStore.fetchLastDate()
  await analizeStore.fetchBiteIndexMetrics(city)
  await analizeStore.fetchBiteIndexTrend()
  await analizeStore.fetchSelectedMetricSeasonality()
})
</script>
