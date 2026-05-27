<template>
  <div
    class="layer-style-selector-options flex flex-row items-center justify-center gap-1 h-12 bg-gray-100"
  >
    <div
      v-for="style in styles"
      @click="selectStyle(style)"
      :class="
        selectedBiteIndexStyle === style
          ? 'active border-3 border-primary-500 shadow-lg scale-110'
          : ''
      "
      class="layer-style-selector-option size-10 m-1 border border-gray-400 rounded cursor-pointer hover:scale-115 transition-all duration-200 ease-in-out"
      :style="{ background: `linear-gradient(to right, ${gradientStops(style)})` }"
      v-tooltip.bottom="{
        value: biteIndexStyles.find((s) => s.key === style)?.info,
      }"
    />
  </div>
</template>
<script setup lang="ts">
import { BiteIndexStyleEnum, biteIndexStyles, gradientStops } from '../../../utils/constants'
import { selectedBiteIndexStyle } from '../../Map/Layers/BiteIndexLayer'

const emit = defineEmits(['selectStyle'])

const styles = Object.values(BiteIndexStyleEnum)

const selectStyle = (style: BiteIndexStyleEnum) => {
  if (selectedBiteIndexStyle.value === style) return

  selectedBiteIndexStyle.value = style
  emit('selectStyle')
}
</script>
