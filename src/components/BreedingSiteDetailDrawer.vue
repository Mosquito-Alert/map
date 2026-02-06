<template>
  <BaseReportDetailDrawer :report="breedingSite" :title="$t(breedingSite.site_type)" :extra-items="extraItems"
    @close="$emit('close')">
    <template #header>
      <PhotoSliderHeader v-if="breedingSite.photos.length > 0"
        :photo-urls="breedingSite.photos.map(photo => photo.url)" />
    </template>
  </BaseReportDetailDrawer>
</template>

<script setup lang="ts">
import type { BreedingSite } from 'mosquito-alert';
import BaseReportDetailDrawer from './BaseReportDetailDrawer.vue';
import PhotoSliderHeader from 'src/components/PhotoSliderHeader.vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
  breedingSite: BreedingSite;
}>();

const extraItems = computed(() => {
  const items = []

  items.push({
    icon: 'fa-water',
    value: t('has_water') + ' ' + (props.breedingSite.has_water ? t('yes') : t('no')),
  });
  items.push({
    icon: 'fa-up-to-dotted-line',
    value: t('has_larvae') + ' ' + (props.breedingSite.has_larvae ? t('yes') : t('no')),
  });
  return items;
});


</script>
