<template>
  <BaseReportDetailDrawer :report="observation" :photoUrls="observation.photos.map(photo => photo.url)" :title="title"
    :subtitle="subtitle" :extra-items="extraItems" @close="$emit('close')">
    <template v-if="observation.identification?.result?.is_high_confidence" #header-icons>
      <q-icon v-if="observation.identification?.result?.source === IdentificationTaskResultSource.Expert"
        name="fa fa-badge-check" color="white">
        <q-tooltip anchor="top middle" self="center middle">
          {{ $t('expert_confirmed') }}
        </q-tooltip>
      </q-icon>
      <q-icon v-if="observation.identification?.result?.source === IdentificationTaskResultSource.Ai"
        name="fa fa-microchip-ai" color="white">
        <q-tooltip anchor="top middle" self="center middle">
          {{ $t('ai_identified') }}
        </q-tooltip>
      </q-icon>
    </template>
    <template v-if="observation.identification?.result?.source === IdentificationTaskResultSource.Expert" #extraTab>
      <q-tab name="review" :label="$t('review')" />
    </template>
    <template v-if="observation.identification?.result?.source === IdentificationTaskResultSource.Expert"
      #extraTabPanel>
      <q-tab-panel name="review">
        <q-card flat>
          <q-item>
            <q-item-section avatar>
              <q-avatar icon="fa fa-light fa-users" color="grey-3" />
            </q-item-section>
            <q-item-section>
              <q-item-label>
                {{ $t('expert_community') }}
              </q-item-label>
              <q-item-label caption>
                {{ $t('project_member') }}
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-card-section>
            <div class="row q-mb-sm">
              <span class="text-body2 text-uppercase text-grey-7">{{ $t('confidence_level') }}:</span>
              <q-rating :model-value="observation.identification?.result?.is_high_confidence ? 3 : 2" :max='3' readonly
                color="primary" icon="fa fa-light fa-circle-check" size="xs" class="q-ml-xs" />
            </div>
            <div class="text-justify">
              {{ observation.identification?.public_note }}
            </div>
          </q-card-section>
        </q-card>

      </q-tab-panel>
    </template>
  </BaseReportDetailDrawer>
</template>

<script setup lang="ts">
import type { Observation } from 'mosquito-alert';
import { IdentificationTaskResultSource } from 'mosquito-alert';
import BaseReportDetailDrawer from './BaseReportDetailDrawer.vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
  observation: Observation;
}>();

const hasTaxon = computed(() => {
  return props.observation.identification?.result?.taxon !== undefined;
});

const taxonCommonName = computed(() => {
  return props.observation.identification?.result?.taxon?.common_name;
});

const taxonScientificName = computed(() => {
  return props.observation.identification?.result?.taxon?.name;
});

const title = computed(() => {
  if (!hasTaxon.value) {
    return t('unidentified_mosquito');
  }
  return taxonCommonName.value || taxonScientificName.value || t('unidentified_mosquito');
});

const subtitle = computed(() => {
  if (!hasTaxon.value) {
    return undefined;
  }

  if (!title.value || !taxonCommonName.value) {
    return undefined;
  }
  return taxonScientificName.value;
});

const extraItems = computed(() => {
  const items = []

  if (props.observation.event_environment) {
    items.push({
      icon: 'fa-location-question',
      value: t(props.observation.event_environment),
    });
  }
  return items;
});

</script>
