<template>
  <!-- Creating a layer to make it easier to detect the layers that are hoverable/selectable -->
  <ol-layer-group ref="layerGroupRef">
    <!-- Mosquito Layers -->
    <ObservationMapLayer
      :visible="albopictus"
      :taxon_ids="mosquitoTaxonIds.albopictus"
      :color="colors.getPaletteColor('albopictus')"
      :from-date="fromDate"
      :to-date="toDate"
      :tags="tags"
    />
    <ObservationMapLayer
      :visible="aegypti"
      :taxon_ids="mosquitoTaxonIds.aegypti"
      :color="colors.getPaletteColor('aegypti')"
      :from-date="fromDate"
      :to-date="toDate"
      :tags="tags"
    />
    <ObservationMapLayer
      :visible="japonicus"
      :taxon_ids="mosquitoTaxonIds.japonicus"
      :color="colors.getPaletteColor('japonicus')"
      :from-date="fromDate"
      :to-date="toDate"
      :tags="tags"
    />
    <ObservationMapLayer
      :visible="koreicus"
      :taxon_ids="mosquitoTaxonIds.koreicus"
      :color="colors.getPaletteColor('koreicus')"
      :from-date="fromDate"
      :to-date="toDate"
      :tags="tags"
    />
    <ObservationMapLayer
      :visible="culex"
      :taxon_ids="mosquitoTaxonIds.culex"
      :color="colors.getPaletteColor('culex')"
      :from-date="fromDate"
      :to-date="toDate"
      :tags="tags"
    />
    <ObservationMapLayer
      :visible="unidentifiedMosquito"
      :taxon_ids="mosquitoTaxonIds.unidentified"
      :color="colors.getPaletteColor('unidentified-mosquito')"
      :from-date="fromDate"
      :to-date="toDate"
      :tags="tags"
    />

    <ObservationMapLayer
      :visible="otherSpecies"
      :taxon_ids="mosquitoTaxonIds.other"
      negate
      :color="colors.getPaletteColor('other-species')"
      :from-date="fromDate"
      :to-date="toDate"
      :tags="tags"
    />
    <!-- Breeding sites Layers -->
    <BreedingSiteMapLayer
      :visible="stormDrainWater"
      :siteTypes="breedingSiteTypes.stormDrain"
      :hasWater="true"
      :from-date="fromDate"
      :to-date="toDate"
      :tags="tags"
    />
    <BreedingSiteMapLayer
      :visible="stormDrainDry"
      :siteTypes="breedingSiteTypes.stormDrain"
      :hasWater="false"
      :from-date="fromDate"
      :to-date="toDate"
      :tags="tags"
    />
    <BreedingSiteMapLayer
      :visible="otherSite"
      :siteTypes="breedingSiteTypes.other"
      :from-date="fromDate"
      :to-date="toDate"
      :tags="tags"
    />
    <!-- Bite Layer -->
    <BiteMapLayer :visible="bites" :from-date="fromDate" :to-date="toDate" :tags="tags" />
  </ol-layer-group>

  <ol-interaction-select
    @select="handleFeatureHovered"
    :condition="hoverCondition"
    :filter="selectInteractionFilter"
    :hitTolerance="50"
  />
  <ol-interaction-select
    @select="handleFeatureClicked"
    :condition="clickCondition"
    :filter="selectInteractionFilter"
    :hitTolerance="50"
  />
</template>

<script setup lang="ts">
import { colors } from 'quasar';
import { ref, inject } from 'vue';

import type { Feature } from 'ol';
import type Map from 'ol/Map';
import type { SelectEvent } from 'ol/interaction/Select';
import type LayerGroup from 'ol/layer/Group';

import { ObservationMapLayer } from 'src/components/observations';
import { BiteMapLayer } from 'src/components/bites';
import { BreedingSiteMapLayer } from 'src/components/breedingSites';

import { useReportMapStore } from 'src/stores/reportMapStore';

import type { Layer } from 'ol/layer';
import type { ReportType } from 'src/types/reportType';
import { mosquitoTaxonIds, breedingSiteTypes } from 'src/utils/constants';
import type VectorSource from 'ol/source/Vector';
import type { Extent } from 'ol/extent';
import type { ReportAnalyticsStats } from 'src/components/reports/analytics/types';
import { createEmptyReportAnalyticsStats } from 'src/components/reports/analytics/utils';

const reportMapStore = useReportMapStore();

withDefaults(
  defineProps<{
    albopictus?: boolean;
    aegypti?: boolean;
    japonicus?: boolean;
    koreicus?: boolean;
    culex?: boolean;
    unidentifiedMosquito?: boolean;
    otherSpecies?: boolean;
    bites?: boolean;
    stormDrainWater?: boolean;
    stormDrainDry?: boolean;
    otherSite?: boolean;
    samplingEffort?: boolean;
    tags?: string[];
    fromDate?: Date;
    toDate?: Date;
  }>(),
  {
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
    samplingEffort: false,
  },
);

const layerGroupRef = ref<{ layerGroup: LayerGroup }>();
const map = inject<Map>('map');

const selectConditions = inject('ol-selectconditions');
const hoverCondition = selectConditions.pointerMove;
const clickCondition = selectConditions.click;
function selectInteractionFilter(feature: Feature, layer: Layer) {
  return layerGroupRef.value?.layerGroup.getLayersArray().includes(layer);
}

function handleFeatureHovered(event: SelectEvent) {
  event.selected.forEach((feature) => {
    feature.set('hover', 1);
  });
  event.deselected.forEach((feature) => {
    feature.set('hover', 0);
  });

  if (!map) return;
  const element = map.getTargetElement();
  element.style.cursor = event.selected.length ? 'pointer' : '';
}

async function handleFeatureClicked(event: SelectEvent) {
  const selectedFeature = event.selected?.[0] as Feature | null;
  if (!selectedFeature) {
    reportMapStore.selectedReport = null;
    return;
  }
  await reportMapStore.setSelectedReport({
    uuid: selectedFeature.getId() as string,
    type: selectedFeature.get('type') as ReportType,
  });
}

function getFeaturesInExtent(extent: Extent): Feature[] {
  // See: https://github.com/openlayers/openlayers/pull/14712
  const features: Feature[] = [];
  layerGroupRef.value?.layerGroup.getLayersArray().forEach((layer) => {
    if (!layer.getVisible()) return;
    const source = layer.getSource() as VectorSource;
    source.forEachFeatureInExtent(extent, (feature) => {
      features.push(feature);
    });
  });

  return features;
}

function getAnalyticsStatsInExtent(extent: Extent): ReportAnalyticsStats {
  const stats = createEmptyReportAnalyticsStats();
  const now = new Date();
  const minRecentDate = new Date(now);
  minRecentDate.setMonth(minRecentDate.getMonth() - 2);
  const maxRecentFeatures = 50;

  layerGroupRef.value?.layerGroup.getLayersArray().forEach((layer) => {
    if (!layer.getVisible()) return;
    const source = layer.getSource() as VectorSource;
    source.forEachFeatureInExtent(extent, (feature) => {
      stats.total += 1;

      const color = feature.get('color') as string | undefined;
      if (color) {
        stats.colorCounts[color] = (stats.colorCounts[color] ?? 0) + 1;
      }

      const histogramKey = feature.get('histogram_key') as string | undefined;
      if (histogramKey) {
        stats.histogramCounts[histogramKey] = (stats.histogramCounts[histogramKey] ?? 0) + 1;
      }

      const receivedAt = feature.get('received_at') as Date | undefined;
      if (!receivedAt || receivedAt < minRecentDate || receivedAt > now) return;

      if (stats.recentFeatures.length < maxRecentFeatures) {
        stats.recentFeatures.push(feature);
        return;
      }

      let oldestIndex = 0;
      let oldestDate = stats.recentFeatures[0]!.get('received_at') as Date;
      for (let index = 1; index < stats.recentFeatures.length; index += 1) {
        const currentDate = stats.recentFeatures[index]!.get('received_at') as Date;
        if (currentDate < oldestDate) {
          oldestIndex = index;
          oldestDate = currentDate;
        }
      }

      if (receivedAt > oldestDate) {
        stats.recentFeatures[oldestIndex] = feature;
      }
    });
  });

  stats.recentFeatures.sort((a, b) => {
    return (b.get('received_at') as Date).getTime() - (a.get('received_at') as Date).getTime();
  });

  return stats;
}

defineExpose({
  getFeaturesInExtent,
  getAnalyticsStatsInExtent,
});
</script>
