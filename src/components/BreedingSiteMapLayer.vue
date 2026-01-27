<template>
  <BaseReportVectorLayer type="breeding_site" :url="computedUrl" :color="colors.getPaletteColor('breeding-site')"
    :visible="visible" :fromDate="fromDate" :toDate="toDate" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseReportVectorLayer from './BaseReportVectorLayer.vue'

import { colors } from 'quasar'

import type { BreedingSiteSiteType } from 'mosquito-alert';

const props = defineProps<{
  visible: boolean,
  siteType: BreedingSiteSiteType,
  hasWater?: boolean,
  fromDate: Date | undefined,
  toDate: Date | undefined,
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
    params.append('tags', props.tags.join(','))
  }

  params.append('site_type', props.siteType)
  if (props.hasWater !== undefined) {
    params.append('has_water', String(props.hasWater))
  }

  return `/api/breeding-sites/geo/?format=geojson&${params.toString()}`
})
</script>
