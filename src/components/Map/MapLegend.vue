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
import {
  gradientStops,
  getGbifDensityLegendStops,
  getGbifDensityPalette,
  MosquitoLayersEnum,
  RM0_MAX_VALUE,
  RM0_PALETTE,
} from '../../utils/constants'
import { selectedBiteIndexStyle } from '../Map/Layers/BiteIndexLayer'

const props = defineProps<{
  mapColors: Record<string, { value: number; color: string }> | undefined
}>()

const mapStore = useMapStore()

const observationMapColors = computed(
  () => props.mapColors as Record<string, { value: number; color: string }> | undefined,
)

const gbifPalette = getGbifDensityPalette()
const gbifStops = getGbifDensityLegendStops()

const paletteGradient = (palette: readonly string[]) => {
  const step = 100 / (palette.length - 1)
  return palette.map((color, index) => `${color} ${(index * step).toFixed(2)}%`).join(', ')
}

const mapColorsGradientAndStops = (
  mapColors: Record<string, { value: number; color: string }> | undefined,
) => {
  const filteredColors = Object.entries(mapColors ?? {}).filter(([key]) => key !== 'max')

  return {
    gradient: filteredColors
      .map(([key, stop]) => {
        const percent = key === 'actualMax' ? 100 : Number(key)
        return `${stop.color} ${percent}%`
      })
      .join(', '),
    stops: filteredColors.map(([key, stop]) => ({ key, value: Math.round(stop.value) })),
  }
}

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
        style: { background: `linear-gradient(to right, ${paletteGradient([...RM0_PALETTE])})` },
        stops: [
          { key: 'min', value: 0 },
          { key: 'max', value: RM0_MAX_VALUE },
        ],
      }
    case MosquitoLayersEnum.EXTENDED_OBSERVATIONS:
      return {
        style: { background: `linear-gradient(to right, ${paletteGradient([...gbifPalette])})` },
        stops: gbifStops.map((value, index) => ({ key: String(index), value })),
      }
    case MosquitoLayersEnum.MA_OBSERVATIONS: {
      const { gradient, stops } = mapColorsGradientAndStops(observationMapColors.value)

      return {
        style: { background: `linear-gradient(to right, ${gradient})` },
        stops,
      }
    }
    default:
      return { style: { background: 'transparent' }, stops: [] }
  }
})
</script>
<style scoped></style>
