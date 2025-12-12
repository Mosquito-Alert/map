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
      ref="chartRef"
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
import Button from 'primevue/button'
import { computed, onMounted, ref, watch } from 'vue'
import VChart from 'vue-echarts'
import { useObservationsStore } from '../../stores/observationsStore'
import { debounce } from '../../utils/debouncer'

use([LineChart, CanvasRenderer, GridComponent, DataZoomComponent])

const props = defineProps<{
  dataDateAggregation: Record<string, number>
}>()

const observationsStore = useObservationsStore()

const filledData = ref<Record<string, number>>({})
const showChart = ref(true)
const chartRef = ref<InstanceType<typeof VChart> | null>(null)
const zoomFiltered = ref({ start: 0, end: 100 })

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

const updateFilteredData = (chart: any) => {
  const filterWindow = chart.getOption()?.dataZoom?.[0]
  if (!filterWindow) return

  const startPercent = filterWindow.start
  const endPercent = filterWindow.end

  const allDates = Object.keys(filledData.value)
  const totalDates = allDates.length

  const startIndex = Math.floor((startPercent / 100) * totalDates)
  const endIndex = Math.ceil((endPercent / 100) * totalDates)

  zoomFiltered.value = {
    start: (startIndex / totalDates) * 100,
    end: (endIndex / totalDates) * 100,
  }

  const filteredDates = allDates.slice(startIndex, endIndex)
  observationsStore.dateFilters = {
    start: filteredDates[0] as string,
    end: filteredDates[filteredDates.length - 1] as string,
  }
}

const debouncedUpdate = debounce(updateFilteredData, 2000)

onMounted(() => {
  const chart = chartRef.value?.chart

  if (!chart) return

  chart.on('dataZoom', () => {
    debouncedUpdate(chart)
  })

  // Initialize the filtered data
  updateFilteredData(chart)
})

watch(
  () => props.dataDateAggregation,
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
      show: true,
      start: zoomFiltered.value.start,
      end: zoomFiltered.value.end,
    },
    {
      type: 'inside',
      show: true,
      start: zoomFiltered.value.start,
      end: zoomFiltered.value.end,
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
