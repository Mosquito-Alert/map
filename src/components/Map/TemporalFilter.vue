<template>
  <div class="flex flex-col items-center">
    <!-- ! Date Information -->
    <div
      class="dates-controller inline-flex flex-nowrap self-end items-center gap-3 px-3 py-1 bg-gray-100 border-gray-400 border-1 border-b-0 rounded-t-lg cursor-default text-gray-700 text-base font-normal shadow-md transition-all duration-300"
      :class="{
        'rounded-lg border-b-1': !showChart,
      }"
    >
      <div class="dates whitespace-nowrap pointer-events-auto">
        <!-- TODO: -->

        <div v-if="isDataASnapshot">
          <span class="font-medium">01-01-2025</span>
        </div>
        <div v-else>
          <span class="font-medium">01-01-2014</span>
          -
          <span class="font-medium">20-01-2025</span>
          <!-- <span class="font-medium">{{ formatDate(observationsStore.dateFilter.start || '') }}</span>
            -
            <span class="font-medium">{{ formatDate(observationsStore.dateFilter.end || '') }}</span> -->
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
          @click="showChart = !showChart"
        >
          <Transition name="icon-rotate" mode="out-in">
            <span
              :key="showChart ? 'close' : 'open'"
              class="text-gray-700 material-icons-outlined text-xl! p-0! m-0!"
            >
              {{ showChart ? 'close_fullscreen' : 'open_in_full' }}
            </span>
          </Transition>
        </Button>
      </div>
    </div>

    <!-- ! Date Range Controller -->
    <Transition name="chart-expand">
      <div
        v-if="showChart && uiStore.activeTab === drawerTabs.explore.value"
        class="chart-window group flex justify-center h-20 w-full max-w-md p-4 hidden lg:block bg-white! border-gray-400! border-1! rounded-tr-none rounded-lg shadow-lg pointer-events-auto overflow-hidden"
      >
        <Slider
          v-model="value"
          class="max-w-sm w-xl! pt-1"
          :pt="{
            root: { class: 'w-64' },
            range: { class: 'bg-sky-500 ' },
            handle: {
              class:
                'h-4 w-4 -m-2 rounded-full bg-sky-500 opacity-0 scale-75 transition-all duration-150 group-hover:opacity-100 group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:scale-100',
            },
          }"
        />

        <!-- <div class="playback flex items-center justify-center gap-2 p-2">
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
        </div> -->
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import Slider from 'primevue/slider'
import { computed, onMounted, ref, watch } from 'vue'
import { useObservationsStore } from '../../stores/observationsStore'
import { drawerTabs, useUIStore } from '../../stores/uiStore'
import { fillMissingDates, getTimestampsBetween, PeriodicityEnum } from '../../utils/date'

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
  data: {
    type: Object as () => Record<string, number>, // date -> count
    required: false,
  },
})

const observationsStore = useObservationsStore()
const uiStore = useUIStore()

const value = ref(60)
const isDataASnapshot = ref(false) // Tells if the shown data is either a snapshot or an aggregation
const menu = ref()
const showChart = ref(true)
// data
type TimeSeriesPoint = { date: number; value?: number }
const timeSeries = ref<TimeSeriesPoint[]>([]) // Sorted points by timestamp. Value can be missing when only date limits are available.
const dates = computed<number[]>(() => timeSeries.value.map((point) => point.date))
const values = computed<Array<number>>(() => timeSeries.value.map((point) => point.value ?? 0))
const aggregatedTimeSeries = ref<{
  keys: string[]
  values: number[]
}>({ keys: [], values: [] })
const aggregationPeriodicity = PeriodicityEnum.Month // Indicates the periodicity of aggregation.

onMounted(() => {
  observationsStore.dateLimits = {
    first: props.dateLimits.first.toISOString(),
    last: props.dateLimits.last.toISOString(),
  }
  observationsStore.dateFilter = {
    start: observationsStore.dateLimits.first,
    end: observationsStore.dateLimits.last,
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

watch(
  () => props.dateLimits,
  (newLimits) => {
    if (!newLimits.first) {
      isDataASnapshot.value = true
      return
    }
    isDataASnapshot.value = false
    if (!props.data || Object.keys(props.data).length === 0) {
      // Expand dates with periodicity and keep values optional.
      timeSeries.value = getTimestampsBetween(
        newLimits.first,
        newLimits.last,
        props.dataPeriodicity,
      ).map((date) => ({ date }))
    } else {
      // Fill missing dates with 0s
      const timeseriesData = fillMissingDates(props.data, props.dataPeriodicity)

      timeSeries.value = Object.entries(timeseriesData).map(([date, value]) => ({
        date: Number(date),
        value,
      }))

      // Compress data into aggregation periodicity
      compressData()
    }
  },
  { immediate: true },
)
</script>

<style>
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
