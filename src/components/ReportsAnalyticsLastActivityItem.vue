<template>
  <q-item v-if="feature" clickable v-ripple @mouseenter="hover = true" @mouseleave="hover = false"
    @click="reportMapStore.selectedReport = report">
    <q-item-section avatar>
      <q-avatar v-if="report" rounded color="grey-3">
        <span v-if="isBite">{{ (report as Bite).counts.total }}</span>
        <q-img v-else :src="photoUrl" />
      </q-avatar>
      <q-skeleton v-else square type="QAvatar" />
    </q-item-section>

    <q-item-section>
      <q-item-label>
        <span v-if="report" class="q-pr-xs">{{ title }}</span>
        <q-skeleton v-else type="text" width="65%" />
      </q-item-label>
      <q-item-label v-if="report?.location?.display_name !== null" caption lines="2">
        <div class="row items-center no-wrap">
          <q-icon class="q-pr-xs" name="fa fa-light fa-location-pin" />
          <span class="col-auto" v-if="report">{{ report?.location.display_name?.split(',')[0] }}</span>
          <q-skeleton v-else type="text" width="45%" />
        </div>
      </q-item-label>
    </q-item-section>
    <q-item-section side top>
      <q-item-label v-if="report" caption>{{ toRelativeTime(new Date(report.received_at), {
        style: 'narrow'
      }) }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">

import { onMounted, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n';

import toRelativeTime from 'src/utils/dateUtils'
import { watch } from 'vue'
import type { Feature } from 'ol';
import type { Bite, BreedingSite, Observation } from 'mosquito-alert';
import { bitesApi, breedingSitesApi, observationsApi } from 'src/boot/api';
import { type Report, ReportType } from 'src/types/reportType';
import { useReportMapStore } from 'src/stores/reportMapStore';

const { t } = useI18n();
const reportMapStore = useReportMapStore();

const props = defineProps<{
  feature: Feature
}>()

const report = ref<Report | null>(null);

const hover = ref(false)

watch(hover, (newValue) => {
  props.feature.set('hover', Number(newValue))
})

const photoUrl = computed(() => {
  if (props.feature.get('type') === ReportType.Observation) {
    const observation = report.value as Observation
    return observation.photos.length > 0 ?
      observation.photos[0]!.url : ''
  } else if (props.feature.get('type') === ReportType.BreedingSite) {
    const breedingSite = report.value as BreedingSite
    return breedingSite.photos.length > 0 ?
      breedingSite.photos[0]!.url : ''
  }
  return undefined
})

const title = computed(() => {
  if (!report.value) return ''

  switch (props.feature.get('type')) {
    case ReportType.Bite: {
      const bite = report.value as Bite
      return bite.counts.total + " " + t('bites')
    }
    case ReportType.BreedingSite: {
      const breedingSite = report.value as BreedingSite
      return t(breedingSite.site_type)
    }
    case ReportType.Observation: {
      const observation = report.value as Observation
      const hasTaxon = observation.identification?.result?.taxon !== undefined
      if (!hasTaxon) {
        return t('unidentified_mosquito');
      }
      const taxonCommonName = observation.identification?.result?.taxon?.common_name;
      const taxonScientificName = observation.identification?.result?.taxon?.name;
      return taxonCommonName || taxonScientificName || t('unidentified_mosquito');
    }
    default:
      return ''
  }
})

const isBite = computed(() => {
  return report.value?.type === ReportType.Bite;
})

const fetchData = async () => {
  try {
    const uuid = props.feature.getId() as string
    switch (props.feature.get('type')) {
      case ReportType.Bite: {
        const bite = await bitesApi.retrieve({ uuid: uuid }).then((response) => response.data)
        report.value = { ...bite, type: ReportType.Bite }
        break
      }
      case ReportType.BreedingSite: {
        const breedingSite = await breedingSitesApi.retrieve({ uuid: uuid }).then((response) => response.data)
        report.value = { ...breedingSite, type: ReportType.BreedingSite }
        break
      }
      case ReportType.Observation: {
        const observation = await observationsApi.retrieve({ uuid: uuid }).then((response) => response.data)
        report.value = { ...observation, type: ReportType.Observation }
        break
      }
    }
  } catch (error) {
    console.log(error)
  }
}

onMounted(() => {
  void fetchData();
})
</script>
