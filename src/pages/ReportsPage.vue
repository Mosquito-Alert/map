<template>
  <ReportLeftDrawer @update-layers:mosquitoes="handleMosquitoesLayerUpdate"
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
  <!-- <ReportsAnalyticsDrawer v-if="!selectedReportUuid" :visible="numReportLayers !== 0" :features="visibleFeatures" /> -->
  <ReportsFeatureDetail v-if="selectedReportUuid" :report-uuid="selectedReportUuid" :report-type="selectedReportType!"
    :key="selectedReportUuid" @close="selectedReportUuid = undefined" />

  <Teleport v-if="!!selectedLocationPolygon" defer to=".ol-overlaycontainer-stopevent">
    <q-chip :model-value="!!selectedLocationPolygon" removable clickable class="ol-search all-pointer-events"
      color="primary" text-color="white" icon="location_on" :label="selectedLocationName"
      @remove="selectedLocationPolygon = null" />
  </Teleport>

  <ol-vector-layer :visible="true" :opacity="1">
    <ol-source-vector>
      <ol-feature v-if="!!selectedLocationPolygon">
        <ol-geom-polygon v-if="selectedLocationIsPolygon" :coordinates="selectedLocationPolygon.getCoordinates()" />
        <ol-geom-multi-polygon v-else-if="selectedLocationIsMultiPolygon"
          :coordinates="selectedLocationPolygon.getCoordinates()" />
        <ol-style>
          <ol-style-stroke :color="colors.getPaletteColor('primary')" :width="2" />
          <ol-style-fill :color="colors.getPaletteColor('primary') + '33'" />
        </ol-style>
      </ol-feature>
    </ol-source-vector>
  </ol-vector-layer>

</template>

<script lang="ts">
import { colors } from 'quasar'

import { ref, computed, watch, onMounted, onUnmounted, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n';

import type Map from "ol/Map";
import GeoJSON from 'ol/format/GeoJSON'
import Polygon from 'ol/geom/Polygon';
import MultiPolygon from 'ol/geom/MultiPolygon';
import SearchNominatim from 'ol-ext/control/SearchNominatim'
import type { SearchEvent } from 'ol-ext/control/Search';

import ReportLeftDrawer from 'src/components/ReportsLeftDrawer.vue'
import ReportsMapLayer from 'src/components/ReportsMapLayer.vue'
import SamplingEffortVectorLayer from 'src/components/SamplingEffortVectorLayer.vue'
// import ReportsAnalyticsDrawer from 'src/components/ReportsAnalyticsDrawer.vue'
import ReportsFeatureDetail from 'src/components/ReportsFeatureDetail.vue'
// import type { Map } from 'ol'
import type { DateRange } from 'src/types/date'
import type { ReportType } from 'src/types/reportType';

export default {
  components: {
    ReportLeftDrawer,
    ReportsMapLayer,
    // ReportsAnalyticsDrawer,
    ReportsFeatureDetail,
    SamplingEffortVectorLayer
  },
  props: {
    uuid: {
      type: String
    }
  },
  setup(props) {
    const route = useRoute()
    const router = useRouter()
    const { t, locale } = useI18n();

    const map = inject<Map>("map")

    const mosquitoLayers = ref<string[]>([])
    const breedingSitesLayers = ref<string[]>([])
    const biteLayer = ref(false)

    const numReportLayers = computed(() => {
      return mosquitoLayers.value.length + breedingSitesLayers.value.length + (biteLayer.value ? 1 : 0)
    })

    const samplingEffortLayer = ref(false)
    const tags = ref<string[]>([])
    const fromDate = ref()
    const toDate = ref()

    const visibleFeatures = ref([])
    const layerRef = ref()

    const selectedLocationPolygon = ref<Polygon | MultiPolygon | null>()
    const selectedLocationName = ref<string>()
    const selectedLocationIsPolygon = computed(() => selectedLocationPolygon.value instanceof Polygon);
    const selectedLocationIsMultiPolygon = computed(() => selectedLocationPolygon.value instanceof MultiPolygon);

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
        selectedLocationName.value = e.search.name;
        if (geometry instanceof Polygon || geometry instanceof MultiPolygon) {
          selectedLocationPolygon.value = geometry;
        } else {
          selectedLocationPolygon.value = null;
        }
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

    watch(selectedLocationPolygon, (newValue) => {
      if (!newValue) {
        map?.addControl(searchControl)
      } else {
        map?.removeControl(searchControl)
      }
    })

    onMounted(() => {
      map?.addControl(searchControl)
    })

    onUnmounted(() => {
      map?.removeControl(searchControl)
    })

    const selectedReportUuid = ref(props.uuid)
    const selectedReportType = ref<ReportType>()
    watch(selectedReportUuid, async (newValue) => {
      if (route.params.uuid === newValue) return

      await router.replace({
        name: route.name!,
        params: {
          ...route.params,
          ...(newValue ? { uuid: newValue } : {})
        }
      })
    })

    // function updateVisibleFeatures() {
    //   // Get the current extent of the map view
    //   const extent = map?.getView().calculateExtent(map?.getSize())

    //   visibleFeatures.value = layerRef.value.getFeaturesInExtent(extent)
    // }

    // onMounted(() => {
    //   map?.on('moveend', updateVisibleFeatures)
    // })

    // onUnmounted(() => {
    //   map?.un('moveend', updateVisibleFeatures)
    // })

    return {
      mosquitoLayers,
      breedingSitesLayers,
      biteLayer,
      numReportLayers,
      samplingEffortLayer,
      tags,
      fromDate,
      toDate,
      layerRef,
      visibleFeatures,
      selectedReportUuid,
      selectedReportType,
      selectedLocationPolygon,
      selectedLocationName,
      selectedLocationIsPolygon,
      selectedLocationIsMultiPolygon,
      colors,
      handleMosquitoesLayerUpdate(value: string[]) {
        mosquitoLayers.value = value
      },
      handleBreedingSitesLayerUpdate(value: string[]) {
        breedingSitesLayers.value = value
      },
      handleBitesLayerUpdate(value: boolean) {
        biteLayer.value = value
      },
      handleSamplingEffortLayerUpdate(value: boolean) {
        samplingEffortLayer.value = value
      },
      handleTagsUpdate(value: string[]) {
        tags.value = value
      },
      handleDateUpdate(value: DateRange) {
        fromDate.value = value.from
        toDate.value = value.to
      },
      handleSelectedFeatureUpdate(value: { id: string; type: ReportType } | undefined) {
        selectedReportUuid.value = value?.id
        selectedReportType.value = value?.type
      }
    }
  }
}

</script>

<style lang="scss">
.ol-search.searching:before {
  background: var(--q-primary);
}
</style>
