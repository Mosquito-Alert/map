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
      class="bg-white! border-gray-400! border-1! h-40! w-xl!"
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
  timeSeriesData: Record<string, number>
}>()

const observationsStore = useObservationsStore()

const timeSeriesData = ref<Record<string, number>>({})
const showChart = ref(true)
const chartRef = ref<InstanceType<typeof VChart> | null>(null)

const updateFilteredData = (chart: any) => {
  const filterWindow = chart.getOption()?.dataZoom?.[0]
  if (!filterWindow) return

  observationsStore.datesFilterPercentage = {
    start: filterWindow.start,
    end: filterWindow.end,
  }
}

const debouncedUpdate = debounce(updateFilteredData, 250)

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
  () => props.timeSeriesData,
  (newData) => {
    timeSeriesData.value = newData
  },
  { immediate: true },
)

const option = computed(() => ({
  xAxis: {
    type: 'category',
    data: Object.keys(timeSeriesData.value),
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
      start: observationsStore.datesFilterPercentage.start,
      end: observationsStore.datesFilterPercentage.end,
    },
    {
      type: 'inside',
      show: true,
      start: observationsStore.datesFilterPercentage.start,
      end: observationsStore.datesFilterPercentage.end,
    },
  ],
  series: [
    {
      data: Object.values(timeSeriesData.value),
      type: 'line',
      showSymbol: false,
    },
  ],
}))

const loading = false
</script>
