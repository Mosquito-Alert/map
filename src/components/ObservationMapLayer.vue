<template>
  <BaseReportVectorLayer type="observation" :url="computedUrl" :color="color" :visible="visible" :fromDate="fromDate"
    :toDate="toDate" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseReportVectorLayer from './BaseReportVectorLayer.vue'

const props = defineProps<{
  taxon_id: string | null,
  color: string,
  visible: boolean,
  fromDate: Date | undefined,
  toDate: Date | undefined,
  tags: string[] | undefined
}>()

const computedUrl = computed(() => {
  return `/api/observations/geo/?format=geojson&identification_taxon_ids=${props.taxon_id ?? 'null'}`
})
</script>
