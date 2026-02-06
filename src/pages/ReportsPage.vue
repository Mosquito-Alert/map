<template>
  <ReportLeftDrawer :enabled-mosquitoes="mosquitoLayers" :enabled-breeding-sites="breedingSitesLayers"
    :enabled-bites="biteLayer" :enabled-sampling-effort="samplingEffortLayer" :from-date="fromDate" :to-date="toDate"
    :tags="tags" @update-layers:mosquitoes="handleMosquitoesLayerUpdate"
    @update-layers:breeding-sites="handleBreedingSitesLayerUpdate" @update-layers:bites="handleBitesLayerUpdate"
    @update-layers:sampling-effort="handleSamplingEffortLayerUpdate" @update-filters:tags="handleTagsUpdate"
    @update-filters:date="handleDateUpdate" />
  <ReportsMapLayer ref="layerRef" :albopictus="mosquitoLayers.includes('albopictus')"
    :aegypti="mosquitoLayers.includes('aegypti')" :japonicus="mosquitoLayers.includes('japonicus')"
    :koreicus="mosquitoLayers.includes('koreicus')" :culex="mosquitoLayers.includes('culex')"
    :unidentified-mosquito="mosquitoLayers.includes('unidentified')" :other-species="mosquitoLayers.includes('other')"
    :storm-drain-water="breedingSitesLayers.includes('stormDrainWater')"
    :storm-drain-dry="breedingSitesLayers.includes('stormDrainDry')" :other-site="breedingSitesLayers.includes('other')"
    :bites="biteLayer" :tags="tags" :from-date="fromDate" :to-date="toDate" />
  <SamplingEffortVectorLayer :visible="samplingEffortLayer" :from-date="fromDate" :to-date="toDate" />

  <ReportsAnalyticsDrawer v-model="analyticsDrawerVisible" v-if="showAnalyticsDrawer" :features="visibleFeatures" />
  <ReportsFeatureDetail v-if="reportMapStore.selectedReport" :report="reportMapStore.selectedReport"
    @close="reportMapStore.selectedReport = null" />

  <LocationSearchBar />

</template>

<script setup lang="ts">
import { date, useQuasar } from 'quasar'

import { ref, computed, watch, onMounted, onUnmounted, inject } from 'vue'
import { useRouteParams, useRouteQuery } from '@vueuse/router';
import debounce from 'debounce';

import type Map from "ol/Map";

import ReportLeftDrawer from 'src/components/ReportsLeftDrawer.vue'
import ReportsMapLayer from 'src/components/ReportsMapLayer.vue'
import SamplingEffortVectorLayer from 'src/components/SamplingEffortVectorLayer.vue'
import ReportsAnalyticsDrawer from 'src/components/ReportsAnalyticsDrawer.vue'
import ReportsFeatureDetail from 'src/components/ReportsFeatureDetail.vue'
import LocationSearchBar from 'src/components/LocationSearchBar.vue';

import type { DateRange } from 'src/types/date'
import type { ReportType } from 'src/types/reportType';
import { useReportMapStore } from 'src/stores/reportMapStore';

const $q = useQuasar()

const reportMapStore = useReportMapStore();

const selectedReportUuid = useRouteParams<string | undefined>('uuid', undefined, {
  transform: {
    get: (v) => (!v || v === '' ? undefined : v),
    set: (v) => (!v || v === '' ? '' : v)
  }
})
const selectedReportType = useRouteParams<ReportType | undefined>('reportType', undefined, {
  transform: {
    get: (v) => (!v ? undefined : v),
    set: (v) => (!v ? '' as ReportType : v)
  }
})
watch(() => reportMapStore.selectedReport, (newValue) => {
  selectedReportUuid.value = newValue?.uuid ?? undefined
  selectedReportType.value = newValue?.type ?? undefined
})
watch(
  () => [selectedReportUuid.value, selectedReportType.value],
  async ([uuid, type]) => {
    if (uuid && type) {
      await reportMapStore.setSelectedReport({ uuid, type: type as ReportType })
    }
  },
  { immediate: true }
)

const mosquitoLayers = useRouteQuery('mosquitoes', '', {
  transform: {
    get: (v: string) => v ? v.split(',') : [],
    set: v => v.join(','),
  },
})
if (mosquitoLayers.value.length == 0) {
  mosquitoLayers.value = ['albopictus', 'culex']
}

const breedingSitesLayers = useRouteQuery('breeding_sites', '', {
  transform: {
    get: (v: string) => v ? v.split(',') : [],
    set: v => v.join(','),
  },
})

const biteLayer = useRouteQuery('bites', 'false', {
  transform: {
    get: (v: string) => v === 'true',
    set: v => v ? 'true' : 'false',
  },
})

const samplingEffortLayer = useRouteQuery('sampling_effort', 'false', {
  transform: {
    get: (v: string) => v === 'true',
    set: v => v ? 'true' : 'false',
  },
})

const tagsQuery = useRouteQuery<string>('tags', '');
const tags = computed<string[]>({
  get() {
    return tagsQuery.value ? tagsQuery.value.split(',') : [];
  },
  set(v) {
    tagsQuery.value = v.join(',');
  },
});

// Treat dates from useRouteQuery. See: https://github.com/vueuse/vueuse/issues/2663#issuecomment-1952493495
// In JS [] === [] is false, and vue watch detect changes everytime.
const fromDateQuery = useRouteQuery<string>('from', '');
const fromDate = computed<Date | undefined>({
  get() {
    if (!fromDateQuery.value) return undefined;
    return date.extractDate(fromDateQuery.value, 'YYYY-MM-DD');
  },
  set(val: Date | undefined) {
    if (!val) {
      fromDateQuery.value = '';
      return;
    }
    fromDateQuery.value = date.formatDate(val, 'YYYY-MM-DD');
  },
})

// Treat dates from useRouteQuery. See: https://github.com/vueuse/vueuse/issues/2663#issuecomment-1952493495
// In JS [] === [] is false, and vue watch detect changes everytime.
const toDateQuery = useRouteQuery<string>('to', '');
const toDate = computed<Date | undefined>({
  get() {
    if (!toDateQuery.value) return undefined;
    return date.extractDate(toDateQuery.value, 'YYYY-MM-DD');
  },
  set(val: Date | undefined) {
    if (!val) {
      toDateQuery.value = '';
      return;
    }
    toDateQuery.value = date.formatDate(val, 'YYYY-MM-DD');
  },
})

const map = inject<Map>("map")

const numReportLayers = computed(() => {
  return mosquitoLayers.value.length + breedingSitesLayers.value.length + (biteLayer.value ? 1 : 0)
})

const visibleFeatures = ref([])
const layerRef = ref()

const analyticsDrawerVisible = ref(!$q.platform.is.mobile)

const showAnalyticsDrawer = computed(() => !reportMapStore.selectedReport && numReportLayers.value > 0)

watch(() => [mosquitoLayers.value, breedingSitesLayers.value, biteLayer.value, tags.value, fromDate.value, toDate.value, analyticsDrawerVisible.value], () => {
  updateVisibleFeatures()
})

function updateVisibleFeatures() {
  if (!showAnalyticsDrawer.value || !analyticsDrawerVisible.value) return

  // Get the current extent of the map view
  const extent = map?.getView().calculateExtent(map?.getSize())
  // Run feature fetching asynchronously
  requestIdleCallback(() => {
    visibleFeatures.value = layerRef.value?.getFeaturesInExtent(extent)
  })
}
const debouncedUpdate = debounce(updateVisibleFeatures, 1000)

onMounted(() => {
  map?.on('moveend', debouncedUpdate)
})

onUnmounted(() => {
  map?.un('moveend', debouncedUpdate)
})

function handleMosquitoesLayerUpdate(value: string[]) {
  mosquitoLayers.value = value
}
function handleBreedingSitesLayerUpdate(value: string[]) {
  breedingSitesLayers.value = value
}
function handleBitesLayerUpdate(value: boolean) {
  biteLayer.value = value
}
function handleSamplingEffortLayerUpdate(value: boolean) {
  samplingEffortLayer.value = value
}
function handleTagsUpdate(value: string[]) {
  tags.value = value
  reportMapStore.selectedReport = null
}
function handleDateUpdate(value: DateRange) {
  fromDate.value = value.from ?? undefined
  toDate.value = value.to ?? undefined
  reportMapStore.selectedReport = null
}

</script>

<style lang="scss">
.ol-search.searching:before {
  background: var(--q-primary);
}
</style>
