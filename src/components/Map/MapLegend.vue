<template>
  <div
    v-if="showLegend"
    class="legend w-40 ml-2 p-2 min-w-50 bg-white! border-gray-400! border-1! rounded-sm shadow-lg"
  >
    <div class="legend-title bg-gray-100! mb-2">
      <h4 class="text-lg font-semibold">Leyenda</h4>
    </div>
    <div class="legend-content h-full">
      <div class="gradient-bar h-7 rounded border border-gray-300" :style="legend.style"></div>

      <div class="labels mt-2 size-sm flex justify-between">
        <span v-for="stop in legend.stops" :key="stop.key">
          {{ stop.value }}
        </span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useMapStore } from '../../stores/mapStore'
import { MosquitoLayersEnum, gradientStops } from '../../utils/constants'
import { selectedBiteIndexStyle } from '../Map/Layers/BiteIndexLayer'

const props = defineProps<{
  mapColors: Record<string, { value: number; color: string }> | undefined
}>()

const mapStore = useMapStore()
const rm0LegendMaxValue = 7

const observationMapColors = computed(
  () => props.mapColors as Record<string, { value: number; color: string }> | undefined,
)

const showLegend = computed(() =>
  mapStore.layerSelected === MosquitoLayersEnum.MA_OBSERVATIONS
    ? !!props.mapColors
    : !!mapStore.layerSelected,
)

const legend = computed(() => {
  switch (mapStore.layerSelected) {
    case MosquitoLayersEnum.BITE_INDEX:
      return {
        style: {
          background: `linear-gradient(to right, ${gradientStops(selectedBiteIndexStyle.value)})`,
        },
        stops: [
          { key: 'min', value: 0 },
          { key: 'max', value: 1 },
        ],
      }
    case MosquitoLayersEnum.RM0:
      return {
        style: { background: 'linear-gradient(to right, #ffffff 0%, #ff0000 100%)' },
        stops: [
          { key: 'min', value: 0 },
          { key: 'max', value: rm0LegendMaxValue },
        ],
      }
    case MosquitoLayersEnum.MA_OBSERVATIONS: {
      const stops = Object.entries(observationMapColors.value ?? {})
        // TODO: Review which value to show in legend labels (max or actualMax)
        .filter(([key]) => key !== 'max')
        .map(([key, stop]) => {
          const percent = key === 'actualMax' ? 100 : Number(key)
          return `${stop.color} ${percent}%`
        })

      return {
        style: { background: `linear-gradient(to right, ${stops.join(', ')})` },
        stops: Object.entries(observationMapColors.value ?? {})
          // TODO: Review which value to show in legend labels (max or actualMax)
          .filter(([key]) => key !== 'max')
          .map(([key, stop]) => ({ key, value: Math.round(stop.value) })),
      }
    }
    default:
      return { style: { background: 'transparent' }, stops: [] }
  }
})
</script>
<style scoped></style>
