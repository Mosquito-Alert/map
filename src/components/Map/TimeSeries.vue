<template>
  <VChart ref="chartRef" class="pt-0" :option="option" :loading="loading" autoresize />
</template>
<script lang="ts" setup>
import { BarChart } from 'echarts/charts'
import { GridComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { useObservationsStore } from '../../stores/observationsStore'

use([BarChart, CanvasRenderer, GridComponent])

const props = defineProps({
  values: {
    type: Array as () => number[],
    required: true,
  },
  labels: {
    type: Array as () => string[],
    required: true,
  },
})

const observationsStore = useObservationsStore()

const option = computed(() => ({
  xAxis: {
    type: 'category',
    data: props.labels,
  },
  yAxis: {
    type: 'value',
    show: false,
  },
  grid: {
    show: false,
    left: '0%',
    right: '0%',
    bottom: '0%',
    top: '0%',
    // containLabel: true,
    // backgroundColor: 'rgba(0, 255, 255, 0.8)',
  },
  series: [
    {
      data: props.values.map((m, index) => {
        const [year, month] = props.labels[index]?.split('-') || []
        const date = new Date(Number(year), Number(month) - 1, 1)
        return {
          value: m,
          itemStyle: {
            color:
              date >= new Date(observationsStore.dateFilter.start || '') &&
              date <= new Date(observationsStore.dateFilter.end || '')
                ? '#4473dc'
                : '#cfd2d7',
          },
        }
      }),
      type: 'bar',
      showSymbol: false,
    },
  ],
}))

// TODO:
const loading = false
</script>
