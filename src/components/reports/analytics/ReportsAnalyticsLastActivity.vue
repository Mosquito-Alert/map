<template>
  <q-card flat>
    <q-card-section class="q-py-sm">
      <div class="text-h6 text-primary">{{ $t('recent_activity') }}</div>
    </q-card-section>
    <q-virtual-scroll style="max-height: 25vh; overflow-x: hidden" virtual-scroll-slice-size="4"
      virtual-scroll-item-size="56" :items="lastFeatures" v-slot="{ item, index }">
      <ReportsAnalyticsLastActivityItem :key="index" :feature="item" />
    </q-virtual-scroll>
  </q-card>
</template>

<script setup lang="ts">

import { date } from 'quasar'

import { ref, onMounted, onUnmounted, watch, computed } from 'vue'

import Worker from 'src/workers/ReportAnalyticsLastActivityWorker.js?worker'

import ReportsAnalyticsLastActivityItem from 'src/components/reports/analytics/ReportsAnalyticsLastActivityItem.vue'
import type { Feature } from 'ol'

const worker = new Worker()

const props = defineProps<{
  features?: Feature[]
}>()

const lastFeatureIds = ref<string[]>([])

onMounted(() => {
  worker.onmessage = function (e) {
    lastFeatureIds.value = e.data
  }
})

onUnmounted(() => {
  worker.terminate()
})

// Watch for changes in props and restart the worker when they change
watch([() => props.features], () => {
  if (!props.features) {
    lastFeatureIds.value = []
    return
  }
  worker.postMessage({
    features: props.features.map(feature => {
      return {
        ...Object.fromEntries(
          Object.entries(feature.getProperties()).filter(([key]) => key !== 'geometry')
        ), id: String(feature.getId())
      }
    }),
    minDate: date.subtractFromDate(new Date(), { months: 2 })
  })
}, { immediate: true })

const lastFeatures = computed<Feature[]>(() => {
  if (!props.features || !lastFeatureIds.value.length) return []
  return props.features.filter(feature => lastFeatureIds.value.includes(String(feature.getId())))
})

</script>
