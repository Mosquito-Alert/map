<template>
  <ol-vector-layer ref="layerRef" :visible="visible">
    <ol-source-vector :url="computedUrl" :format="geoJson">
      <ol-style :overrideStyleFunction="featureStyle"></ol-style>
    </ol-source-vector>
  </ol-vector-layer>
</template>


<script setup lang="ts">

import type { Feature } from 'ol';
import GeoJSON from 'ol/format/GeoJSON'
import { Fill, Stroke, Style } from 'ol/style';
import { computed } from 'vue';

const props = defineProps<{
  visible: boolean,
  fromDate: Date | undefined,
  toDate: Date | undefined,
}>()

const geoJson = new GeoJSON();

const computedUrl = computed(() => {
  const wfsUrl = new URL('https://mapserver.mosquitoalert.com/geoserver/wfs')

  const viewParams = {
    fromDate: props.fromDate ? props.fromDate.toISOString().split('T')[0] : undefined,
    toDate: props.toDate ? props.toDate.toISOString().split('T')[0] : undefined,
  }

  const params = new URLSearchParams({
    service: 'wfs',
    version: '2.0.0',
    request: 'GetFeature',
    typeNames: 'mosquitoalert:sampling_effort',
    outputFormat: 'application/json',
    viewparams: Object.entries(viewParams).filter(([, value]) => value !== undefined).map(([key, value]) => `${key}:${value}`).join(';'),
  })

  wfsUrl.search = params.toString()

  return wfsUrl.toString()
})

const featureStyle = (feature: Feature) => {
  const count = feature.get('count') || 0
  let fillColor = 'rgba(255, 255, 178, 0.4)'

  if (count > 1000) {
    fillColor = 'rgba(189, 0, 38, 0.4)'
  } else if (count > 100) {
    fillColor = 'rgba(240, 59, 32, 0.4)'
  } else if (count > 10) {
    fillColor = 'rgba(253, 141, 60, 0.4)'
  }

  return new Style({
    fill: new Fill({
      color: fillColor,
    }),
    stroke: new Stroke({
      color: 'rgba(30, 30, 30, 0.4)',
      width: 0.1,
    }),
  })
}

</script>
