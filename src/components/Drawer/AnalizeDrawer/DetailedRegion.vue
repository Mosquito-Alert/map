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
      <div class="observations-summary mt-4">
        <p>
          Número total de observaciones:
          <span class="font-semibold ml-1">{{ observationPointsInBoundary.length }}</span>
        </p>
        <VChart
          ref="chartRef"
          class="h-40! pt-1"
          :option="option"
          :loading="loadingInfo"
          autoresize
        />
      </div>
    </template>
  </CardDrawer>
</template>
<script setup lang="ts">
import { useAnalizeStore } from '@/stores/analizeStore'
import { useObservationsStore } from '@/stores/observationsStore'
import { Button } from 'primevue'
import { computed, onMounted, onUnmounted, ref, shallowRef } from 'vue'
import VChart from 'vue-echarts'
import CardDrawer from '../CardDrawer.vue'
import type { ObservationGeoModel } from 'mosquito-alert'
import { useTaxaStore } from '../../../stores/taxaStore'
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import { GridComponent } from 'echarts/components'

use([PieChart, CanvasRenderer, GridComponent])

const observationsStore = useObservationsStore()
const analizeStore = useAnalizeStore()
const taxaStore = useTaxaStore()

const observationPointsInBoundary = shallowRef([])
const aggregatedObservations = shallowRef<{ name: string; value: number }[]>([])
const loadingInfo = ref(false)
const regionName = computed(
  () => analizeStore.selectedRegion?.features?.[0]?.properties?.name || 'Región personalizada.',
)
const regionSubname = computed(
  () => analizeStore.selectedRegion?.features?.[0]?.properties?.display_name || null,
)

const aggregateObservationsInBoundary = () => {
  const totalAggregation = observationPointsInBoundary.value.reduce(
    (acc: Record<string, number>, obs: ObservationGeoModel) => {
      const id = obs.identification_taxon_id || -1
      acc[id] = (acc[id] || 0) + 1
      return acc
    },
    {},
  )

  // Sum all the values to get the total number of observations in the boundary
  const totalObservations = Object.values(totalAggregation).reduce((sum, value) => sum + value, 0)

  // Reduce the entries: all the ids that have a value less than 2% of the total observations will be grouped in a single "Otros" category
  const reducedAggregation: Record<string, number> = {}
  let othersCount = 0
  for (const [id, value] of Object.entries(totalAggregation)) {
    if (value / totalObservations < 0.02) {
      othersCount += value
    } else {
      reducedAggregation[id] = value
    }
  }
  if (othersCount > 0) {
    reducedAggregation['Otros'] = othersCount
  }
  return reducedAggregation
}

const option = computed(() => ({
  series: [
    {
      type: 'pie',
      data: aggregatedObservations.value,
      radius: '70%',
      label: {
        show: true,
        formatter: '{nameStyle|{b}}\n{d}%',
        rich: {
          nameStyle: {
            fontStyle: 'italic',
          },
        },
        alignTo: 'labelLine',
        position: 'outside',
        bleedMargin: 0,
      },
      labelLine: {
        lineStyle: {
          type: 'dashed',
        },
      },
      itemStyle: {
        color: (params: { dataIndex: number }) => {
          const colors = [
            '#888888',
            '#aaaaaa',
            '#cccccc',
            '#dddddd',
            '#eeeeee',
            '#999999',
            '#777777',
            '#555555',
          ]
          return colors[params.dataIndex % colors.length]
        },
      },
    },
  ],
}))

onMounted(async () => {
  loadingInfo.value = true
  const response = await observationsStore.fetchObservations(false, analizeStore.selectedRegion)
  observationPointsInBoundary.value = response
  const aggregatedData = aggregateObservationsInBoundary()
  aggregatedObservations.value = Object.entries(aggregatedData).map(
    ([id, value]: [string, number]) => ({
      name: taxaStore.getTaxonNameById(Number(id)),
      value,
    }),
  )
  loadingInfo.value = false
})

onUnmounted(() => {
  observationPointsInBoundary.value = []
})
</script>
