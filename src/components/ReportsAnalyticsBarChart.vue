<template>
  <v-chart class="chart" :option="option" autoresize />
</template>

<script setup lang="ts">
import VChart from "vue-echarts"

import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { TooltipComponent, GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([TooltipComponent, GridComponent, BarChart, CanvasRenderer])


import { colors } from 'quasar'
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'

import type { Feature } from "ol"
import type { CallbackDataParams } from "echarts/types/dist/shared"

import Worker from 'src/workers/ReportAnalyticsBarChartWorker.js?worker'

const worker = new Worker()

const props = defineProps<{
  features?: Feature[]
  minDate?: Date
  maxDate?: Date
}>()

const data = ref([])

onMounted(() => {
  worker.onmessage = function (e) {
    data.value = e.data
  }
})

onUnmounted(() => {
  worker.terminate()
})

// Watch for changes in props and restart the worker when they change
watch([() => props.features, () => props.minDate, () => props.maxDate], () => {
  if (!props.features) {
    data.value = []
    return
  }
  worker.postMessage({
    features: props.features.map(feature => { return { date: new Date(feature.getProperties().received_at) } }),
    minDate: props.minDate,
    maxDate: props.maxDate
  })
}, { immediate: true })

const option = computed(() => {
  return {
    tooltip: {
      show: true
    },
    xAxis: {
      type: 'category',
      data: data.value.map((item: CallbackDataParams) => item.name),
      axisTick: {
        show: false
      },
      axisLine: {
        show: false
      },
    },
    yAxis: {
      show: false,
      type: 'value'
    },

    series: [
      {
        data: data.value.map((item: CallbackDataParams) => item.value),
        type: 'bar',
        itemStyle: {
          color: colors.getPaletteColor('grey-7')
        }
      }
    ]
  }
})

</script>

<style scoped>
.chart {
  width: 100%;
  height: 40vh;
  min-height: 250px;
}
</style>
