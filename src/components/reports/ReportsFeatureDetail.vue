<template>
  <ol-vector-layer v-if="coordinates" z-index="100">
    <ol-source-vector>
      <ol-feature>
        <ol-geom-point :coordinates="coordinates"></ol-geom-point>
        <ol-style>
          <ol-style-text font="900 40px FontAwesome" textBaseline='bottom' :text="String.fromCodePoint(0xF3C5)"
            :fill="colors.getPaletteColor('primary')" />
        </ol-style>
      </ol-feature>
    </ol-source-vector>
  </ol-vector-layer>

  <ObservationDetailDrawer v-if="report && report.type === ReportType.Observation" :observation="report"
    @close="emit('close')" />
  <BreedingSiteDetailDrawer v-else-if="report && report.type === ReportType.BreedingSite" :breedingSite="report"
    @close="emit('close')" />
  <BiteDetailDrawer v-else-if="report && report.type === ReportType.Bite" :bite="report" @close="emit('close')" />
</template>

<script setup lang="ts">

import { colors } from 'quasar'
import { inject, watch, computed } from 'vue'

import { fromLonLat } from 'ol/proj'
import type { Map } from 'ol'

import { ObservationDetailDrawer } from 'src/components/observations';
import { BiteDetailDrawer } from 'src/components/bites';
import { BreedingSiteDetailDrawer } from 'src/components/breedingSites';
import { ReportType, type Report } from 'src/types/reportType';

const emit = defineEmits<{
  (event: 'close'): void;
}>();

const props = defineProps<{
  report: Report,
}>()

const map = inject<Map>('map')

const coordinates = computed(() => {
  const view = map?.getView();
  if (!props.report || !view) {
    return null;
  }

  return fromLonLat(
    [props.report.location.point.longitude, props.report.location.point.latitude],
    view.getProjection()
  );
});
watch(coordinates, (newValue) => {
  if (newValue === null) {
    return
  }

  map?.getView().animate({
    center: newValue,
    zoom: 15
  })
}, { immediate: true })
</script>
