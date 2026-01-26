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
  return `/api/breeding-sites/geo/?format=geojson&site_type=${props.siteType}` + (props.hasWater !== undefined ? `&has_water=${props.hasWater}` : '')
})
</script>
