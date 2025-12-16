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
import { BarChart } from 'echarts/charts'
import { GridComponent, BrushComponent, ToolboxComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import Button from 'primevue/button'
import { computed, onMounted, ref, watch } from 'vue'
import VChart from 'vue-echarts'
import { useObservationsStore } from '../../stores/observationsStore'
import { debounce } from '../../utils/debouncer'

use([BarChart, CanvasRenderer, GridComponent, BrushComponent, ToolboxComponent])

const props = defineProps<{
  timeSeriesData: Record<string, number>
}>()

const observationsStore = useObservationsStore()

const originalDateLimits = ref<{ start: string; end: string } | null>(null)
const timeSeriesData = ref<Record<string, number>>({})
const showChart = ref(true)
const chartRef = ref<InstanceType<typeof VChart> | null>(null)

const fixDateAggregationData = (data: Record<string, number>) => {
  const dates = Object.keys(data).sort()
  const start = new Date(dates[0] as string)
  const end = new Date(dates[dates.length - 1] as string)

  const result: Record<string, number> = {}

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10)
    result[key] = data[key] ?? 0
  }

  timeSeriesData.value = result
}

const updateFilteredData = (params: any) => {
  const selectedIndexes = params.batch?.[0]?.selected?.[0]?.dataIndex
  if (!selectedIndexes) return

  const startIndex = selectedIndexes[0]
  const endIndex = selectedIndexes[selectedIndexes.length - 1]

  const allDates = Object.keys(timeSeriesData.value)

  const startDate = allDates[startIndex]
  const endDate = allDates[endIndex]

  if (!startDate || !endDate) return

  observationsStore.dateFilter = {
    start: startDate,
    end: endDate,
  }
}

const debouncedUpdate = debounce(updateFilteredData, 250)

onMounted(() => {
  const chart = chartRef.value?.chart

  if (!chart) return

  chart.on('brushSelected', (params: any) => {
    debouncedUpdate(params)
  })

  chart.on('brush', (params: any) => {
    const areas = params.areas
    if (areas.length === 0) {
      // Clear date filter
      observationsStore.dateFilter = {
        start: originalDateLimits.value?.start ?? null,
        end: originalDateLimits.value?.end ?? null,
      }
    }
  })
})

watch(
  () => props.timeSeriesData,
  (newData) => {
    if (!timeSeriesData.value || Object.keys(timeSeriesData.value).length === 0) {
      fixDateAggregationData(newData)
      const allDates = Object.keys(timeSeriesData.value)
      originalDateLimits.value = {
        start: allDates[0] as string,
        end: allDates[allDates.length - 1] as string,
      }
      observationsStore.dateFilter = {
        start: originalDateLimits.value.start,
        end: originalDateLimits.value.end,
      }
      return
    }
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
  toolbox: {
    feature: {
      // dataZoom: {
      //   yAxisIndex: false,
      // },
      brush: {
        type: ['lineX', 'clear'],
      },
    },
  },
  brush: {
    brushMode: 'single',
    brushType: 'lineX',
    brushStyle: {
      borderWidth: 2,
      color: 'rgba(0,136,212,0.15)',
      borderColor: 'rgba(0,136,212,0.8)',
    },
  },
  series: [
    {
      data: Object.values(timeSeriesData.value),
      type: 'bar',
      showSymbol: false,
    },
  ],
}))

const loading = false
</script>
