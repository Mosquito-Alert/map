<template>
  <q-drawer :overlay="$q.platform.is.mobile" :model-value="visibleLocal" behavior="desktop" side='right'
    class="column full-height no-scroll" :width="drawerWidth">
    <!-- Top content -->
    <div class="col q-pa-sm">
      <!-- Header -->
      <div>
        <h6 class="text-primary text-capitalize q-my-sm">{{ $t('summary') }}</h6>
        <div class="column q-pa-xs">
          <div class="row text-uppercase">
            <span class="text-grey">{{ $t('total_reports') }}</span>
            <q-space />
            <span class="text-bold">{{ numFeatures }}</span>
          </div>
        </div>
        <div :class="[`lt-${breakpoint}`, 'self-start', 'q-ma-sm', 'absolute-top-right']">
          <q-btn outline round color='primary' icon="fa fat fa-xmark" size="sm" @click="toggleVisible(false)" />
        </div>
      </div>
      <!-- Charts -->
      <ReportsAnalyticsPieChart :features="features" />
      <ReportsAnalyticsBarChart :features="features" :min-date="fromDate" :max-date="toDate" />
    </div>
    <div v-if="features?.length" class="col-auto">
      <q-separator spaced="sm" class="full-width" />
      <ReportsAnalyticsLastActivity :features="features" />
    </div>


    <div class="absolute" style="top: 78.5px; left: -17px">
      <q-btn dense round unelevated class="absolute" color="primary" icon="chevron_right"
        @click="toggleVisible(false)" />
    </div>
  </q-drawer>

  <div v-if="!visibleLocal" :class="[visibleLocal ? `gt-${breakpoint}` : '', 'absolute-right', 'q-px-sm']"
    style="z-index: 1; top: 78.5px">
    <q-btn dense round unelevated color="primary" icon="chevron_left" @click="toggleVisible(true)" />
  </div>

</template>

<script setup lang="ts">

import type { Screen } from 'quasar';
import { useQuasar } from 'quasar'
import { ref, computed, watch } from 'vue'
import type { Feature } from 'ol';

import ReportsAnalyticsPieChart from 'src/components/reports/analytics/ReportsAnalyticsPieChart.vue'
import ReportsAnalyticsBarChart from 'src/components/reports/analytics/ReportsAnalyticsBarChart.vue'
import ReportsAnalyticsLastActivity from 'src/components/reports/analytics/ReportsAnalyticsLastActivity.vue'

const props = withDefaults(defineProps<{
  modelValue?: boolean,
  width?: number,
  features?: Feature[],
  fromDate?: Date,
  toDate?: Date,
  breakpoint?: keyof Screen["sizes"]
}>(), {
  modelValue: true,
  width: 350,
  breakpoint: 'sm'
})

const $q = useQuasar();

const drawerWidth = computed(() => {
  return $q.screen.width <= $q.screen.sizes[props.breakpoint]
    ? $q.screen.width
    : props.width
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

// local state synced with v-model
const visibleLocal = ref(props.modelValue)

// sync local state if parent changes it
watch(() => props.modelValue, (val) => {
  visibleLocal.value = val
})

// function to toggle visibility and emit event
function toggleVisible(value: boolean) {
  visibleLocal.value = value
  emit('update:modelValue', value)
}

const numFeatures = computed(() => {
  return props.features?.length || 0
})

</script>
