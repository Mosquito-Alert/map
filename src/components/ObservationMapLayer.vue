<template>
  <BaseReportVectorLayer type="observation" :url="computedUrl" :color="color" :visible="visible" :fromDate="fromDate"
    :toDate="toDate" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseReportVectorLayer from './BaseReportVectorLayer.vue'

const props = withDefaults(defineProps<{
  taxon_ids: (number | null)[] | null,
  negate?: boolean,
  color: string,
  visible: boolean,
  fromDate: Date | undefined,
  toDate: Date | undefined,
  tags: string[] | undefined
}>(), {
  negate: false,
})

const computedUrl = computed(() => {
  const params = new URLSearchParams()

  if (props.fromDate) {
    params.append('received_at_after', props.fromDate.toISOString())
  }
  if (props.toDate) {
    params.append('received_at_before', props.toDate.toISOString())
  }

  if (props.tags && props.tags.length > 0) {
    params.append('tags', props.tags.join(','))
  }

  if (props.taxon_ids) {
    props.taxon_ids.forEach(id => {
      params.append('identification_taxon_ids', String(id));
    });
  } else {
    params.append('identification_taxon_ids', 'null')
  }

  if (props.negate) {
    params.append('negate_identification_taxon_ids', 'true')
  }

  return `/api/observations/geo/?format=geojson&${params.toString()}`
})
</script>
