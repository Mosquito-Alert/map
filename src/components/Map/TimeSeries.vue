<template>
  <VChart class="rounded-t-lg chart h-80! w-xl!" :option="option" :loading="loading" autoresize />
</template>

<script setup lang="ts">
import { LineChart } from 'echarts/charts'
import { GridComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { computed, onMounted, ref } from 'vue'
import VChart from 'vue-echarts'

use([LineChart, CanvasRenderer, GridComponent])

const props = defineProps<{
  dataDateCount: Record<string, number>
}>()

const filledData = ref<Record<string, number>>({})

function fillMissingDates(data: Record<string, number>) {
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

onMounted(() => {
  fillMissingDates(props.dataDateCount)
  console.log(filledData.value)
})

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
    // backgroundColor: 'rgba(0, 255, 255, 0.8)',
  },
  series: [
    {
      data: Object.values(filledData.value),
      type: 'line',
    },
  ],
}))

const loading = false
</script>
