<template>
  <ScrollPanel
    :pt="{
      barY: 'bg-gray-300',
      root: 'overflow-y-auto',
      content: 'mb-0 !pb-0 !',
    }"
  >
    <div class="flex flex-col space-y-2">
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
