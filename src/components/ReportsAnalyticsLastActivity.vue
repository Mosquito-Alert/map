<template>
  <q-card flat>
    <q-card-section class="q-py-sm">
      <div class="text-h6 text-primary">{{ $t('recent_activity') }}</div>
    </q-card-section>
    <q-virtual-scroll style="max-height: 200px; overflow-x: hidden" virtual-scroll-slice-size="4"
      virtual-scroll-item-size="56" :items-size="lastFeatureIds.length"
      :items-fn="(from, size) => { return lastFeatureIds.slice(from, from + size) }" v-slot="{ item }">
      <ReportsAnalyticsLastActivityItem :key="item" :feature="features?.find((feature) => feature.getId() === item)!" />
    </q-virtual-scroll>
  </q-card>
</template>

<script setup lang="ts">

import { date } from 'quasar'

import { ref, onMounted, onUnmounted, watch } from 'vue'

import Worker from 'src/workers/ReportAnalyticsLastActivityWorker.js?worker'

import ReportsAnalyticsLastActivityItem from 'src/components/ReportsAnalyticsLastActivityItem.vue'
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
        ), id: feature.getId()
      }
    }),
    minDate: date.subtractFromDate(new Date(), { months: 2 })
  })
}, { immediate: true })
</script>
