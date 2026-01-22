<template>

  <ol-webgl-vector-layer ref="layerRef" :visible="visible" :styles="style">
    <ol-source-vector :url="url" :format="geoJson" @addfeature="onAddFeature" />
  </ol-webgl-vector-layer>

</template>

<script setup lang="ts">

import { computed, ref, watch, onBeforeUnmount } from 'vue'
import type { VectorSourceEvent } from 'ol/source/Vector';
import type { Layer } from "ol/layer";

import GeoJSON from 'ol/format/GeoJSON'

// const layerRef = ref()
const layerRef = ref<{ webglVectorLayer: Layer }>();

const geoJson = new GeoJSON()

const props = withDefaults(defineProps<{
  url: string;
  color: string;
  visible: boolean;
  fromDate: Date | undefined;
  toDate: Date | undefined;
}>(), {
  visible: true
})

// There's a bug on visible change doing nothing in webgl: https://github.com/MelihAltintas/vue3-openlayers/issues/355
watch(() => props.visible, (newValue) => {
  layerRef.value!.webglVectorLayer.setVisible(newValue === true)
})

const styleVariables = computed(() => {
  return {
    'fromDate': props.fromDate?.getTime() || -Infinity,
    'toDate': props.toDate?.getTime() || Infinity
  }
})
watch(styleVariables, (newValue) => {
  Object.assign(layerRef.value!.webglVectorLayer.get('style').variables, newValue)
  layerRef.value!.webglVectorLayer.changed()
})
const style = {
  'variables': styleVariables.value,
  'filter': ['between', ['get', 'timestamp'], ['var', 'fromDate'], ['var', 'toDate']],
  "circle-fill-color": ['get', 'color'],
  'circle-radius': [
    'match',
    ['get', 'hover'],
    1,
    [
      'interpolate',
      ['exponential', 2],
      ['zoom'],
      5,
      4.85,
      12,
      5.7,
      16,
      8.5,
    ],
    [
      'interpolate',
      ['exponential', 2],
      ['zoom'],
      5,
      0.85,
      12,
      1.7,
      16,
      4.5,
    ]
  ],
  "circle-opacity": 0.5,
  "circle-stroke-width": ['match', ['get', 'hover'], 1, 2, 0],
  "circle-stroke-color": ['match', ['get', 'hover'], 1, '#000000', ['get', 'color']],
}

function onAddFeature(event: VectorSourceEvent) {
  const feature = event.feature
  if (!feature) return
  feature.set('hover', 0)
  feature.set('timestamp', new Date(feature.getProperties().received_at).getTime())
  feature.set('color', props.color)
}

onBeforeUnmount(() => {
  // See: https://github.com/openlayers/openlayers/blob/29c58d08fb8ddc22b4b7384b38851323359c5706/src/ol/layer/WebGLPoints.js#L58-L59
  // See: https://stackoverflow.com/questions/69295838/how-to-properly-release-webgl-resources-of-removed-layers-in-openlayers
  layerRef.value!.webglVectorLayer.dispose()
})


</script>
