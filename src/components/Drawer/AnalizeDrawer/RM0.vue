<template>
  <h3 class="text-lg text-gray-700">Ritmo reproductivo básico del mosquito (RM0)</h3>
  <div class="timeseries-header">
    <h6 class="my-2 ml-2 font-medium" style="color: #333">Time Series</h6>
  </div>
  <v-chart style="height: 330px" :option="option" :loading="loading" autoresize />
</template>
<script setup lang="ts">
import { LineChart } from 'echarts/charts'
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { computed, onMounted, ref } from 'vue'
import VChart from 'vue-echarts'
import { useRM0Store } from '../../../stores/rm0Store'

const rm0Store = useRM0Store()

use([
  TooltipComponent,
  LineChart,
  CanvasRenderer,
  GridComponent,
  TitleComponent,
  LegendComponent,
  DataZoomComponent,
])

const loading = computed(() => rm0Store.metricsDataLoading || rm0Store.metrics === null)

const startDataZoom = ref(30) // Default to the last 30 days
const percentageLastMonth = computed(() => {
  return 100 - (startDataZoom.value / (rm0Store.metrics?.length || 1)) * 100 // Assuming the last month has 30 days
})

// TODO: Color above and below threshold

onMounted(async () => {
  // Initialize RM0 data
  await rm0Store.fetchRM0Data()
})

const option = computed(() => {
  if (!rm0Store.metrics || rm0Store.metrics.length === 0) {
    return {}
  }

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        animation: false,
        label: {
          backgroundColor: '#ccc',
          borderColor: '#aaa',
          borderWidth: 1,
          shadowBlur: 0,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          color: '#222',
        },
      },
      formatter: (params: any) => {
        const date = params[0]?.name.split('T')[0] || 'Unknown Date'
        const value = params[0]?.value ? `${params[0].value.toFixed(2)}` : 'N/A'
        return `
          <strong>${date}</strong>
          <br/><hr>
          <span>Value: ${value}</span><br/>
        `
      },
    },
    grid: {
      left: '2%',
      right: '4%',
      bottom: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: rm0Store.metrics?.map((item) => item.time.split('T')[0]), // TODO: date.formatDate(item.date, 'YYYY-MM-DD')),
      boundaryGap: false,
    },
    yAxis: {
      name: 'RM0',
      axisLine: {
        show: true,
      },
    },
    dataZoom: [
      {
        type: 'slider',
        bottom: '5%',
        show: true,
        xAxisIndex: [0],
        start: percentageLastMonth.value,
        end: 100,
        // Change background color to red
        backgroundColor: '#a8a8a809',
        fillerColor: '#a8a8a844',
        dataBackground: {
          lineStyle: {
            color: '#a8a8a8',
          },
          areaStyle: {
            color: '#a8a8a866',
          },
        },
        selectedDataBackground: {
          lineStyle: {
            color: '#a8a8a8',
          },
          areaStyle: {
            color: '#000',
          },
        },
        moveHandleStyle: { color: '#a8a8a8aa' },
        emphasis: { moveHandleStyle: { color: '#a8a8a8' } },
      },
      {
        type: 'inside',
        xAxisIndex: [0],
      },
    ],
    series: [
      {
        name: 'Metrics',
        type: 'line',
        lineStyle: {
          color: '#a8a8a8',
          width: 1.5,
        },
        data: rm0Store.metrics || [],
        showSymbol: false,
      },
      {
        name: 'Threshold',
        type: 'line',
        lineStyle: {
          color: '#006400',
          width: 0.8,
          type: 'dashed',
        },
        data: rm0Store.metrics?.map(() => 1) || [],
        showSymbol: false,
      },
    ],
  }
})
</script>
