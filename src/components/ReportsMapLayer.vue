<template>
  <!-- Creating a layer to make it easier to detect the layers that are hoverable/selectable -->
  <ol-layer-group ref="layerGroupRef">
    <!-- Mosquito Layers -->
    <ObservationMapLayer :visible="albopictus" :taxon_ids="mosquitoTaxonIds.albopictus"
      :color="colors.getPaletteColor('albopictus')" :from-date="fromDate" :to-date="toDate" :tags="tags" />
    <ObservationMapLayer :visible="aegypti" :taxon_ids="mosquitoTaxonIds.aegypti"
      :color="colors.getPaletteColor('aegypti')" :from-date="fromDate" :to-date="toDate" :tags="tags" />
    <ObservationMapLayer :visible="japonicus" :taxon_ids="mosquitoTaxonIds.japonicus"
      :color="colors.getPaletteColor('japonicus')" :from-date="fromDate" :to-date="toDate" :tags="tags" />
    <ObservationMapLayer :visible="koreicus" :taxon_ids="mosquitoTaxonIds.koreicus"
      :color="colors.getPaletteColor('koreicus')" :from-date="fromDate" :to-date="toDate" :tags="tags" />
    <ObservationMapLayer :visible="culex" :taxon_ids="mosquitoTaxonIds.culex" :color="colors.getPaletteColor('culex')"
      :from-date="fromDate" :to-date="toDate" :tags="tags" />
    <ObservationMapLayer :visible="unidentifiedMosquito" :taxon_ids="mosquitoTaxonIds.undefined"
      :color="colors.getPaletteColor('unidentified-mosquito')" :from-date="fromDate" :to-date="toDate" :tags="tags" />

    <ObservationMapLayer :visible="otherSpecies" :taxon_ids="mosquitoTaxonIds.otherSpecies" negate
      :color="colors.getPaletteColor('other-species')" :from-date="fromDate" :to-date="toDate" :tags="tags" />

    <!-- Breeding sites Layers -->
    <BreedingSiteMapLayer :visible="stormDrainWater" :siteTypes="breedingSiteTypes.stormDrain" :hasWater="true"
      :from-date="fromDate" :to-date="toDate" :tags="tags" />
    <BreedingSiteMapLayer :visible="stormDrainDry" :siteTypes="breedingSiteTypes.stormDrain" :hasWater="false"
      :from-date="fromDate" :to-date="toDate" :tags="tags" />
    <BreedingSiteMapLayer :visible="otherSite" :siteTypes="breedingSiteTypes.other" :from-date="fromDate"
      :to-date="toDate" :tags="tags" />
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

// NOTE: this is important since there's a watch in ObservationMapLayer that
// listens to taxon_ids changes to refresh the layer. Needs a shallowRef in order
// not to detect fake changes. [112] !== [112]
const mosquitoTaxonIds = {
  albopictus: [112],
  aegypti: [113],
  japonicus: [114],
  koreicus: [115],
  culex: [10],
  undefined: [null],
  otherSpecies: [112, 113, 114, 115, 10, null] // This will be negated
}

const breedingSiteTypes = {
  stormDrain: [BreedingSiteSiteType.StormDrain],
  other: [BreedingSiteSiteType.Other, BreedingSiteSiteType.Basin, BreedingSiteSiteType.Bucket, BreedingSiteSiteType.Fountain, BreedingSiteSiteType.SmallContainer, BreedingSiteSiteType.Well]
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
