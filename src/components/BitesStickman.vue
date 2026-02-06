<template>
  <div class="relative">
    <!-- Base body image -->
    <q-img src="/img/ic_full_body_off.webp" fit="contain" :height="height + 'px'">
      <!-- Body part overlays -->
      <div v-for="part in bodyParts.filter(part => part.count !== undefined && part.count > 0)" :key="part.name" :style="{
        ...getOverlayStyle(part),
      }" class="bite-count-container">
        <!-- Bite count badge -->
        <span class="absolute text-black font-bold text-sm">
          {{ part.count }}
        </span>
      </div>
    </q-img>
  </div>
</template>

<script setup lang="ts">
import type { Bite } from "mosquito-alert";
import { reactive } from "vue";

const props = withDefaults(defineProps<{
  bite: Bite,
  height?: number
}>(), {
  height: 250
});

// All readonly body parts with their bite counts
const bodyParts = reactive([
  { name: "head", count: props.bite.counts.head, left: 0.49, top: 0.125, width: 0.15, height: 0.15 },
  { name: "chest", count: props.bite.counts.chest, left: 0.49, top: 0.32, width: 0.15, height: 0.15 },
  { name: "leftHand", count: props.bite.counts.left_arm, left: 0.3, top: 0.39, width: 0.15, height: 0.15 },
  { name: "rightHand", count: props.bite.counts.right_arm, left: 0.68, top: 0.39, width: 0.15, height: 0.15 },
  { name: "leftLeg", count: props.bite.counts.left_leg, left: 0.4, top: 0.70, width: 0.15, height: 0.15 },
  { name: "rightLeg", count: props.bite.counts.right_leg, left: 0.58, top: 0.70, width: 0.15, height: 0.15 },
]);

function getOverlayStyle(part: { left: number; top: number; width: number; height: number }) {
  return {
    left: `${part.left * 320}px`,
    top: `${part.top * props.height}px`,
  };
}
</script>

<style lang="scss" scoped>
.bite-count-container {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid var(--q-primary);
  border-radius: 50%;
  background: transparent;
  user-select: none;
}
</style>
