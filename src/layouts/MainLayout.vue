<template>
  <q-layout view="lHr LpR fFf">

    <MainLeftDrawer />

    <q-page-container>
      <q-page class="flex overflow-hidden">

        <q-resize-observer @resize="handlePageResize" debounce="0" />

        <q-ajax-bar position='top' size="3px" color="primary" />

        <!-- MAP -->
        <MainMap ref="mapRef">
          <router-view />
        </MainMap>

      </q-page>
    </q-page-container>

    <MainFooter />

  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { MainLeftDrawer, MainFooter } from 'src/components/layout'
import MainMap from 'src/components/map/MainMap.vue'

// Reference to the map component
const mapRef = ref<InstanceType<typeof MainMap>>()

// Method to handle page resize
function handlePageResize() {
  mapRef.value?.updateSize()
}
</script>
