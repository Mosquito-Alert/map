<template>
  <div class="row">
    <div
      :class="['col-12', `col-${breakpoint}`, 'absolute-left', 'inner-drawer', { 'inner-drawer-collapsed': drawerCollapsed }]"
      :style="{ 'min-width': width, 'z-index': 10 }">
      <div :class="['full-height', 'bg-white', { 'shadow-3': !drawerCollapsed }]" style="transform: translateX(0px);">
        <div class="flex q-pa-sm q-px-md bg-primary text-white items-center" :style="{ 'height': headerHeight }">
          <span class="text-capitalize text-h4">{{ title }}</span>
        </div>
        <div :class="[`lt-${breakpoint}`, 'self-start', 'q-ma-sm', 'absolute-top-right']">
          <q-btn outline round color='white' icon="fa fat fa-xmark" size="sm"
            @click="drawerCollapsed = !drawerCollapsed" />
        </div>
        <q-scroll-area class="q-pa-sm q-px-md" :style="{ height: `calc(100% - ${headerHeight})` }">
          <slot></slot>
        </q-scroll-area>
      </div>

      <q-btn class="absolute" padding="lg xs" unelevated square color="primary"
        :style="{ 'top': headerHeight, 'left': '100%', 'border-radius': '0px 10px 10px 0px', 'z-index': '-1' }"
        :icon="drawerCollapsed ? 'chevron_right' : 'chevron_left'" @click="drawerCollapsed = !drawerCollapsed" />
    </div>
  </div>
</template>

<script lang="ts">

import { ref, inject, watchEffect } from 'vue'
import type Map from "ol/Map";

export default {
  components: {},
  props: {
    title: {
      type: String,
      required: true
    },
    headerHeight: {
      type: String,
      default: '78.5px'
    },
    width: {
      type: String,
      default: '300px'
    },
    breakpoint: {
      type: String,
      default: 'sm',
      validator: function (value: string) {
        return ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
      }
    },
    initCollapsed: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const drawerCollapsed = ref(props.initCollapsed)

    const map = inject<Map>('map')

    watchEffect(() => {
      const controlsContainer = map?.getViewport().querySelector('.ol-overlaycontainer-stopevent') as HTMLElement | null
      if (controlsContainer) {
        controlsContainer.style.right = '0'
        controlsContainer.style.transition = "width 0.5s ease"
        if (drawerCollapsed.value) {
          controlsContainer.style.width = '100%'
        } else {
          controlsContainer.style.width = `calc(100% - ${props.width})`
        }
      }
    })

    return {
      drawerCollapsed
    }
  }
}
</script>

<style scoppe lang="scss">
.inner-drawer {
  transition: transform 0.5s ease;
}

.inner-drawer-collapsed {
  transform: translateX(-100%);
}

.q-tab {
  border-bottom: 0.5px solid $grey-4;
}

.q-tab:first-child {
  border-top: 0.5px solid $grey-4;
}
</style>
