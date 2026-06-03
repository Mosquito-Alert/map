<template>
  <div class="hidden md:flex flex-col items-center">
    <!-- ! DATES INFORMATION -->
    <div
      class="dates-controller inline-flex flex-nowrap self-end items-center gap-3 px-4 py-1 bg-gray-100 border-gray-400 border-1 border-b-0 rounded-t-lg cursor-default text-gray-700 text-base font-normal shadow-md transition-all duration-300"
      :class="{
        'rounded-lg border-b-1': !showDateFilter,
      }"
    >
      <span class="dates whitespace-nowrap pointer-events-auto font-medium text-sky-800">
        {{ formatDateByPeriodicity(previewDateFilter.end, props.dataPeriodicity) }}
      </span>

      <div
        v-if="uiStore.activeTab === drawerTabs.explore.value"
        key="open"
        class="flex items-end justify-end pointer-events-auto"
      >
        <Button
          severity="secondary"
          size="small"
          class="p-0.5 animated-btn transition-transform active:scale-90 hover:scale-105 duration-150"
          @click="showDateFilter = !showDateFilter"
        >
          <Transition name="icon-rotate" mode="out-in">
            <span
              :key="showDateFilter ? 'close' : 'open'"
              class="text-gray-700 material-icons-outlined text-xl! p-0! m-0!"
            >
              {{ showDateFilter ? 'close_fullscreen' : 'open_in_full' }}
            </span>
          </Transition>
        </Button>
      </div>
    </div>

    <!-- ! TEMPORAL FILTER -->
    <Transition
      name="chart-expand"
      @before-enter="beforeExpandEnter"
      @enter="expandEnter"
      @after-enter="expandAfterEnter"
      @before-leave="beforeExpandLeave"
      @leave="expandLeave"
      @after-leave="expandAfterLeave"
    >
      <div
        v-if="showDateFilter && uiStore.activeTab === drawerTabs.explore.value"
        class="flex flex-col md:flex-row justify-center items-stretch md:items-end w-screen max-w-[calc(100vw-1.5rem)] md:w-xl lg:w-2xl min-h-20 h-auto gap-3 p-2 bg-white! border-gray-400! border-1! rounded-lg! rounded-tr-none! shadow-lg pointer-events-auto overflow-hidden"
      >
        <!-- * BUTTONS -->
        <div class="playback flex items-center! justify-center! gap-2! py-2! shrink-0">
          <Button
            severity="secondary"
            size="small"
            class="flex! justify-center! items-center! p-0.5 bg-gray-200 rounded-sm cursor-pointer animated-btn transition-transform active:scale-90 hover:scale-105 duration-150"
            @click="playbackOngoing = !playbackOngoing"
            v-tooltip.top="playbackOngoing ? 'Pause playback' : 'Start playback'"
          >
            <span class="text-gray-700 material-icons-outlined">
              {{ playbackOngoing ? 'pause' : 'play_arrow' }}
            </span>
          </Button>
          <Button
            severity="secondary"
            size="small"
            class="flex! justify-center! items-center! p-0.5 bg-gray-200 rounded-sm cursor-pointer animated-btn transition-transform active:scale-90 hover:scale-105 duration-150"
            :disabled="sliderValue <= 0"
            @click="goToPreviousPeriod"
          >
            <span class="text-gray-700 material-icons-outlined">
              {{ 'skip_previous' }}
            </span>
          </Button>
          <Button
            severity="secondary"
            size="small"
            class="flex! justify-center! items-center! p-0.5 bg-gray-200 rounded-sm cursor-pointer animated-btn transition-transform active:scale-90 hover:scale-105 duration-150"
            :disabled="sliderValue >= sliderMax"
            @click="goToNextPeriod"
          >
            <span class="text-gray-700 material-icons-outlined">
              {{ 'skip_next' }}
            </span>
          </Button>

          <div>
            <Button
              type="button"
              @click="(event) => menu.toggle(event)"
              severity="secondary"
              size="small"
              class="flex! justify-center! items-center! p-0.5 bg-gray-200 rounded-sm cursor-pointer animated-btn transition-transform active:scale-90 hover:scale-105 duration-150"
              aria-haspopup="true"
              aria-controls="overlay_menu"
              v-tooltip.top="'Playback speed'"
            >
              <span class="text-gray-700 material-icons-outlined">
                {{ 'speed' }}
              </span>
            </Button>
            <Menu
              ref="menu"
              id="overlay_menu"
              :model="playbackMenuItems"
              :popup="true"
              :pt="{
                item: {
                  class: 'cursor-pointer',
                },
              }"
            >
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

        <!-- * FILTER -->
        <div class="temporal-filter group flex-col flex-1 w-full min-w-0">
          <!-- Show chart if size is wider than md -->
          <div v-if="thereIsData" class="group h-20 w-full hidden md:block px-0">
            <TimeSeries
              :values="aggregatedTimeSeries.values"
              :labels="aggregatedTimeSeries.keys"
              :date-filter="previewDateFilter"
            />
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
              class="date-limits flex flex-row items-center justify-between pt-1 w-full min-w-0 text-xs font-medium text-gray-700 cursor-default whitespace-nowrap"
            >
              <span>
                {{
                  formatDateByPeriodicity(observationsStore.dateLimits.start, props.dataPeriodicity)
                }}
              </span>
              <span>
                {{
                  formatDateByPeriodicity(observationsStore.dateLimits.end, props.dataPeriodicity)
                }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import Slider from 'primevue/slider'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
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
const showDateFilter = ref(true)
const sliderMax = computed(() => Math.max(dates.value.length - 1, 0))
const sliderStep = ref(1) // One slider step equals one period entry (day, month, or year).
const previewDateFilter = computed(() => {
  const startDate = dates.value[0]
  const endIndex = Math.max(0, Math.min(sliderValue.value, sliderMax.value))
  const endDate = dates.value[endIndex] ?? dates.value[dates.value.length - 1]

  if (startDate === undefined || endDate === undefined) {
    return {
      start: observationsStore.dateFilter.start,
      end: observationsStore.dateFilter.end,
    }
  }

  return {
    start: new Date(startDate).toISOString(),
    end: new Date(endDate).toISOString(),
  }
})
// Playback state
type PlaybackSpeed = {
  label: string
  value: number
}
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
const playbackInterval = ref<number | null>(null)
const playbackOngoing = ref(false)
// Playback direction enum for clearer, typed calls
enum PlaybackDirection {
  Next = 'next',
  Prev = 'prev',
}

// Data
type TimeSeriesPoint = { date: number; value?: number }
const thereIsData = computed(() => props.data && Object.keys(props.data).length > 0)
const timeSeries = ref<TimeSeriesPoint[]>([]) // Sorted points by timestamp. Value can be missing when only date limits are available.
const dates = computed<number[]>(() => timeSeries.value.map((point) => point.date))
const aggregatedTimeSeries = ref<{
  keys: string[]
  values: number[]
}>({ keys: [], values: [] })
const aggregationPeriodicity = computed(() => {
  if (thereIsData.value) {
    // If we have data, we assume it's monthly aggregated (for now, this is the only supported periodicity for provided data). In the future, we could derive this from the data itself by checking the intervals between dates.
    return PeriodicityEnum.Month
  }
  return props.dataPeriodicity
}) // Indicates the periodicity of aggregation.

// * UTILS
/**
 * Finds the index of the nearest date in the time series to the provided date string.
 * If the date string is invalid or not provided, it returns the fallback index.
 * @param dateAsString
 * @param fallback
 * @param direction - 'next' to find the nearest date greater than or equal to the provided date, 'prev' to find the nearest date less than or equal to the provided date.
 */
const findNearestDateIndex = (
  dateAsString: string | null,
  fallback: number,
  direction: PlaybackDirection = PlaybackDirection.Next,
) => {
  if (!dateAsString || dates.value.length === 0) return fallback

  const timestamp = Date.parse(dateAsString)
  if (Number.isNaN(timestamp)) return fallback

  if (direction === PlaybackDirection.Next) {
    const nearestIndex = dates.value.findIndex((date) => date >= timestamp)
    return nearestIndex === -1 ? sliderMax.value : nearestIndex
  }

  // prev: find the last index <= timestamp
  for (let i = dates.value.length - 1; i >= 0; i -= 1) {
    const candidate = dates.value[i]
    if (candidate !== undefined && candidate <= timestamp) return i
  }

  return fallback
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
 * Compresses daily data into periodic aggregates.
 */
const compressData = () => {
  const aggregationMap: Record<string, number> = {}

  timeSeries.value.forEach(({ date, value }) => {
    const sliceLength =
      aggregationPeriodicity.value === PeriodicityEnum.Month ? 7 : PeriodicityEnum.Year ? 4 : 10 // Adjust slice length based on periodicity
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
  if (!thereIsData.value) {
    // If no original data is provided
    timeSeries.value = getTimestampsBetween(start, end, props.dataPeriodicity).map((date) => ({
      date,
    }))
  } else {
    // If original data is provided.
    const timeseriesData = fillMissingDates(props.data as any, props.dataPeriodicity) // (as any because we know it has a value, since we checked thereIsData)
    timeSeries.value = Object.entries(timeseriesData)
      .sort(([firstDate], [secondDate]) => Number(firstDate) - Number(secondDate))
      .map(([date, value]) => ({
        date: Number(date),
        value,
      }))
    compressData()
  }
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

onBeforeUnmount(() => {
  stopPlayback()
})

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

const debouncedUpdateDateFilter = debounce((start: string, end: string) => {
  if (observationsStore.dateFilter.start === start && observationsStore.dateFilter.end === end)
    return

  observationsStore.dateFilter = { start, end }
}, 150)

watch(sliderValue, (newValue) => {
  // Updates the date filter based on the current slider position.
  if (dates.value.length === 0) return

  const endIndex = Math.max(0, Math.min(newValue, sliderMax.value))
  const startDate = dates.value[0]
  const endDate = dates.value[endIndex] ?? dates.value[dates.value.length - 1]

  if (startDate === undefined || endDate === undefined) return

  const start = new Date(startDate).toISOString()
  const end = new Date(endDate).toISOString()

  if (observationsStore.dateFilter.start === start && observationsStore.dateFilter.end === end)
    return

  debouncedUpdateDateFilter(start, end)
})

/** * PLAYBACK */
const stopPlayback = () => {
  if (playbackInterval.value === null) return

  clearInterval(playbackInterval.value)
  playbackInterval.value = null
}

const addPlaybackPeriod = (date: Date, periodicity: PeriodicityEnum, direction: 1 | -1 = 1) => {
  const nextDate = new Date(date)
  const offset = direction === 1 ? 1 : -1

  switch (periodicity) {
    case PeriodicityEnum.Day:
      nextDate.setUTCDate(nextDate.getUTCDate() + offset)
      return nextDate
    case PeriodicityEnum.Month:
      nextDate.setUTCMonth(nextDate.getUTCMonth() + offset)
      return nextDate
    case PeriodicityEnum.Year:
      nextDate.setUTCFullYear(nextDate.getUTCFullYear() + offset)
      return nextDate
  }
}

/**
 * Compute the next/previous playback index based on aggregation periodicity.
 * Returns the best candidate index in the requested direction, falling back
 * to a single-step move if no direct period match is found.
 * @param currentIndex
 * @param direction
 */
const getPlaybackIndex = (currentIndex: number, direction: PlaybackDirection) => {
  const currentDate = dates.value[currentIndex]
  if (currentDate === undefined) return currentIndex

  const dir = direction === PlaybackDirection.Next ? 1 : -1
  const targetDate = addPlaybackPeriod(new Date(currentDate), aggregationPeriodicity.value, dir)
  const fallback = currentIndex + dir
  const nearest = findNearestDateIndex(targetDate.toISOString(), fallback, direction)

  if (direction === PlaybackDirection.Next)
    return nearest <= currentIndex ? currentIndex + 1 : nearest
  return nearest >= currentIndex ? currentIndex - 1 : nearest
}

const goToPreviousPeriod = () => {
  playbackOngoing.value = false
  stopPlayback()

  if (sliderValue.value <= 0) return

  sliderValue.value = Math.max(0, getPlaybackIndex(sliderValue.value, PlaybackDirection.Prev))
}

const goToNextPeriod = () => {
  playbackOngoing.value = false
  stopPlayback()

  if (sliderValue.value >= sliderMax.value) return

  sliderValue.value = Math.min(
    getPlaybackIndex(sliderValue.value, PlaybackDirection.Next),
    sliderMax.value,
  )
}

const startPlayback = () => {
  if (dates.value.length === 0 || playbackInterval.value !== null) return

  if (sliderValue.value >= sliderMax.value) {
    sliderValue.value = 0
  }

  playbackInterval.value = setInterval(() => {
    if (sliderValue.value >= sliderMax.value) {
      playbackOngoing.value = false
      return
    }

    sliderValue.value = Math.min(
      getPlaybackIndex(sliderValue.value, PlaybackDirection.Next),
      sliderMax.value,
    )
  }, playbackSpeed.value.value)
}

watch(playbackOngoing, (newValue) => {
  if (newValue) startPlayback()
  else stopPlayback()
})

// * ANIMATIONS
type TransitionElement = HTMLElement & { _expandHeight?: string }
const beforeExpandEnter = (el: Element) => {
  const element = el as TransitionElement
  element._expandHeight = element.style.height
  element.style.height = '0px'
  element.style.overflow = 'hidden'
}

const expandEnter = (el: Element) => {
  const element = el as TransitionElement
  element.style.height = `${element.scrollHeight}px`
}

const expandAfterEnter = (el: Element) => {
  const element = el as TransitionElement
  element.style.height = 'auto'
  element.style.overflow = ''
}

const beforeExpandLeave = (el: Element) => {
  const element = el as TransitionElement
  element._expandHeight = element.style.height
  element.style.height = `${element.scrollHeight}px`
  element.style.overflow = 'hidden'
}

const expandLeave = (el: Element) => {
  const element = el as TransitionElement
  requestAnimationFrame(() => {
    element.style.height = '0px'
  })
}

const expandAfterLeave = (el: Element) => {
  const element = el as TransitionElement
  element.style.height = element._expandHeight ?? ''
  element.style.overflow = ''
}
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
}

.chart-expand-enter-from,
.chart-expand-leave-to {
  opacity: 0;
}

.chart-expand-enter-to,
.chart-expand-leave-from {
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
