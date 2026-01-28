<template>
  <BaseReportVectorLayer ref="layerRef" type="bite" :fetchReports="fetchBites" :color="colors.getPaletteColor('bites')"
    :visible="visible" :fromDate="fromDate" :toDate="toDate" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { colors } from 'quasar'
import BaseReportVectorLayer from './BaseReportVectorLayer.vue'
import { bitesApi } from 'src/boot/api';
import type { BiteGeoModel } from 'mosquito-alert';

const props = defineProps<{
  visible: boolean,
  fromDate: Date | undefined,
  toDate: Date | undefined
  tags: string[] | undefined
}>()

const layerRef = ref<{ refresh: () => void }>();

watch(
  () => [props.tags, props.fromDate, props.toDate],
  () => {
    layerRef.value?.refresh();
  },
  { deep: true }
);
const fetchBites = async (): Promise<BiteGeoModel[]> => {
  const response = await bitesApi.geoList({
    receivedAtAfter: props.fromDate?.toISOString() || undefined,
    receivedAtBefore: props.toDate?.toISOString() || undefined,
    tags: props.tags?.length ? props.tags : undefined,
  });
  return response.data;
};
</script>
