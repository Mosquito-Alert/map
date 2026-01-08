<template>
  <div class="legend w-40 h-40 ml-2 bg-white! border-gray-400! border-1! rounded-sm shadow-lg">
    <div class="legend-title bg-gray-100! p-2">
      <h4 class="text-lg font-semibold">Leyenda</h4>
      <div class="gradient-bar" :style="gradientStyle"></div>

      <div class="labels">
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
  const stops = Object.entries(mapColors.value).map(([key, stop]) => {
    const percent = key === 'max' ? 100 : Number(key)
    return `${stop.color} ${percent}%`
  })

  return {
    background: `linear-gradient(to right, ${stops.join(', ')})`,
  }
})

const labelStops = computed(() =>
  Object.entries(mapColors.value).map(([key, stop]) => ({
    key,
    value: Math.round(stop.value),
  })),
)

watch(
  () => props.mapColors,
  (newColors) => {
    mapColors.value = newColors as Record<string, { value: number; color: string }>
    console.log('Map colors prop changed:', mapColors.value)
  },
)
</script>
<style scoped>
.legend {
  width: 300px;
  font-family: sans-serif;
}

.gradient-bar {
  height: 16px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-top: 6px;
}
</style>
