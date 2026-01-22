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
    @update:selectedFeatureId="handleSelectedFeatureIdUpdate" />
  <SamplingEffortVectorLayer :visible="samplingEffortLayer" :from-date="fromDate" :to-date="toDate" />
  <!-- <ReportsAnalyticsDrawer v-if="!featureId" :visible="numReportLayers !== 0" :features="visibleFeatures" /> -->
  <!-- <ReportsFeatureDetail :feature-id="featureId" :key="featureId" @update:featureId="handleSelectedFeatureIdUpdate" /> -->

  <ol-search-control :collapsed="false" :maxHistory="10" />
</template>

<script lang="ts">

import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import ReportLeftDrawer from 'src/components/ReportsLeftDrawer.vue'
import ReportsMapLayer from 'src/components/ReportsMapLayer.vue'
import SamplingEffortVectorLayer from 'src/components/SamplingEffortVectorLayer.vue'
// import ReportsAnalyticsDrawer from 'src/components/ReportsAnalyticsDrawer.vue'
// import ReportsFeatureDetail from 'src/components/ReportsFeatureDetail.vue'
// import type { Map } from 'ol'
import type { DateRange } from 'src/types/date'

export default {
  components: {
    ReportLeftDrawer,
    ReportsMapLayer,
    // ReportsAnalyticsDrawer,
    // ReportsFeatureDetail,
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
    // const map = inject<Map>("map")

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

    const featureId = ref(props.uuid)
    watch(featureId, async (newValue) => {
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
      featureId,
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
      handleSelectedFeatureIdUpdate(value: string | undefined) {
        featureId.value = value
      }
    }
  }
}

</script>
