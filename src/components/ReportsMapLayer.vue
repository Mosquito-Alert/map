<template>
  <!-- Creating a layer to make it easier to detect the layers that are hoverable/selectable -->
  <ol-layer-group ref="layerGroupRef">
    <!-- Mosquito Layers -->
    <ObservationMapLayer :visible="albopictus" :taxon_ids="[112]" :color="colors.getPaletteColor('albopictus')"
      :from-date="fromDate" :to-date="toDate" :tags="tags" />
    <ObservationMapLayer :visible="aegypti" :taxon_ids="[113]" :color="colors.getPaletteColor('aegypti')"
      :from-date="fromDate" :to-date="toDate" :tags="tags" />
    <ObservationMapLayer :visible="japonicus" :taxon_ids="[114]" :color="colors.getPaletteColor('japonicus')"
      :from-date="fromDate" :to-date="toDate" :tags="tags" />
    <ObservationMapLayer :visible="koreicus" :taxon_ids="[115]" :color="colors.getPaletteColor('koreicus')"
      :from-date="fromDate" :to-date="toDate" :tags="tags" />
    <ObservationMapLayer :visible="culex" :taxon_ids="[10]" :color="colors.getPaletteColor('culex')"
      :from-date="fromDate" :to-date="toDate" :tags="tags" />
    <ObservationMapLayer :visible="unidentifiedMosquito" :taxon_ids="null"
      :color="colors.getPaletteColor('unidentified-mosquito')" :from-date="fromDate" :to-date="toDate" :tags="tags" />

    <ObservationMapLayer :visible="otherSpecies" :taxon_ids="[112, 113, 114, 115, 10, null]" negate
      :color="colors.getPaletteColor('other-species')" :from-date="fromDate" :to-date="toDate" :tags="tags" />

    <!-- Breeding sites Layers -->
    <BreedingSiteMapLayer :visible="stormDrainWater" :siteTypes="[BreedingSiteSiteType.StormDrain]" :hasWater="true"
      :from-date="fromDate" :to-date="toDate" :tags="tags" />
    <BreedingSiteMapLayer :visible="stormDrainDry" :siteTypes="[BreedingSiteSiteType.StormDrain]" :hasWater="false"
      :from-date="fromDate" :to-date="toDate" :tags="tags" />
    <BreedingSiteMapLayer :visible="otherSite"
      :siteTypes="[BreedingSiteSiteType.Other, BreedingSiteSiteType.Basin, BreedingSiteSiteType.Bucket, BreedingSiteSiteType.Fountain, BreedingSiteSiteType.SmallContainer, BreedingSiteSiteType.Well]"
      :from-date="fromDate" :to-date="toDate" :tags="tags" />
    <!-- Bite Layer -->
    <BiteMapLayer :visible="bites" :from-date="fromDate" :to-date="toDate" :tags="tags" />
  </ol-layer-group>

  <ol-interaction-select @select="featureHovered" :condition="hoverCondition" :filter="selectInteractionFilter" />
  <ol-interaction-select @select="featureClicked" :condition="clickCondition" :filter="selectInteractionFilter" />
</template>

<script setup lang="ts">
import { colors } from 'quasar'
import { ref, inject } from 'vue';

import type { Feature } from 'ol';
import type { SelectEvent } from 'ol/interaction/Select';
import type LayerGroup from 'ol/layer/Group';

import ObservationMapLayer from './ObservationMapLayer.vue';
import BiteMapLayer from './BiteMapLayer.vue';
import BreedingSiteMapLayer from './BreedingSiteMapLayer.vue';

import { BreedingSiteSiteType } from 'mosquito-alert';
import type { Layer } from 'ol/layer';
import type { ReportType } from 'src/types/reportType';

const emit = defineEmits<{
  (e: 'update:selectedFeature', payload: { id: string; type: ReportType } | undefined): void;
}>()

withDefaults(defineProps<{
  albopictus?: boolean,
  aegypti?: boolean,
  japonicus?: boolean,
  koreicus?: boolean,
  culex?: boolean,
  unidentifiedMosquito?: boolean,
  otherSpecies?: boolean,
  bites?: boolean
  stormDrainWater?: boolean,
  stormDrainDry?: boolean,
  otherSite?: boolean,
  samplingEffort?: boolean,
  tags?: string[],
  fromDate?: Date,
  toDate?: Date
}>(), {
  albopictus: false,
  aegypti: false,
  japonicus: false,
  koreicus: false,
  culex: false,
  unidentifiedMosquito: false,
  bites: false,
  stormDrainWater: false,
  stormDrainDry: false,
  otherSite: false,
  samplingEffort: false
})

const layerGroupRef = ref<{ layerGroup: LayerGroup }>();

const selectConditions = inject("ol-selectconditions");
const hoverCondition = selectConditions.pointerMove;
const clickCondition = selectConditions.click
function selectInteractionFilter(feature: Feature, layer: Layer) {
  return layerGroupRef.value?.layerGroup.getLayersArray().includes(layer);
}

function featureHovered(event: SelectEvent) {
  event.selected.forEach(feature => {
    feature.set('hover', 1)
  })
  event.deselected.forEach(feature => {
    feature.set('hover', 0)
  })

}

function featureClicked(event: SelectEvent) {
  const selectedFeatureId = event.selected?.[0]?.getId();
  if (!selectedFeatureId) {
    emit('update:selectedFeature', undefined);
    return;
  }
  emit('update:selectedFeature', {
    id: selectedFeatureId as string,
    type: event.selected?.[0]?.get('type') as ReportType
  });
}

</script>
