<template>
  <div class="overflow-y-hidden relative h-screen! max-h-screen!">
    <MainDrawer v-if="!observationsStore.observationInDrawer" />
    <ObservationDetailDrawer v-else />
    <MainMap />
  </div>
</template>
<script setup>
import MainDrawer from '@/components/Drawer/MainDrawer.vue'
import MainMap from '@/components/Map/MainMap.vue'
import ObservationDetailDrawer from '@/components/Drawer/ObservationDetailDrawer.vue'
import { useObservationsStore } from '../stores/observationsStore'

const observationsStore = useObservationsStore()
</script>
