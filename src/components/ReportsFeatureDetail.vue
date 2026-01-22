<template>
  <ol-vector-layer v-if="coordinates" z-index="100">
    <ol-source-vector>
      <ol-feature>
        <ol-geom-point :coordinates="coordinates"></ol-geom-point>
        <ol-style>
          <ol-style-text font="900 40px FontAwesome" textBaseline='bottom' :text="String.fromCodePoint(0xF3C5)"
            :fill="colors.getPaletteColor('primary')" />
        </ol-style>
      </ol-feature>
    </ol-source-vector>
  </ol-vector-layer>

  <div v-if="$q.platform.is.mobile">
    <Teleport to='body'>
      <!-- snap-point must be equal to: header height (60px + 10px) + picture height (250px) -->
      <!-- <SwipeModal :model-value="Boolean(featureProps)" snap-point="320px" :is-backdrop="false" class="flex bg-white"
        style="z-index: 5;">
        <template v-slot:drag-handle>
          <div class="swipe-modal-drag-handle" />
          <div class="bg-primary items-center q-px-sm q-py-xs text-white relative-coordinates">
            <div class="row items-center">
              <span class="text-h6 q-py-none q-pr-sm">Tiger mosquito</span>
              <q-icon v-if='featureValidationIsConfirmed' name="fa fa-badge-check" color="white">
                <q-tooltip anchor="top middle" self="center middle">
                  Confirmed by the experts
                </q-tooltip>
              </q-icon>
            </div>
            <span class="text-caption text-italic q-py-none row">Aedes Albopictus</span>
          </div>
        </template>

<template v-slot:default v-if="featureProps">
          <q-img :src="featurePhotoUrl" height="250px" no-native-menu>
            <q-btn class="absolute-bottom-right all-pointer-events cursor-pointer q-ma-xs" color="grey-14" unelevated
              padding="xs" :ripple=false href="https://creativecommons.org/licenses/by/4.0/" size="xs">
              <q-icon name="fa fa-brands fa-creative-commons" color="grey-4" />
              <q-icon name="fa fa-brands fa-creative-commons-by" color="grey-4" />
            </q-btn>

          </q-img>
          <q-tabs v-model="tab" dense class="text-grey bg-grey-1" active-color="primary" indicator-color="primary"
            align="justify" narrow-indicator>
            <q-tab name="overview" label="Overview" />
            <q-tab v-if='featureIsValidated' name="review" label="Review" />
          </q-tabs>

          <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="overview" class="q-py-md">
              <q-list>
                <q-item>
                  <q-item-section avatar>
                    <q-icon color="primary" name="fa fa-light fa-hashtag" />
                  </q-item-section>
                  <q-item-section>
                    {{ featureProps.code }}
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-icon color="primary" name="fa fa-light fa-location-dot" />
                  </q-item-section>
                  <q-item-section>
                    {{ featureLocationName }}
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-icon color="primary" name="fa fa-light fa-calendar" />
                  </q-item-section>
                  <q-item-section>
                    {{ featureFormattedDate }}
                  </q-item-section>
                </q-item>
                <q-item v-if="featureTags.length">
                  <q-item-section avatar>
                    <q-icon color="primary" name="fa fa-light fa-tags" />
                  </q-item-section>
                  <q-item-section>
                    <div class="row q-gutter-xs">
                      <q-badge v-for="(item, index) in featureTags" :key="index" rounded color="primary"
                        text-color="white" :label="item" />
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-tab-panel>

            <q-tab-panel name="review">
              <q-card flat>
                <q-item>
                  <q-item-section avatar>
                    <q-avatar icon="fa fa-light fa-users" color="grey-3" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>
                      Experts community
                    </q-item-label>
                    <q-item-label caption>
                      Project member
                    </q-item-label>
                  </q-item-section>
                </q-item>
                <q-card-section>
                  <div class="row q-mb-sm">
                    <span class="text-body2 text-uppercase text-grey-7">Confidence level:</span>
                    <q-rating :model-value="featureValidationNumCheckMarks" :max='3' readonly color="primary"
                      icon="fa fa-light fa-circle-check" size="xs" class="q-ml-xs" />
                  </div>
                  <div class="text-justify">
                    {{ featureProps.validation_notes }}
                  </div>
                </q-card-section>
              </q-card>

            </q-tab-panel>

          </q-tab-panels>
        </template>
</SwipeModal> -->
    </Teleport>
  </div>
  <div v-else>
    <q-drawer v-if="featureProps" show-if-above side="right" class="column full-height no-wrap" :width="350">
      <q-btn unelevated round class="q-ma-sm absolute-top-right z-top" color='grey-3' text-color='grey-14'
        icon="fa fat fa-xmark" size="xs" @click="clearFeatureId" />
      <q-img :src="featurePhotoUrl" height="250px" no-native-menu>
        <q-btn class="absolute-bottom-right all-pointer-events cursor-pointer q-ma-xs" color="grey-14" unelevated
          padding="xs" :ripple=false href="https://creativecommons.org/licenses/by/4.0/" size="xs">
          <q-icon name="fa fa-brands fa-creative-commons" color="grey-4" />
          <q-icon name="fa fa-brands fa-creative-commons-by" color="grey-4" />
        </q-btn>

      </q-img>
      <div class="bg-primary items-center q-px-sm q-py-xs text-white relative-coordinates">
        <!-- <q-skeleton class='full-width q-pa-none' type='text' /> -->
        <!-- <q-skeleton type='text' width="48%" /> -->
        <div class="row items-center">
          <span class="text-h6 q-py-none q-pr-sm">Tiger mosquito</span>
          <q-icon v-if='featureValidationIsConfirmed' name="fa fa-badge-check" color="white">
            <q-tooltip anchor="top middle" self="center middle">
              Confirmed by the experts
            </q-tooltip>
          </q-icon>
        </div>
        <span class="text-caption text-italic q-py-none row">Aedes Albopictus</span>
      </div>
      <q-tabs v-model="tab" dense class="text-grey" active-color="primary" indicator-color="primary" align="justify"
        narrow-indicator>
        <q-tab name="overview" label="Overview" />
        <q-tab v-if='featureIsValidated' name="review" label="Review" />
      </q-tabs>

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="overview" class="q-py-md">
          <q-list>
            <q-item>
              <q-item-section avatar>
                <q-icon color="primary" name="fa fa-light fa-hashtag" />
              </q-item-section>
              <q-item-section>
                {{ feature?.getProperties().code }}
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar>
                <q-icon color="primary" name="fa fa-light fa-location-dot" />
              </q-item-section>
              <q-item-section>
                {{ featureLocationName }}
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar>
                <q-icon color="primary" name="fa fa-light fa-calendar" />
              </q-item-section>
              <q-item-section>
                {{ featureFormattedDate }}
              </q-item-section>
            </q-item>
            <q-item v-if="featureTags.length">
              <q-item-section avatar>
                <q-icon color="primary" name="fa fa-light fa-tags" />
              </q-item-section>
              <q-item-section>
                <div class="row q-gutter-xs">
                  <q-badge v-for="(item, index) in featureTags" :key="index" rounded color="primary" text-color="white"
                    :label="item" />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-tab-panel>

        <q-tab-panel name="review">
          <q-card flat>
            <q-item>
              <q-item-section avatar>
                <q-avatar icon="fa fa-light fa-users" color="grey-3" />
              </q-item-section>
              <q-item-section>
                <q-item-label>
                  Experts community
                </q-item-label>
                <q-item-label caption>
                  Project member
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-card-section>
              <div class="row q-mb-sm">
                <span class="text-body2 text-uppercase text-grey-7">Confidence level:</span>
                <q-rating :model-value="featureValidationNumCheckMarks" :max='3' readonly color="primary"
                  icon="fa fa-light fa-circle-check" size="xs" class="q-ml-xs" />
              </div>
              <div class="text-justify">
                {{ featureProps.validation_notes }}
              </div>
            </q-card-section>
          </q-card>

        </q-tab-panel>

      </q-tab-panels>
    </q-drawer>
  </div>
</template>

<script lang="ts">

import { useQuasar, colors } from 'quasar'
import { inject, ref, watch, computed } from 'vue'
import { wfs, cdn } from 'boot/axios'

import { fromLonLat } from 'ol/proj'
// import GeoJSON from 'ol/format/GeoJSON'
import Point from 'ol/geom/Point';

// import { SwipeModal } from "@takuma-ru/vue-swipe-modal";
import type { Feature, Map } from 'ol'

export default {
  components: {
    // SwipeModal
  },
  emits: [
    'update:featureId'
  ],
  props: {
    featureId: {
      type: String
    }
  },
  setup(props, { emit }) {
    const $q = useQuasar()
    const map = inject<Map>('map')

    const tab = ref('overview')
    const feature = ref<Feature | null>(null)

    const featureProps = computed(() => {
      return feature.value?.getProperties()
    })

    watch(() => props.featureId, async (newValue) => {
      if (newValue !== undefined) {
        await getData(newValue)
      }
    }, { immediate: true })

    async function getData(featureId: string) {
      try {
        // const geoJson = new GeoJSON()

        const response = await wfs.get('', {
          params: {
            version: '2.0.0',
            request: 'GetFeature',
            typeNames: 'mosquitoalert:reports',
            outputFormat: 'application/json',
            featureID: featureId
          }
        })

        // Check if features array is empty
        if (response.data.features.length === 0) {
          throw new Error('Feature ' + featureId + ' not found.')
        }

        // feature.value = geoJson.readFeature(
        //   response.data.features[0]
        // )
      } catch (error: unknown) {
        console.error(error)
        $q.notify({
          type: 'negative',
          message: (error as Error).message
        })
      }
    }

    const coordinates = computed(() => {
      const geom = feature.value?.getGeometry();
      const view = map?.getView();

      if (!geom || !view) {
        return null;
      }

      if (geom instanceof Point) {
        return fromLonLat(geom.getCoordinates(), view.getProjection());
      }

      return null;
    });
    watch(coordinates, (newValue) => {
      if (newValue === null) {
        return
      }

      map?.getView().animate({
        center: newValue,
        zoom: 15
      })
    })

    const featurePhotoUrl = computed(() => {
      if (featureProps.value?.photo_url === undefined) {
        return ''
      }
      return cdn.defaults.baseURL + featureProps.value?.photo_url
    })

    const featureLocationName = computed(() => {
      if (featureProps.value?.lau_name === undefined) {
        return 'Not available'
      }

      return [featureProps.value.lau_name, featureProps.value.nuts3_name].filter(item => item !== null).join(', ')
    })

    const featureFormattedDate = computed(() => {
      if (featureProps.value?.date === null) {
        return 'Not available'
      }

      const dateFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        timeZone: 'UTC',
        timeZoneName: "short"
      } as const;
      return new Date(featureProps.value?.date).toLocaleDateString(
        $q.lang.isoName,
        dateFormatOptions
      )
    })

    const featureTags = computed(() => {
      if (featureProps.value?.tags == null) {
        return []
      }

      return JSON.parse(featureProps.value.tags.replace(/'/g, '"'))
    })

    const featureIsValidated = computed(() => {
      return featureProps.value?.type === 'adult' && featureProps.value?.validation === 1
    })

    const featureValidationNumCheckMarks = computed(() => {
      switch (featureProps.value?.category.split('_').at(-1)) {
        case 'confirmed':
          return 3
        case 'probable':
          return 2
        default:
          return 1
      }
    })

    const featureValidationIsConfirmed = computed(() => {
      return featureProps.value?.type === 'adult' && featureValidationNumCheckMarks.value === 3
    })

    return {
      colors,
      tab,
      coordinates,
      feature,
      featureProps,
      featurePhotoUrl,
      featureLocationName,
      featureFormattedDate,
      featureTags,
      featureIsValidated,
      featureValidationNumCheckMarks,
      featureValidationIsConfirmed,
      clearFeatureId() {
        emit('update:featureId', undefined)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
:deep(.modal-style) {
  // background-color: white;

  @media (prefers-color-scheme: light) {
    background-color: white;
  }
}

:deep(.swipe-modal-drag-handle-wrapper) {
  background: var(--q-primary);
  padding-top: 10px;
  height: unset;

  .swipe-modal-drag-handle {
    position: absolute;
    left: 50%;
    width: 32px;
    height: 4px;
    margin: 0;
    content: "";
    background-color: lightgray;
    border-radius: 2px;
    transform: translate(-50%);
  }
}
</style>
