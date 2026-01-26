<template>
  <BaseReportVectorLayer type="bite" :url="computedUrl" :color="colors.getPaletteColor('bites')" :visible="visible"
    :fromDate="fromDate" :toDate="toDate" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { colors } from 'quasar'
import BaseReportVectorLayer from './BaseReportVectorLayer.vue'


const props = defineProps<{
  visible: boolean,
  fromDate: Date | undefined,
  toDate: Date | undefined
  tags: string[] | undefined
}>()

const computedUrl = computed(() => {
  const params = new URLSearchParams()

  if (props.fromDate) {
    params.append('received_at_after', props.fromDate.toISOString())
  }
  if (props.toDate) {
    params.append('received_at_before', props.toDate.toISOString())
  }

  if (props.tags && props.tags.length > 0) {
    props.tags.forEach(tag => params.append('tags', tag))
  }
  return `/api/bites/geo/?format=geojson&${params.toString()}`
})
</script>
