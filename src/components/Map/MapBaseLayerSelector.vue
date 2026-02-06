<template>
  <div
    class="maplibregl-ctrl maplibregl-ctrl-group basemap-selector flex flex-row-reverse! border-0! shadow-none!"
    :class="{
      'bg-transparent!': showLayerStyleSelector,
    }"
  >
    <button
      class="rounded-sm! shadow-[0_0_2px_2px_rgba(0,0,0,0.1)]!"
      :class="{
        'ml-3': showLayerStyleSelector,
        'bg-transparent! opacity-50! cursor-not-allowed!': !mapStore.mapLoaded,
        'bg-white! ': mapStore.mapLoaded,
      }"
      :disabled="!mapStore.mapLoaded"
      title="Select baselayer"
      aria-label="Select baselayer"
      @click="showLayerStyleSelector = !showLayerStyleSelector"
    >
      <div class="basemap-selector-button flex! justify-center! items-center! size-7.5">
        <span
          class="material-icons-outlined"
          :class="{
            'text-amber-500': showLayerStyleSelector,
          }"
        >
          layers
        </span>
      </div>
    </button>
    <div
      class="basemap-selector-options bg-gray-200! p-1 flex flex-row-reverse! rounded-sm border-1 border-gray-400 shadow-lg"
      v-if="showLayerStyleSelector"
    >
      <div
        v-for="basemap in props.options.basemaps"
        @click="selectBasemap(basemap)"
        v-tooltip.bottom="basemap.name"
        class="basemap-selector-option ml-1 flex! justify-center! items-center!"
      >
        <div
          class="basemap-selector-button flex! justify-center! items-center! size-7.5 cursor-pointer border-1"
          :class="{
            'size-9': showLayerStyleSelector,
            'border-2 border-amber-500': basemap.id === mapStore.baselayer.id,
          }"
        >
          <img :src="basemap.image" :alt="basemap.name" class="basemap-icon-option" />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type {
  BasemapType,
  MapLibreBasemapsControlOptions,
} from '../../utils/mapControls/MapBaseLayerControl'
import { useMapStore } from '../../stores/mapStore'

const mapStore = useMapStore()

const props = defineProps<{
  options: MapLibreBasemapsControlOptions
}>()

const showLayerStyleSelector = ref(false)

const selectBasemap = (basemap: BasemapType) => {
  // @ts-ignore // FIXME:
  mapStore.baselayer = basemap
  showLayerStyleSelector.value = false
}
</script>
