<template>
  <ol-tile-layer :visible="visible">
    <ol-source-tile-wms ref="sourceRef" :url="mapserver.getUri({ url: 'wms' })" layers="mosquitoalert:sampling_effort"
      serverType="geoserver" />
  </ol-tile-layer>
</template>


<script setup lang="ts">

import { ref, computed, watch } from 'vue';

import { mapserver } from 'boot/axios'

const sourceRef = ref()

const props = defineProps<{
  visible: boolean,
  fromDate: Date | undefined,
  toDate: Date | undefined,
}>()

const viewParams = computed(() => {
  return {
    fromDate: props.fromDate ? props.fromDate.toISOString().split('T')[0] : undefined,
    toDate: props.toDate ? props.toDate.toISOString().split('T')[0] : undefined,
  }
})

watch(() => [props.fromDate, props.toDate], () => {
  if (sourceRef.value === undefined) {
    return
  }
  sourceRef.value.source.updateParams({
    'viewparams': Object.entries(viewParams.value).filter(([, value]) => value !== undefined).map(([key, value]) => `${key}:${value}`).join(';'),
  })
}, { immediate: true })

</script>
