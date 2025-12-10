<template>
  <VChart class="rounded-t-lg chart h-80! w-xl!" :option="option" :loading="loading" autoresize />
</template>

<script setup lang="ts">
import { LineChart } from 'echarts/charts'
import { DataZoomComponent, GridComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { computed, ref, watch } from 'vue'
import VChart from 'vue-echarts'

use([LineChart, CanvasRenderer, GridComponent, DataZoomComponent])

const props = defineProps<{
  dataDateCount: Record<string, number>
}>()

const filledData = ref<Record<string, number>>({})

const fillMissingDates = (data: Record<string, number>) => {
  const dates = Object.keys(data).sort()
  const start = new Date(dates[0] as string)
  const end = new Date(dates[dates.length - 1] as string)

  const result: Record<string, number> = {}

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10)
    result[key] = data[key] ?? 0
  }

  filledData.value = result
}

watch(
  () => props.dataDateCount,
  (newVal: Record<string, number>) => {
    if (newVal && Object.keys(newVal).length > 0) {
      fillMissingDates(newVal)
    }
  },
  { immediate: true },
)

const option = computed(() => ({
  xAxis: {
    type: 'category',
    data: Object.keys(filledData.value),
  },
  yAxis: {
    type: 'value',
  },
  grid: {
    show: true,
    left: '3%',
    right: '4%',
    bottom: '20%',
    top: '5%',
    containLabel: true,
    // backgroundColor: 'rgba(0, 255, 255, 0.8)',
  },
  dataZoom: [
    {
      type: 'slider',
      start: 0,
      end: 100,
    },
    {
      type: 'inside',
      start: 0,
      end: 100,
    },
  ],
  series: [
    {
      data: Object.values(filledData.value),
      type: 'line',
      showSymbol: false,
    },
  ],
}))

const loading = false
</script>
