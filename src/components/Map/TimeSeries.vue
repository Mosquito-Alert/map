<template>
  <div class="flex flex-col items-center">
    <div
      class="dates-controller inline-flex flex-nowrap items-center gap-6 px-3 py-2 bg-gray-100 border-gray-400 border-1 rounded-2xl cursor-default text-gray-700 text-base font-normal shadow-md"
      :class="showChart ? 'mb-4' : 'mb-0'"
    >
      <div class="dates whitespace-nowrap">
        <span class="font-medium">{{ formatDate(observationsStore.dateFilter.start || '') }}</span>
        -
        <span class="font-medium">{{ formatDate(observationsStore.dateFilter.end || '') }}</span>
      </div>
      <div class="flex items-end justify-end" v-if="!showChart">
        <Button
          severity="secondary"
          size="small"
          class="flex! justify-center! items-center! p-0.5 bg-gray-200 rounded-sm cursor-pointer"
          @click="showChart = true"
        >
          <span class="text-gray-700 material-icons-outlined"> open_in_full </span>
        </Button>
      </div>
    </div>
    <div
      class="chart-window bg-white! border-gray-400! border-1! rounded-sm shadow-lg"
      v-if="showChart"
    >
      <div class="w-full flex items-end justify-end">
        <Button
          severity="secondary"
          size="small"
          class="flex! justify-center! items-center! p-0.5 bg-gray-200 rounded-sm cursor-pointer"
          @click="showChart = false"
        >
          <span class="text-gray-700 material-icons-outlined"> close_fullscreen </span>
        </Button>
      </div>
      <VChart ref="chartRef" class="h-40! w-xl!" :option="option" :loading="loading" autoresize />
    </div>
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
import { formatDate } from '../../utils/date'

use([BarChart, CanvasRenderer, GridComponent, BrushComponent, ToolboxComponent])

const props = defineProps<{
  timeSeriesData: Record<string, number>
}>()

const observationsStore = useObservationsStore()

const originalDateLimits = ref<{ start: string; end: string } | null>(null)
const timeSeriesData = ref<Record<string, number>>({})
const timeSeriesDataMonthly = ref<{
  months: string[]
  values: number[]
}>({ months: [], values: [] })
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

const compressDataByMonth = () => {
  const monthlyMap: Record<string, number> = {}

  Object.entries(timeSeriesData.value).forEach(([date, value]) => {
    const d = new Date(date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthlyMap[key] = (monthlyMap[key] || 0) + value
  })

  // Sorted result
  const months = Object.keys(monthlyMap).sort()
  const values = months.map((m) => monthlyMap[m] || 0)
  timeSeriesDataMonthly.value = {
    months: months,
    values: values,
  }
}

const updateFilteredData = (params: any) => {
  const selectedIndexes = params.batch?.[0]?.selected?.[0]?.dataIndex
  if (!selectedIndexes) return

  const startIndex = selectedIndexes[0]
  const endIndex = selectedIndexes[selectedIndexes.length - 1]

  const allDates = Object.values(timeSeriesDataMonthly.value.months)

  const startDate = allDates[startIndex]
  const endDate = allDates[endIndex]

  if (!startDate || !endDate) return

  observationsStore.dateFilter = {
    start: `${startDate}-01`,
    end: `${endDate}-01`,
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
      compressDataByMonth()
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
    data: timeSeriesDataMonthly.value.months.map((m) => {
      const [year, month] = m.split('-')
      const date = new Date(Number(year), Number(month) - 1, 1)
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short' })
    }),
    // data: Object.keys(timeSeriesData.value),
  },
  yAxis: {
    type: 'value',
    show: false,
  },
  grid: {
    show: false,
    left: '7%',
    right: '5%',
    bottom: '15%',
    top: '0%',
    // containLabel: true,
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
      data: timeSeriesDataMonthly.value.values,
      // data: Object.values(timeSeriesData.value),
      type: 'bar',
      showSymbol: false,
    },
  ],
}))

const loading = false
</script>
