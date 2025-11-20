<template>
  <div class="overflow-y-hidden relative h-screen! max-h-screen!">
    <MainDrawer />
    <MainMap />
  </div>
</template>
<script setup>
import MainDrawer from '@/components/Drawer/MainDrawer.vue'
import MainMap from '@/components/Map/MainMap.vue'
</script>
