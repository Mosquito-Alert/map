<template>

  <ol-webgl-vector-layer ref="layerRef" :visible="visible" :styles="style">
    <ol-source-vector ref="sourceRef" :loader="loader" @addfeature="onAddFeature" />
  </ol-webgl-vector-layer>

</template>

<script setup lang="ts">

import { computed, ref, watch, onBeforeUnmount } from 'vue'

import { Feature } from 'ol';
import type { Layer } from "ol/layer";
import type { VectorSourceEvent } from 'ol/source/Vector';
import { Point } from 'ol/geom';
import type { Projection } from 'ol/proj';
import { get as getProjection } from 'ol/proj';

import type { ReportType } from 'src/types/reportType';
import type VectorSource from 'ol/source/Vector';

const layerRef = ref<{ webglVectorLayer: Layer }>();
const sourceRef = ref<{ source: VectorSource }>();

export interface GeoReport {
  uuid: string;
  received_at: string;
  point: {
    latitude: number;
    longitude: number;
  }
}

const props = withDefaults(defineProps<{
  fetchReports?: () => Promise<GeoReport[]>;
  color: string;
  visible: boolean;
  type: ReportType
  fromDate: Date | undefined;
  toDate: Date | undefined;
}>(), {
  visible: true
})

const loader = async function (extend: number[], resolution: number, projection: Projection, success: (features: Feature[]) => void, failure: () => void) {
  const featureProjection = getProjection('EPSG:4326')!;

  try {
    const response = await props.fetchReports!();
    const features = response.map((report) => {
      const feature = new Feature();
      const point = new Point([report.point.longitude, report.point.latitude]);
      point.transform(featureProjection, projection);
      feature.setGeometry(point)
      feature.setId(report.uuid);
      feature.setProperties({
        received_at: report.received_at,
      });
      return feature;
    })

    sourceRef.value?.source.addFeatures(features);
    success(features);
  } catch (error) {
    console.error('Failed to fetch geo reports:', error);
    failure();
  }
};

const refresh = function () {
  sourceRef.value?.source.refresh();
}

defineExpose({
  refresh
});

// There's a bug on visible change doing nothing in webgl: https://github.com/MelihAltintas/vue3-openlayers/issues/355
watch(() => props.visible, (newValue) => {
  if (!layerRef.value) return
  layerRef.value.webglVectorLayer.setVisible(newValue === true)
})

const styleVariables = computed(() => {
  return {
    'fromDate': props.fromDate?.getTime() || -Infinity,
    'toDate': props.toDate?.getTime() || Infinity
  }
})
watch(styleVariables, (newValue) => {
  if (!layerRef.value) return
  Object.assign(layerRef.value.webglVectorLayer.get('style').variables, newValue)
  layerRef.value.webglVectorLayer.changed()
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
  feature.set('type', props.type)
}

onBeforeUnmount(() => {
  // See: https://github.com/openlayers/openlayers/blob/29c58d08fb8ddc22b4b7384b38851323359c5706/src/ol/layer/WebGLPoints.js#L58-L59
  // See: https://stackoverflow.com/questions/69295838/how-to-properly-release-webgl-resources-of-removed-layers-in-openlayers
  layerRef.value!.webglVectorLayer.dispose()
})


</script>
