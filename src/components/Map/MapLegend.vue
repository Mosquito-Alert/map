<template>
  <div
    class="legend w-40 ml-2 p-2 min-w-50 bg-white! border-gray-400! border-1! rounded-sm shadow-lg"
  >
    <div class="legend-title bg-gray-100! mb-2">
      <h4 class="text-lg font-semibold">Leyenda</h4>
    </div>
    <div class="legend-content h-full">
      <div class="gradient-bar h-7 rounded border border-gray-300" :style="gradientStyle"></div>

      <div class="labels mt-2 size-sm flex justify-between">
        <span v-for="stop in labelStops" :key="stop.key">
          {{ stop.value }}
        </span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  mapColors: Record<string, { value: number; color: string }> | undefined
}>()

const mapColors = ref(props.mapColors as Record<string, { value: number; color: string }>)

const gradientStyle = computed(() => {
  const stops = Object.entries(mapColors.value)
    // TODO: Review which value to show in legend labels (max or actualMax)
    .filter(([key]) => key !== 'max')
    .map(([key, stop]) => {
      const percent = key === 'actualMax' ? 100 : Number(key)
      return `${stop.color} ${percent}%`
    })

  return {
    background: `linear-gradient(to right, ${stops.join(', ')})`,
  }
})

const labelStops = computed(() =>
  Object.entries(mapColors.value)
    // TODO: Review which value to show in legend labels (max or actualMax)
    .filter(([key]) => key !== 'max')
    .map(([key, stop]) => ({
      key,
      value: Math.round(stop.value),
    })),
)

watch(
  () => props.mapColors,
  (newColors) => {
    mapColors.value = newColors as Record<string, { value: number; color: string }>
  },
)
</script>
<style scoped></style>
