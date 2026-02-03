<template>
  <div class="basemap-selector flex flex-row-reverse! bg-gray-200" @mouseleave="hideStyleOptions">
    <div
      :class="{
        'm-1 ml-2 border-2 border-amber-500': showLayerStyleSelector,
      }"
    >
      <div
        class="basemap-selector-button flex! justify-center! items-center! size-7.5"
        :class="{
          'size-9': showLayerStyleSelector,
        }"
        v-tooltip.bottom="mapStore.baselayer.name"
        @mouseover="showStyleOptions"
      >
        <img :src="mapStore.baselayer.image" alt="Basemap" class="basemap-icon" />
      </div>
    </div>
    <div
      class="basemap-selector-options bg-inherit p-1 flex flex-row-reverse!"
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
            ' size-9': showLayerStyleSelector,
          }"
          v-if="basemap.id !== mapStore.baselayer.id"
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

const hideStyleOptions = () => {
  showLayerStyleSelector.value = false
}

const showStyleOptions = () => {
  console.log('Showing basemap styles')
  showLayerStyleSelector.value = true
}

const selectBasemap = (basemap: BasemapType) => {
  // @ts-ignore // FIXME:
  mapStore.baselayer = basemap
  showLayerStyleSelector.value = false
}

onMounted(() => {
  // DELETE:
  console.log('Basemap options on mounted:', props.options)
})
</script>
