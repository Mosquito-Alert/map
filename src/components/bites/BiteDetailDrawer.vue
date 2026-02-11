<template>
  <BaseReportDetailDrawer :report="bite" :extra-items="extraItems" :title="title" @close="$emit('close')">
    <template #header>
      <BitesStickman :bite="bite" />
    </template>
  </BaseReportDetailDrawer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Bite } from 'mosquito-alert';
import { BaseReportDetailDrawer } from 'src/components/reports';
import BitesStickman from 'src/components/bites/BitesStickman.vue';

const { t } = useI18n();

const props = defineProps<{
  bite: Bite;
}>();

const title = computed(() => props.bite.counts.total + ' ' + t('bites'))

const extraItems = computed(() => {
  const items = []

  if (props.bite.event_environment) {
    items.push({
      icon: 'fa-location-question',
      value: t(props.bite.event_environment),
    });
  }

  if (props.bite.event_moment) {
    items.push({
      icon: 'fa-timer',
      value: t(props.bite.event_moment),
    });
  }
  return items;
});
</script>
