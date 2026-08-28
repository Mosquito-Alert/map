<template>
  <q-card flat>
    <q-card-section class="q-py-sm">
      <div class="text-h6 text-primary">{{ $t('recent_activity') }}</div>
    </q-card-section>
    <q-virtual-scroll
      style="max-height: 25vh; overflow-x: hidden"
      virtual-scroll-slice-size="4"
      virtual-scroll-item-size="56"
      :items="lastFeatures"
      v-slot="{ item, index }"
    >
      <ReportsAnalyticsLastActivityItem :key="index" :feature="item" />
    </q-virtual-scroll>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import ReportsAnalyticsLastActivityItem from 'src/components/reports/analytics/ReportsAnalyticsLastActivityItem.vue';
import type { Feature } from 'ol';

const props = defineProps<{
  features?: Feature[];
}>();

const lastFeatures = computed<Feature[]>(() => {
  if (!props.features) return [];
  return props.features;
});
</script>
