<template>
  <BaseReportDetailDrawer :report="observation" :title="titleWithStyle" :subtitle="subtitleWithStyle"
    :extra-items="extraItems" @close="$emit('close')">
    <template #header>
      <PhotoSliderHeader v-if="observation.photos.length > 0"
        :photo-urls="observation.photos.map(photo => photo.url)" />
    </template>
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
import { BaseReportDetailDrawer } from 'src/components/reports';
import { PhotoSliderHeader } from 'src/components/common';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { TextWithStyle } from 'src/types/utils';

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

const taxonItalicize = computed(() => {
  return props.observation.identification?.result?.taxon?.italicize ?? false;
})

const titleWithStyle = computed<TextWithStyle>(() => {
  if (!hasTaxon.value) {
    return { value: t('unidentified_mosquito'), italicize: false };
  }
  if (taxonCommonName.value) {
    return { value: taxonCommonName.value, italicize: false };
  } else if (taxonScientificName.value) {
    return { value: taxonScientificName.value, italicize: taxonItalicize.value };
  }
  return { value: t('unidentified_mosquito'), italicize: false };
});

const subtitleWithStyle = computed<TextWithStyle | undefined>(() => {
  if (!hasTaxon.value) {
    return undefined;
  }

  if (!titleWithStyle.value.value || !taxonCommonName.value) {
    return undefined;
  }
  if (!taxonScientificName.value) {
    return undefined;
  }
  return {
    value: taxonScientificName.value,
    italicize: taxonItalicize.value,
  };
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
