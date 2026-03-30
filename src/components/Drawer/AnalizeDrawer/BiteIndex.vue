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
import { onMounted } from 'vue'
import { useAnalizeStore } from '../../../stores/analizeStore'
import { useBiteIndexStore } from '../../../stores/biteIndexStore'
import CardDrawer from '../CardDrawer.vue'
import BiteIndexSeasonalityChart from './BiteIndexSeasonalityChart.vue'
import BiteIndexTimeSeriesChart from './BiteIndexTimeSeriesChart.vue'

const analizeStore = useAnalizeStore()
const biteIndexStore = useBiteIndexStore()

onMounted(async () => {
  const selectedRegionAddress = analizeStore.selectedRegion?.features[0]?.properties?.address || {}
  const selectedRegionAddressType =
    analizeStore.selectedRegion?.features[0]?.properties?.addresstype || ''
  const city = selectedRegionAddress[selectedRegionAddressType] || ''

  // Initialize bite index data
  await biteIndexStore.fetchLastDate()
  await biteIndexStore.fetchMetrics(city)
  await biteIndexStore.fetchTrend()
  await biteIndexStore.fetchSeasonality()
})
</script>
