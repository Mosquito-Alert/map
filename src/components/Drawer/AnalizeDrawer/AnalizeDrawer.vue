<template>
  <ScrollPanel
    :pt="{
      barY: 'bg-gray-300',
      root: 'overflow-y-auto',
      content: 'mb-0 !pb-0 !',
    }"
  >
    <div class="flex flex-col space-y-2">
      <AnalizeTools />
    </div>
  </ScrollPanel>
</template>
<script setup lang="ts">
import ScrollPanel from 'primevue/scrollpanel'
import AnalizeTools from './AnalizeTools.vue'
</script>
