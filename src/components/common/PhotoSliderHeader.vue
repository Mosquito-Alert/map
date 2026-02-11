<template>
  <q-carousel v-if="photoUrls?.length" animated v-model="slide" :arrows="photoUrls?.length > 1"
    :navigation="photoUrls?.length > 1" infinite height="250px">
    <q-carousel-slide v-for="(photoUrl, index) in photoUrls" :key="index" :name="index" :img-src="photoUrl">
      <q-btn class="absolute-bottom-right all-pointer-events cursor-pointer q-ma-xs" color="grey-14" unelevated
        padding="xs" :ripple=false target="_blank" href="https://creativecommons.org/licenses/by/4.0/" size="xs">
        <q-icon name="fa fa-brands fa-creative-commons" color="grey-4" />
        <q-icon name="fa fa-brands fa-creative-commons-by" color="grey-4" />
      </q-btn>
    </q-carousel-slide>
  </q-carousel>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  photoUrls?: string[];
}>();

const slide = ref(0);
</script>
