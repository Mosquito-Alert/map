<template>
  <BaseReportVectorLayer ref="layerRef" :type="ReportType.BreedingSite" :fetchReports="fetchBreedingSites"
    :color="colors.getPaletteColor('breeding-site')" :visible="visible" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

import BaseReportVectorLayer from './BaseReportVectorLayer.vue'
import { breedingSitesApi } from 'src/boot/api';

import { colors } from 'quasar'

import type { BreedingSiteSiteType, BreedingSiteGeoModel } from 'mosquito-alert';
import { ReportType } from 'src/types/reportType';
import { useBoundaryStore } from 'src/stores/boundaryStore';

const boundaryStore = useBoundaryStore();

const props = withDefaults(defineProps<{
  visible: boolean
  siteTypes: BreedingSiteSiteType[]
  hasWater?: boolean
  fromDate: Date | undefined
  toDate: Date | undefined
  tags: string[] | undefined,
}>(), {
  hasWater: undefined,
})
const layerRef = ref<{ refresh: () => void }>();

watch(
  () => [props.siteTypes, props.hasWater, props.tags, props.fromDate, props.toDate, boundaryStore.getPolygon],
  () => {
    layerRef.value?.refresh();
  },
);

const fetchBreedingSites = async (): Promise<BreedingSiteGeoModel[]> => {
  const selectedBoundary = await boundaryStore.getTemporaryBoundary();

  const response = await breedingSitesApi.geoList({
    hasWater: props.hasWater,
    siteType: props.siteTypes,
    receivedAtAfter: props.fromDate?.toISOString() || undefined,
    receivedAtBefore: props.toDate?.toISOString() || undefined,
    tags: props.tags?.length ? props.tags : undefined,
    boundaryUuid: selectedBoundary ? selectedBoundary.uuid : undefined,
  });
  return response.data;
};
</script>
