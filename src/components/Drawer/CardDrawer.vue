<template>
  <div
    class="drawer-card rounded-lg border bg-gray-100 p-4"
    :class="[highlightBorder ? 'border-primary-700 border-2' : 'border-gray-700']"
  >
    <div class="cursor-pointer" @click="isUnfold = !isUnfold">
      <h3 class="text-xl pb-2 font-bold text-gray-700"><slot name="title"></slot></h3>
    </div>
    <div v-if="isUnfold">
      <slot name="content"></slot>
    </div>
    <div v-if="supportingButton" class="mt-3 flex justify-center">
      <div class="absolute">
        <slot name="supporting-button"></slot>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  highlightBorder?: boolean
  supportingButton?: boolean
  isCollapsed?: boolean
}>()

const isUnfold = ref(!props.isCollapsed)
</script>
