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
    :bites="biteLayer" :tags="tags" :from-date="fromDate" :to-date="toDate"
    @update:selectedFeature="handleSelectedFeatureUpdate" />
  <SamplingEffortVectorLayer :visible="samplingEffortLayer" :from-date="fromDate" :to-date="toDate" />

  <ReportsAnalyticsDrawer v-model="analyticsDrawerVisible" v-if="showAnalyticsDrawer" :features="visibleFeatures" />
  <ReportsFeatureDetail v-if="selectedReportUuid" :report-uuid="selectedReportUuid" :report-type="selectedReportType!"
    :key="selectedReportUuid" @close="selectedReportUuid = undefined; selectedReportType = undefined" />

  <Teleport v-if="!!boundaryStore.getPolygon" defer to=".ol-overlaycontainer-stopevent">
    <q-chip :model-value="!!boundaryStore.getPolygon" removable clickable class="ol-search all-pointer-events"
      color="primary" text-color="white" icon="location_on" :label="boundaryStore.getBoundaryName || ''"
      @remove="boundaryStore.setPolygon(null)" />
  </Teleport>

  <ol-vector-layer :visible="true" :opacity="1">
    <ol-source-vector>
      <ol-feature v-if="!!boundaryStore.getPolygon">
        <component :is="geometryComponent" :coordinates="boundaryStore.getPolygon.getCoordinates()" />
        <ol-style>
          <ol-style-stroke :color="colors.getPaletteColor('primary')" :width="2" />
          <ol-style-fill :color="colors.getPaletteColor('primary') + '33'" />
        </ol-style>
      </ol-feature>
    </ol-source-vector>
  </ol-vector-layer>

</template>

<script setup lang="ts">
import { colors, date } from 'quasar'

import { ref, computed, watch, onMounted, onUnmounted, inject } from 'vue'
import { useRouteParams, useRouteQuery } from '@vueuse/router';
import { useI18n } from 'vue-i18n';
import debounce from 'debounce';

import type Map from "ol/Map";
import GeoJSON from 'ol/format/GeoJSON'
import Polygon from 'ol/geom/Polygon';
import MultiPolygon from 'ol/geom/MultiPolygon';
import SearchNominatim from 'ol-ext/control/SearchNominatim'
import type { SearchEvent } from 'ol-ext/control/Search';

import ReportLeftDrawer from 'src/components/ReportsLeftDrawer.vue'
import ReportsMapLayer from 'src/components/ReportsMapLayer.vue'
import SamplingEffortVectorLayer from 'src/components/SamplingEffortVectorLayer.vue'
import ReportsAnalyticsDrawer from 'src/components/ReportsAnalyticsDrawer.vue'
import ReportsFeatureDetail from 'src/components/ReportsFeatureDetail.vue'
import type { DateRange } from 'src/types/date'
import type { ReportType } from 'src/types/reportType';
import { useBoundaryStore } from 'src/stores/boundaryStore';

const { t, locale } = useI18n();
const boundaryStore = useBoundaryStore();

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

const mosquitoLayers = useRouteQuery('mosquitoes', '', {
  transform: {
    get: (v: string) => v ? v.split(',') : [],
    set: v => v.join(','),
  },
})

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

const analyticsDrawerVisible = ref(true)

const geometryComponent = computed(() => {
  if (boundaryStore.getPolygon instanceof Polygon) return 'ol-geom-polygon';
  if (boundaryStore.getPolygon instanceof MultiPolygon) return 'ol-geom-multi-polygon';
  return null; // fallback if needed
});

const geoJson = new GeoJSON()
const searchControl = new SearchNominatim({
  polygon: true,
  maxItems: 10,
  maxHistory: -1,
  title: t('search'),
  placeholder: t('search') + '...',
  typing: 500,
  collapsed: false,
  noCollapse: true,
  zoomOnSelect: 11,
  onselect: (e: SearchEvent) => {
    const geometry = geoJson.readGeometry(
      e.search.geojson,
      {
        dataProjection: 'EPSG:4326',
        featureProjection: map!.getView().getProjection()
      }
    );
    boundaryStore.setPolygon(
      geometry as Polygon | MultiPolygon,
      map!.getView().getProjection(),
      e.search.name
    );
  }
})
// Disable attribution copy
searchControl.set('copy', '')
// Overwrite requestData to add 'accept-language' header.
// See: https://github.com/Viglino/ol-ext/issues/559
searchControl.requestData = function (s) {
  const data = SearchNominatim.prototype.requestData.call(this, s);
  data['accept-language'] = locale.value;
  data['polygon_threshold'] = 0.001;
  return data
}

watch(() => boundaryStore.getPolygon, (newValue) => {
  if (!newValue) {
    map?.addControl(searchControl)
  } else {
    map?.removeControl(searchControl)
  }
});

onMounted(() => {
  map?.addControl(searchControl)
})

onUnmounted(() => {
  map?.removeControl(searchControl)
})

const showAnalyticsDrawer = computed(() => !selectedReportUuid.value && numReportLayers.value > 0)

watch(() => [mosquitoLayers.value, breedingSitesLayers.value, biteLayer.value, tags.value, fromDate.value, toDate.value], () => {
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
}
function handleDateUpdate(value: DateRange) {
  fromDate.value = value.from ?? undefined
  toDate.value = value.to ?? undefined
}
function handleSelectedFeatureUpdate(value: { id: string; type: ReportType } | undefined) {
  selectedReportUuid.value = value?.id ?? undefined
  selectedReportType.value = value?.type ?? undefined
}

</script>

<style lang="scss">
.ol-search.searching:before {
  background: var(--q-primary);
}
</style>
