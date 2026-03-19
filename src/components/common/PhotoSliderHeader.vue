<template>
  <q-carousel v-if="photoUrls?.length" animated v-model="slide" v-model:fullscreen="fullscreen"
    :arrows="photoUrls?.length > 1" :navigation="photoUrls?.length > 1" infinite height="250px">
    <q-carousel-slide v-for="(photoUrl, index) in photoUrls" :key="index" :name="index" :img-src="photoUrl"
      @click="fullscreen = !fullscreen" class="cursor-pointer" />
    <template v-slot:control>
      <q-carousel-control position="bottom-right">
        <q-btn color="grey-14" unelevated padding="xs" :ripple=false target="_blank"
          href="https://creativecommons.org/licenses/by/4.0/" size="xs">
          <q-icon name="fa fa-brands fa-creative-commons" color="grey-4" />
          <q-icon name="fa fa-brands fa-creative-commons-by" color="grey-4" />
        </q-btn>
      </q-carousel-control>
      <q-carousel-control v-if="fullscreen" position="top-right">
        <q-btn unelevated round color='grey-3' text-color='grey-14' icon="fa fat fa-xmark"
          @click="fullscreen = false" />
      </q-carousel-control>
    </template>
  </q-carousel>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  photoUrls?: string[];
}>();

const slide = ref(0);
const fullscreen = ref(false);
</script>
