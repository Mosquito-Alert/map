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

  <ObservationDetailDrawer v-if="report && props.reportType === ReportType.Observation"
    :observation="report as Observation" @close="emit('close')" />
  <BreedingSiteDetailDrawer v-else-if="report && props.reportType === ReportType.BreedingSite"
    :breedingSite="report as BreedingSite" @close="emit('close')" />
  <BiteDetailDrawer v-else-if="report && props.reportType === ReportType.Bite" :bite="report as Bite"
    @close="emit('close')" />
</template>

<script setup lang="ts">

import { colors } from 'quasar'
import { inject, ref, watch, computed } from 'vue'

import { fromLonLat } from 'ol/proj'
import type { Map } from 'ol'

import type { Bite, BreedingSite, Observation } from 'mosquito-alert';

import { observationsApi, bitesApi, breedingSitesApi } from 'src/boot/api';
import ObservationDetailDrawer from './ObservationDetailDrawer.vue';
import BiteDetailDrawer from './BiteDetailDrawer.vue';
import BreedingSiteDetailDrawer from './BreedingSiteDetailDrawer.vue';
import { ReportType } from 'src/types/reportType';

const emit = defineEmits<{
  (event: 'close'): void;
}>();

const props = defineProps<{
  reportUuid: string,
  reportType: ReportType
}>()

const map = inject<Map>('map')

const report = ref<Observation | Bite | BreedingSite | null>(null)

watch(() => [props.reportUuid, props.reportType], async ([newUuid, newType]) => {
  if (newUuid !== undefined) {
    switch (newType) {
      case ReportType.Observation:
        await observationsApi.retrieve({ uuid: newUuid }).then((response) => report.value = response.data)
        break
      case ReportType.BreedingSite:
        await breedingSitesApi.retrieve({ uuid: newUuid }).then((response) => report.value = response.data)
        break
      case ReportType.Bite:
        await bitesApi.retrieve({ uuid: newUuid }).then((response) => report.value = response.data)
        break
    }
  }
}, { immediate: true })

const coordinates = computed(() => {
  const view = map?.getView();
  if (!report.value || !view) {
    return null;
  }

  return fromLonLat(
    [report.value.location.point.longitude, report.value.location.point.latitude],
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
})
</script>
