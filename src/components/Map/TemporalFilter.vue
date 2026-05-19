<template>
  <div
    class="flex flex-col md:flex-row justify-center items-stretch md:items-end w-screen max-w-[calc(100vw-1.5rem)] md:w-xl lg:w-2xl min-h-20 h-auto gap-3 p-2 bg-white! border-gray-400! border-1! rounded-lg! shadow-lg pointer-events-auto"
  >
    <!-- BUTTONS -->
    <div class="playback flex items-center! justify-center! gap-2! py-2! shrink-0">
      <Button
        severity="secondary"
        size="small"
        class="flex! justify-center! items-center! p-0.5 bg-gray-200 rounded-sm cursor-pointer animated-btn transition-transform active:scale-90 hover:scale-105 duration-150"
      >
        <span class="text-gray-700 material-icons-outlined">
          {{ 'play_arrow' }}
        </span>
      </Button>
      <Button
        severity="secondary"
        size="small"
        class="flex! justify-center! items-center! p-0.5 bg-gray-200 rounded-sm cursor-pointer animated-btn transition-transform active:scale-90 hover:scale-105 duration-150"
      >
        <span class="text-gray-700 material-icons-outlined">
          {{ 'skip_previous' }}
        </span>
      </Button>
      <Button
        severity="secondary"
        size="small"
        class="flex! justify-center! items-center! p-0.5 bg-gray-200 rounded-sm cursor-pointer animated-btn transition-transform active:scale-90 hover:scale-105 duration-150"
      >
        <span class="text-gray-700 material-icons-outlined">
          {{ 'skip_next' }}
        </span>
      </Button>
    </div>

    <!-- FILTER -->
    <div class="temporal-filter group flex-col flex-1 w-full min-w-0">
      <!-- Show chart if size is wider than md -->
      <div v-if="showChart" class="group h-20 w-full hidden md:block px-0">
        <TimeSeries :values="aggregatedTimeSeries.values" :labels="aggregatedTimeSeries.keys" />
      </div>
      <div class="flex flex-1 items-center flex-col">
        <Slider
          v-model="sliderValue"
          :min="0"
          :max="sliderMax"
          :step="sliderStep"
          :disabled="dates.length === 0"
          class="w-full pt-1"
          :pt="{
            root: {
              class: 'bg-gray-300 cursor-pointer',
            },
            range: { class: [isDataASnapshot ? 'bg-gray-300' : 'bg-sky-500'] },
            handle: {
              class: [
                'slider-hangler h-4 w-4 rounded-full ',
                isDataASnapshot
                  ? ''
                  : ' opacity-0 scale-75 transition-all duration-150 group-hover:opacity-100 group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:scale-100',
              ],
            },
          }"
        />

        <div
          class="date-limits flex flex-row items-center justify-between pt-1 w-full min-w-0 text-xs font-medium text-gray-700 whitespace-nowrap"
        >
          <span>
            {{ formatDateByPeriodicity(observationsStore.dateLimits.start, props.dataPeriodicity) }}
          </span>
          <span>
            {{ formatDateByPeriodicity(observationsStore.dateLimits.end, props.dataPeriodicity) }}
          </span>
        </div>
      </div>
    </div>
  </div>

  <!-- DATES INFORMATION -->
  <!-- <div
      class="dates-controller inline-flex flex-nowrap items-center gap-2 text-sm font-normal text-gray-700"
    >
      <div class="dates min-w-0 whitespace-nowrap">
        <div v-if="isDataASnapshot">
          <span class="font-bold">{{
            formatDateByPeriodicity(observationsStore.dateFilter.end, props.dataPeriodicity)
          }}</span>
        </div>
        <div v-else>
          <span class="font-medium">{{
            formatDateByPeriodicity(observationsStore.dateFilter.start, props.dataPeriodicity)
          }}</span>
          -
          <span class="font-bold">{{
            formatDateByPeriodicity(observationsStore.dateFilter.end, props.dataPeriodicity)
          }}</span>
        </div>
      </div>

      <div
        v-if="uiStore.activeTab === drawerTabs.explore.value"
        key="open"
        class="flex items-end justify-end pointer-events-auto"
      >
        <Button
          severity="secondary"
          size="small"
          class="p-0.5 animated-btn transition-transform active:scale-90 hover:scale-105 duration-150"
          @click="dateFilter = !dateFilter"
        >
          <Transition name="icon-rotate" mode="out-in">
            <span
              :key="dateFilter ? 'close' : 'open'"
              class="text-gray-700 material-icons-outlined text-xl! p-0! m-0!"
            >
              {{ dateFilter ? 'close_fullscreen' : 'open_in_full' }}
            </span>
          </Transition>
        </Button>
      </div>
    </div> -->
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Slider from 'primevue/slider'
import { computed, onMounted, ref, watch } from 'vue'
import { useObservationsStore } from '../../stores/observationsStore'
import { drawerTabs, useUIStore } from '../../stores/uiStore'
import {
  fillMissingDates,
  formatDateByPeriodicity,
  getTimestampsBetween,
  PeriodicityEnum,
} from '../../utils/date'
import { debounce } from '../../utils/debouncer'
import TimeSeries from './TimeSeries.vue'

const props = defineProps({
  dateLimits: {
    type: Object as () => { first: Date; last: Date },
    required: true,
  },
  dataPeriodicity: {
    // This indicates the periodicity of the provided data, which can be used to correctly fill missing dates and aggregate data. For simplicity, we set it as a prop, but ideally it should be derived from the data itself (e.g., by checking the intervals between dates).
    type: String as () => PeriodicityEnum,
    required: true,
  },
  isDataASnapshot: {
    // This indicates if the provided data is a snapshot (i.e., all data points have the same date) or a time series. This can be used to adapt the behavior of the temporal filter, for example by disabling the slider and only showing the date.
    type: Boolean,
    required: true,
  },
  data: {
    // type object or null
    type: Object as () => Record<string, number> | null, // date -> count
    required: true,
  },
})

const observationsStore = useObservationsStore()
const uiStore = useUIStore()

const isDataASnapshot = computed(() => props.isDataASnapshot)
const sliderValue = ref(0)
const menu = ref()
const showChart = computed(() => props.data && Object.keys(props.data).length > 0)
const dateFilter = ref(true)
const sliderMax = computed(() => Math.max(dates.value.length - 1, 0))
const sliderStep = computed(() => 1) // One slider step equals one period entry (day, month, or year).
// data
type TimeSeriesPoint = { date: number; value?: number }
const timeSeries = ref<TimeSeriesPoint[]>([]) // Sorted points by timestamp. Value can be missing when only date limits are available.
const dates = computed<number[]>(() => timeSeries.value.map((point) => point.date))
const aggregatedTimeSeries = ref<{
  keys: string[]
  values: number[]
}>({ keys: [], values: [] })
const aggregationPeriodicity = PeriodicityEnum.Month // Indicates the periodicity of aggregation.

/**
 * Finds the index of the nearest date in the time series to the provided date string.
 * If the date string is invalid or not provided, it returns the fallback index.
 * @param dateAsString
 * @param fallback
 */
const findNearestDateIndex = (dateAsString: string | null, fallback: number) => {
  if (!dateAsString || dates.value.length === 0) return fallback

  const timestamp = Date.parse(dateAsString)
  if (Number.isNaN(timestamp)) return fallback

  const nearestIndex = dates.value.findIndex((date) => date >= timestamp)
  return nearestIndex === -1 ? sliderMax.value : nearestIndex
}

/**
 * Syncs the slider position with the current date filter.
 * This is useful to keep the slider in sync when the date filter is updated from other components
 */
const syncSliderFromDateFilter = () => {
  if (dates.value.length === 0) {
    sliderValue.value = 0
    return
  }

  const endIndex = findNearestDateIndex(observationsStore.dateFilter.end, sliderMax.value)
  sliderValue.value = Math.max(0, Math.min(endIndex, sliderMax.value))
}

/**
 * Updates the date filter based on the current slider position.
 */
const updateDateFilterFromSlider = (endIndexValue: number) => {
  if (dates.value.length === 0) return

  const endIndex = Math.max(0, Math.min(endIndexValue, sliderMax.value))
  const startDate = dates.value[0]
  const endDate = dates.value[endIndex] ?? dates.value[dates.value.length - 1]

  if (startDate === undefined || endDate === undefined) return

  const start = new Date(startDate).toISOString()
  const end = new Date(endDate).toISOString()

  if (observationsStore.dateFilter.start === start && observationsStore.dateFilter.end === end)
    return

  observationsStore.dateFilter = { start, end }
}

onMounted(() => {
  observationsStore.dateLimits = {
    start: props.dateLimits.first.toISOString(),
    end: props.dateLimits.last.toISOString(),
  }
  observationsStore.dateFilter = {
    start: observationsStore.dateLimits.start,
    end: observationsStore.dateLimits.end,
  }
})

/**
 * Compresses daily data into periodic aggregates.
 */
const compressData = () => {
  const aggregationMap: Record<string, number> = {}

  timeSeries.value.forEach(({ date, value }) => {
    const sliceLength =
      aggregationPeriodicity === PeriodicityEnum.Month ? 7 : PeriodicityEnum.Year ? 4 : 10 // Adjust slice length based on periodicity
    const periodKey = new Date(date).toISOString().slice(0, sliceLength) // Example: "2025-01" for monthly aggregation
    aggregationMap[periodKey] = (aggregationMap[periodKey] || 0) + (value ?? 0)
  })

  aggregatedTimeSeries.value.keys = Object.keys(aggregationMap)
  aggregatedTimeSeries.value.values = Object.values(aggregationMap)
}

/**
 * Regenerates the time series based on the provided date limits and the original data.
 * @param start
 * @param end
 */
const regenerateTimeSeries = (start: Date, end: Date) => {
  if (!props.data || Object.keys(props.data).length === 0) {
    // If no original data is provided
    timeSeries.value = getTimestampsBetween(start, end, props.dataPeriodicity).map((date) => ({
      date,
    }))
  } else {
    // If original data is provided
    const timeseriesData = fillMissingDates(props.data, props.dataPeriodicity)
    timeSeries.value = Object.entries(timeseriesData)
      .sort(([firstDate], [secondDate]) => Number(firstDate) - Number(secondDate))
      .map(([date, value]) => ({
        date: Number(date),
        value,
      }))
    compressData()
  }
}

watch(
  () => props.data,
  (newData) => {
    if (!newData) return

    const start = observationsStore.dateLimits.start
    const end = observationsStore.dateLimits.end
    if (!start || !end) return

    const parsedStart = new Date(start)
    const parsedEnd = new Date(end)
    if (Number.isNaN(parsedStart.getTime()) || Number.isNaN(parsedEnd.getTime())) return

    regenerateTimeSeries(parsedStart, parsedEnd)
  },
  { deep: true, immediate: true },
)

watch(
  () => props.dateLimits,
  (newLimits) => {
    observationsStore.dateLimits = {
      start: newLimits.first.toISOString(),
      end: newLimits.last.toISOString(),
    }
    observationsStore.dateFilter = {
      start: observationsStore.dateLimits.start,
      end: observationsStore.dateLimits.end,
    }
    regenerateTimeSeries(newLimits.first, newLimits.last)
  },
  { immediate: true },
)

watch(dates, syncSliderFromDateFilter, { immediate: true })

watch(
  () => observationsStore.dateFilter,
  () => {
    syncSliderFromDateFilter()
  },
  { deep: true },
)

watch(
  () => ({
    start: observationsStore.dateLimits.start,
    end: observationsStore.dateLimits.end,
  }),
  (newLimits) => {
    // Only regenerate time series if observationsStore.dateLimits has real values
    if (!newLimits.start || !newLimits.end) return

    const start = new Date(newLimits.start)
    const end = new Date(newLimits.end)

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return

    regenerateTimeSeries(start, end)
  },
  { deep: true },
)

const debouncedUpdateDateFilterFromSlider = debounce((newValue: number) => {
  updateDateFilterFromSlider(newValue)
}, 150)

watch(sliderValue, (newValue) => {
  debouncedUpdateDateFilterFromSlider(newValue)
})
</script>

<style>
.slider-hangler::before {
  background: #2b5fff;
}
/* CHART ANIMATION */
.chart-expand-enter-active,
.chart-expand-leave-active {
  transition:
    height 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.25s ease;
  overflow: hidden;
}

.chart-expand-enter-from,
.chart-expand-leave-to {
  height: 0;
  opacity: 0;
}

.chart-expand-enter-to,
.chart-expand-leave-from {
  height: 220px;
  opacity: 1;
}

/* CLOSE BUTTON ANIMATION */
.icon-rotate-enter-active,
.icon-rotate-leave-active {
  transition: all 0.2s ease;
}

.icon-rotate-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.8);
}

.icon-rotate-enter-to {
  opacity: 1;
  transform: rotate(0deg) scale(1);
}

.icon-rotate-leave-from {
  opacity: 1;
  transform: rotate(0deg) scale(1);
}

.icon-rotate-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.8);
}
</style>
