<template>
  <div class="overflow-y-hidden relative h-screen! max-h-screen!">
    <Transition name="drawer-slide" mode="out-in">
      <component
        :is="observationsStore.observationInDrawer ? ObservationDetailDrawer : MainDrawer"
        :key="observationsStore.observationInDrawer ? 'detail' : 'main'"
        class="absolute left-0 top-0 h-full"
      />
    </Transition>
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
<style>
.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.drawer-slide-enter-to,
.drawer-slide-leave-from {
  transform: translateX(0%);
  opacity: 1;
}
</style>
