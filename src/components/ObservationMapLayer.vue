<template>
  <BaseReportVectorLayer ref="layerRef" :type="ReportType.Observation" :fetchReports="fetchObservations" :color="color"
    :visible="visible" />
</template>

<script setup lang="ts">
import BaseReportVectorLayer from './BaseReportVectorLayer.vue'
import { ReportType } from 'src/types/reportType';
import { observationsApi } from 'src/boot/api';
import type { ObservationGeoModel } from 'mosquito-alert';
import { ref, watch } from 'vue';

const props = withDefaults(defineProps<{
  taxon_ids: (number | null)[],
  negate?: boolean,
  color: string,
  visible: boolean,
  fromDate: Date | undefined,
  toDate: Date | undefined,
  tags: string[] | undefined
}>(), {
  negate: false,
})

const layerRef = ref<{ refresh: () => void }>();

watch(
  () => [props.taxon_ids, props.tags, props.fromDate, props.toDate],
  () => {
    layerRef.value?.refresh();
  },
  { deep: true }
);

const fetchObservations = async (): Promise<ObservationGeoModel[]> => {
  const response = await observationsApi.geoList({
    identificationTaxonIds: props.taxon_ids?.map(String) || undefined,
    negateIdentificationTaxonIds: props.negate || undefined,
    receivedAtAfter: props.fromDate?.toISOString() || undefined,
    receivedAtBefore: props.toDate?.toISOString() || undefined,
    tags: props.tags?.length ? props.tags : undefined,
  });

  return response.data;
}
</script>
