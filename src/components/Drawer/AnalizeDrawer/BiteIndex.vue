<template>
  <h3 class="text-lg text-gray-700">Índice de picadura del mosquito</h3>
  <BiteIndexTimeSeriesChart class="mb-6" />
  <BiteIndexSeasonalityChart />
</template>
<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useAnalizeStore } from '../../../stores/analizeStore'
import { useBiteIndexStore } from '../../../stores/biteIndexStore'
import BiteIndexSeasonalityChart from './BiteIndexSeasonalityChart.vue'
import BiteIndexTimeSeriesChart from './BiteIndexTimeSeriesChart.vue'

const analizeStore = useAnalizeStore()
const biteIndexStore = useBiteIndexStore()

const fetchData = async () => {
  const selectedRegionAddress = analizeStore.selectedRegion?.features[0]?.properties?.address || {}
  const selectedRegionAddressType =
    analizeStore.selectedRegion?.features[0]?.properties?.addresstype || ''
  const city = selectedRegionAddress[selectedRegionAddressType] || ''

  // Initialize bite index data
  await biteIndexStore.fetchMetrics(city)
  await biteIndexStore.fetchTrend()
  await biteIndexStore.fetchSeasonality()
}

onMounted(async () => {
  // Initialize bite index data
  await biteIndexStore.fetchLastDate()
  await fetchData()
})

// Selected region in Analize tab
watch(
  () => analizeStore.selectedRegion,
  async (newBoundary: GeoJSON.FeatureCollection | null) => {
    const hasRegion =
      newBoundary && Array.isArray(newBoundary.features) && newBoundary.features.length > 0
    if (hasRegion) {
      await fetchData()
    }
  },
)
</script>
