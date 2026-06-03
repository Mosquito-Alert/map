<template>
  <ScrollPanel
    class="w-full min-w-0"
    :pt="{
      barY: 'bg-gray-300',
      root: 'overflow-y-auto overflow-x-hidden w-full min-w-0',
      content: 'mb-0 !pb-0 overflow-x-hidden',
    }"
  >
    <div class="flex flex-col space-y-2 w-full min-w-0">
      <AnalizeTools v-if="!analizeStore.isRegionSelected" />
      <DetailedRegion v-else />
    </div>
  </ScrollPanel>
</template>
<script setup lang="ts">
import ScrollPanel from 'primevue/scrollpanel'
import AnalizeTools from './AnalizeTools.vue'
import DetailedRegion from './DetailedRegion.vue'
import { useAnalizeStore } from '@/stores/analizeStore'

const analizeStore = useAnalizeStore()
</script>
