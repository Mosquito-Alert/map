<template>
  <div>
    <q-drawer show-if-above behavior="desktop" side="right" class="column full-height no-wrap" :width="drawerWidth">
      <q-btn unelevated round class="q-ma-sm absolute-top-right z-top" color='grey-3' text-color='grey-14'
        icon="fa fat fa-xmark" size="xs" @click="emit('close')" />
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
      <div class="bg-primary items-center q-px-sm q-py-xs text-white relative-coordinates">
        <!-- <q-skeleton class='full-width q-pa-none' type='text' /> -->
        <!-- <q-skeleton type='text' width="48%" /> -->
        <div class="row items-center">
          <span class="text-h6 q-py-none q-pr-sm">{{ title }}</span>
          <div class="row items-center q-gutter-x-xs">
            <slot name="header-icons"></slot>
          </div>
        </div>
        <span class="text-caption text-italic q-py-none row">{{ subtitle }}</span>
      </div>
      <q-tabs v-model="tab" dense class="text-grey" active-color="primary" indicator-color="primary" align="justify"
        narrow-indicator>
        <q-tab name="overview" :label="$t('overview')" />
        <slot name="extraTab"></slot>
      </q-tabs>

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="overview" class="q-py-md">
          <q-list>
            <q-item>
              <q-item-section avatar>
                <q-icon color="primary" name="fa fa-light fa-hashtag" />
              </q-item-section>
              <q-item-section>
                {{ report.short_id }}
              </q-item-section>
            </q-item>
            <q-item v-if="report.location.display_name">
              <q-item-section avatar>
                <q-icon color="primary" name="fa fa-light fa-location-dot" />
              </q-item-section>
              <q-item-section>
                {{ report.location.display_name }}
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar>
                <q-icon color="primary" name="fa fa-light fa-calendar" />
              </q-item-section>
              <q-item-section>
                {{ date.formatDate(report.created_at_local, 'DD/MM/YYYY HH:mm') }}
              </q-item-section>
            </q-item>
            <q-item v-for:="(item, index) in extraItems" :key="index">
              <q-item-section avatar>
                <q-icon color="primary" :name="`fa fa-light ${item.icon}`" />
              </q-item-section>
              <q-item-section>
                {{ item.value }}
              </q-item-section>
            </q-item>
            <q-item v-if="report.tags?.length">
              <q-item-section avatar>
                <q-icon color="primary" name="fa fa-light fa-tags" />
              </q-item-section>
              <q-item-section>
                <div class="row q-gutter-xs">
                  <q-badge v-for="(item, index) in report.tags" :key="index" rounded color="primary" text-color="white"
                    :label="item" />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-tab-panel>

        <slot name="extraTabPanel"></slot>

      </q-tab-panels>
    </q-drawer>
  </div>
</template>

<script setup lang="ts">

import { date, useQuasar } from 'quasar'
import { ref, computed } from 'vue'

import type { Bite, BreedingSite, Observation } from 'mosquito-alert';

const $q = useQuasar();

const emit = defineEmits<{
  (event: 'close'): void;
}>();

defineProps<{
  report: Observation | Bite | BreedingSite;
  photoUrls?: string[];
  title: string;
  subtitle?: string;
  extraItems?: { icon: string; value: string }[];
}>();

const tab = ref('overview');
const slide = ref(0);

const drawerWidth = computed(() => {
  return $q.screen.width <= $q.screen.sizes.sm
    ? $q.screen.width
    : 350 // default desktop width
})

</script>
