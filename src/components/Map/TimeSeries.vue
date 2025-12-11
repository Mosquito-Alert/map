<template>
  <div class="absolute bottom-0 left-[30%] z-10">
    <Button
      severity="secondary"
      size="small"
      class="rounded-b-none px-3 py-0 flex items-center gap-2 border-gray-400 border-b-0"
      @click="showChart = !showChart"
    >
      <span class="material-icons-outlined">
        {{ showChart ? 'keyboard_arrow_down' : 'keyboard_arrow_up' }}
      </span>
      {{ showChart ? 'Ocultar Serie Temporal' : 'Serie Temporal' }}
    </Button>
    <VChart
      v-if="showChart"
      class="bg-white! border-gray-400! border-1! h-70! w-xl!"
      :option="option"
      :loading="loading"
      autoresize
    />
  </div>
</template>

<script setup lang="ts">
import { LineChart } from 'echarts/charts'
import { DataZoomComponent, GridComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { computed, ref, watch } from 'vue'
import VChart from 'vue-echarts'
import Button from 'primevue/button'

use([LineChart, CanvasRenderer, GridComponent, DataZoomComponent])

const props = defineProps<{
  dataDateCount: Record<string, number>
}>()

const filledData = ref<Record<string, number>>({})
const showChart = ref(true)

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
