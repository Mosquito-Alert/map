<template>
  <div class="flex flex-col items-center">
    <div
      class="dates-controller inline-flex flex-nowrap items-center gap-6 px-3 py-2 bg-gray-100 border-gray-400 border-1 rounded-2xl cursor-default text-gray-700 text-base font-normal shadow-md"
      :class="showChart ? 'mb-4' : 'mb-0'"
    >
      <div class="dates whitespace-nowrap pointer-events-auto">
        <span class="font-medium">{{ formatDate(observationsStore.dateFilter.start || '') }}</span>
        -
        <span class="font-medium">{{ formatDate(observationsStore.dateFilter.end || '') }}</span>
      </div>
      <div class="flex items-end justify-end pointer-events-auto" v-if="!showChart">
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
      class="chart-window bg-white! border-gray-400! border-1! rounded-sm shadow-lg pointer-events-auto"
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
      <div class="playback flex items-center justify-center gap-2 p-2">
        <Button
          severity="secondary"
          size="small"
          class="flex! justify-center! items-center! p-0.5 bg-gray-200 rounded-sm cursor-pointer"
          @click="playbackOngoing = !playbackOngoing"
          v-tooltip.top="playbackOngoing ? 'Pause playback' : 'Start playback'"
        >
          <span class="text-gray-700 material-icons-outlined">
            {{ playbackOngoing ? 'pause' : 'play_arrow' }}
          </span>
        </Button>
        <!-- Only show the replay button when playback is paused -->
        <Button
          v-if="playbackCurrentDate"
          severity="secondary"
          size="small"
          class="flex! justify-center! items-center! p-0.5 bg-gray-200 rounded-sm cursor-pointer"
          @click="replay()"
          v-tooltip.top="'Replay from start'"
        >
          <span class="text-gray-700 material-icons-outlined">
            {{ 'replay' }}
          </span>
        </Button>
        <div>
          <Button
            type="button"
            @click="(event) => menu.toggle(event)"
            severity="secondary"
            size="small"
            class="flex! justify-center! items-center! p-0.5 bg-gray-200 rounded-sm cursor-pointer"
            aria-haspopup="true"
            aria-controls="overlay_menu"
            v-tooltip.top="'Playback speed'"
          >
            <span class="text-gray-700 material-icons-outlined">
              {{ 'speed' }}
            </span>
          </Button>
          <Menu ref="menu" id="overlay_menu" :model="playbackMenuItems" :popup="true">
            <template #item="{ item }">
              <div class="flex items-center gap-2 px-2 py-1">
                <span class="material-icons-outlined text-sm w-4">
                  {{ item.isActive ? 'check' : '' }}
                </span>
                <span>{{ item.label }}</span>
              </div>
            </template>
          </Menu>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BarChart } from 'echarts/charts'
import { GridComponent, BrushComponent, ToolboxComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import { computed, onMounted, ref, watch } from 'vue'
import VChart from 'vue-echarts'
import { useObservationsStore } from '../../stores/observationsStore'
import { debounce } from '../../utils/debouncer'
import { formatDate } from '../../utils/date'

use([BarChart, CanvasRenderer, GridComponent, BrushComponent, ToolboxComponent])

const props = defineProps<{
  timeSeriesData: Record<string, number> // date (YYYY-MM-DD) -> count
}>()

type PlaybackSpeed = {
  label: string
  value: number
}

const observationsStore = useObservationsStore()

const menu = ref()

const originalDateLimits = ref<{ start: string; end: string } | null>(null)
const timeSeriesDataLocal = ref<Record<string, number>>({}) //  date -> count
const timeSeriesDataMonthly = ref<{
  months: string[]
  values: number[]
}>({ months: [], values: [] })
const showChart = ref(true)
const chartRef = ref<InstanceType<typeof VChart> | null>(null)
const playbackOngoing = ref(false)
const playbackCurrentDate = ref<Date | null>(null)
const playbackOriginalDateLimits = ref<{ start: string; end: string } | null>(null)
const playbackInterval = ref<number | undefined>(undefined)
const _basePlaybackSpeed = 500 // 1x speed = 500ms per month
const playbackSpeedOptions: PlaybackSpeed[] = [
  { label: '0.5x', value: _basePlaybackSpeed / 0.5 },
  { label: '0.75x', value: _basePlaybackSpeed / 0.75 },
  { label: '1.0x', value: _basePlaybackSpeed },
  { label: '1.5x', value: _basePlaybackSpeed / 1.5 },
  { label: '2.0x', value: _basePlaybackSpeed / 2.0 },
]
const playbackSpeed = ref<PlaybackSpeed>(
  playbackSpeedOptions.find((opt) => opt.label === '1.0x') as PlaybackSpeed,
)
const playbackMenuItems = computed(() =>
  playbackSpeedOptions.map((opt) => ({
    label: opt.label,
    isActive: playbackSpeed.value.label === opt.label,
    command: () => {
      playbackSpeed.value = opt
    },
  })),
)

const fixDateAggregationData = (data: Record<string, number>) => {
  const timestamps = Object.keys(data)
    .map(Number)
    .sort((a, b) => a - b)

  if (!timestamps.length) {
    timeSeriesDataLocal.value = {}
    return
  }

  const dayMs = 24 * 60 * 60 * 1000
  const start = timestamps[0] as number
  const end = timestamps[timestamps.length - 1] as number
  const result: Record<string, number> = {}

  for (let ts = start; ts <= end; ts += dayMs) {
    const key = new Date(ts).toISOString().slice(0, 10)
    result[key] = data[ts] ?? 0
  }

  timeSeriesDataLocal.value = result
}

const compressDataByMonth = () => {
  const monthlyMap: Record<string, number> = {}

  Object.entries(timeSeriesDataLocal.value).forEach(([date, value]) => {
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

const playback = () => {
  if (!playbackOriginalDateLimits.value) {
    playbackOriginalDateLimits.value = {
      start: observationsStore.dateFilter.start || '',
      end: observationsStore.dateFilter.end || '',
    }
  }
  const endingDate = new Date(
    playbackOriginalDateLimits.value?.end || observationsStore.dateFilter.end || '',
  )
  let currentDate = new Date(playbackCurrentDate.value || observationsStore.dateFilter.start || '')

  playbackInterval.value = setInterval(() => {
    if (currentDate > endingDate) {
      clearInterval(playbackInterval.value)
      playbackOngoing.value = false
      playbackCurrentDate.value = null
      playbackOriginalDateLimits.value = null
      return
    }
    if (!playbackOngoing.value) {
      clearInterval(playbackInterval.value)
      return
    }

    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, '0')

    observationsStore.dateFilter.end = `${year}-${month}-01`
    playbackCurrentDate.value = currentDate

    currentDate.setMonth(currentDate.getMonth() + 1)
  }, playbackSpeed.value.value)
}

const replay = () => {
  playbackInterval.value && clearInterval(playbackInterval.value)
  playbackOngoing.value = false
  if (playbackOriginalDateLimits.value) {
    observationsStore.dateFilter.start = playbackOriginalDateLimits.value.start
    observationsStore.dateFilter.end = playbackOriginalDateLimits.value.end
    playbackCurrentDate.value = null
    playbackOriginalDateLimits.value = null
    playbackOngoing.value = true
    playback()
  }
}

onMounted(() => {
  const chart = chartRef.value?.chart

  if (!chart) return

  chart.on('brushSelected', (params: any) => {
    debouncedUpdate(params)
    playbackOngoing.value = false
    playbackCurrentDate.value = null
    playbackOriginalDateLimits.value = null
  })

  chart.on('brush', (params: any) => {
    const areas = params.areas
    if (areas.length === 0) {
      // Clear date filter
      observationsStore.dateFilter = {
        start: originalDateLimits.value?.start ?? null,
        end: originalDateLimits.value?.end ?? null,
      }
      playbackOngoing.value = false
      playbackCurrentDate.value = null
      playbackOriginalDateLimits.value = null
    }
  })
})

watch(
  () => props.timeSeriesData,
  (newData, oldData) => {
    if (Object.keys(newData).length === 0) return
    fixDateAggregationData(newData)
    compressDataByMonth()
    const allDates = Object.keys(timeSeriesDataLocal.value)
    // If there was no previous data or the new data is empty, set the date limits to the full range of the new data
    if (!oldData || Object.keys(newData || {}).length === 0) {
      originalDateLimits.value = {
        start: allDates[0] as string,
        end: allDates[allDates.length - 1] as string,
      }
      observationsStore.dateFilter = {
        start: originalDateLimits.value.start,
        end: originalDateLimits.value.end,
      }
    }
  },
  { immediate: true },
)

watch(playbackOngoing, (newValue) => {
  if (newValue) {
    playback()
  }
})

const option = computed(() => ({
  xAxis: {
    type: 'category',
    data: timeSeriesDataMonthly.value.months.map((m) => {
      const [year, month] = m.split('-')
      const date = new Date(Number(year), Number(month) - 1, 1)
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short' })
    }),
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
      data: timeSeriesDataMonthly.value.values.map((m, index) => {
        const [year, month] = timeSeriesDataMonthly.value.months[index]?.split('-') || []
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

const loading = false
</script>
