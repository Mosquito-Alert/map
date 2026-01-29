<template>
  <inner-drawer :title="$t('reports')" header-height="78.5px" width="400px">
    <q-list separator>
      <q-item-label header class="row q-px-none">
        <span class="text-weight-light text-uppercase text-grey-7">{{ $t('layers') }}</span>
      </q-item-label>
      <!-- MOSQUITO SELECTION -->
      <q-expansion-item dense expand-separator header-class="q-px-none">
        <template v-slot:header>
          <q-item-section avatar>
            <q-avatar icon="fa fat fa-mosquito" />
          </q-item-section>

          <q-item-section class="text-capitalize">
            <div class="row items-center">
              {{ $t('mosquitoes') }}
              <q-badge v-if="mosquitoSelected.length" rounded class="q-ml-sm" color="grey-3" text-color="grey-14"
                :label="mosquitoSelected.length" />
            </div>
          </q-item-section>

          <q-item-section side v-if="mosquitoSelected.length">
            <q-btn flat round icon="fa fat fa-download" size="sm" :loading="downloadProgress.observations.loading"
              :percentage="downloadProgress.observations.percentage"
              @click.stop="showDownloadLicenseDialog(downloadObservations)" />
          </q-item-section>
        </template>
        <q-card>
          <q-card-section class="column">
            <div class="row">
              <q-chip v-for="(item, index) in mosquitoLayers" :key="index" v-model:selected="item.enabled"
                class="no-shadow" :label="item.name" :color="item.enabled ? item.color : 'grey-3'"
                :text-color="item.enabled ? 'white' : 'grey-14'" :icon-selected="item.icon" />
            </div>
            <q-separator inset />
            <div class='row'>
              <q-chip v-for="(item, index) in otherSpeciesLayers" :key="index" v-model:selected="item.enabled"
                class="no-shadow" :label="item.name" :color="item.enabled ? item.color : 'grey-3'"
                :text-color="item.enabled ? 'white' : 'grey-14'" :icon-selected="item.icon" />
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>
      <!-- BREEDING SITES -->
      <q-expansion-item dense expand-separator header-class="q-px-none">
        <template v-slot:header>
          <q-item-section avatar>
            <q-avatar icon="fa fat fa-water" />
          </q-item-section>

          <q-item-section class="text-capitalize">
            <div class="row items-center">
              {{ $t('breeding_sites') }}
              <q-badge v-if="breedingSitesSelected.length" rounded class="q-ml-sm" color="grey-3" text-color="grey-14"
                :label="breedingSitesSelected.length" />
            </div>
          </q-item-section>

          <q-item-section side v-if="breedingSitesSelected.length">
            <q-btn flat round icon="fa fat fa-download" size="sm" :loading="downloadProgress.breedingSites.loading"
              :percentage="downloadProgress.breedingSites.percentage"
              @click.stop="showDownloadLicenseDialog(downloadBreedingSites)" />
          </q-item-section>
        </template>
        <q-card>
          <q-card-section>
            <q-chip v-for="(item, index) in breedingSiteLayers" :key="index" v-model:selected="item.enabled"
              class="no-shadow" :label="item.name" :color="item.enabled ? item.color : 'grey-3'"
              :text-color="item.enabled ? 'white' : 'grey-14'" :icon-selected="item.icon" />
          </q-card-section>
        </q-card>
      </q-expansion-item>
      <!-- BITES -->
      <q-item dense class="q-px-none" :active="bitesEnabled" active-class="text-bites">
        <q-item-section avatar>
          <q-avatar icon="fa fat fa-star-of-life" />
        </q-item-section>

        <q-item-section>
          <q-item-label class="text-capitalize">
            {{ $t('bites') }}
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <div class="row items-center">
            <q-btn v-if="bitesEnabled" flat round icon="fa fat fa-download" size="sm"
              :loading="downloadProgress.bites.loading" :percentage="downloadProgress.bites.percentage"
              @click="showDownloadLicenseDialog(downloadBites)" />
            <q-toggle v-model='bitesEnabled' color="bites" />
          </div>
        </q-item-section>
      </q-item>
      <!-- SAMPLING EFFORT -->
      <q-item dense class="q-px-none" :active="samplingEffortEnabled" active-class="text-sampling-effort">
        <q-item-section avatar>
          <q-avatar icon="fa fa-duotone fa-grid-4" />
        </q-item-section>

        <q-item-section>
          <q-item-label class="text-capitalize">
            {{ $t('sampling_effort') }}
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-toggle v-model='samplingEffortEnabled' color="sampling-effort" />
        </q-item-section>
      </q-item>
    </q-list>
    <!-- FILTERS -->
    <q-separator class="q-my-lg" />
    <p class="text-weight-light text-uppercase text-grey-7 q-px-none">{{ $t('filters') }}</p>
    <q-list separator class="bg-grey-3 rounded-borders">
      <!-- DATE FILTER -->
      <q-item dense>
        <q-item-section avatar>
          <q-icon name="fa fat fa-calendar-days" />
        </q-item-section>

        <q-item-section>
          <DateRangePickerWithPresets v-model="selectedDateRange" :max-date="new Date()"
            :min-date="new Date('2014/06/01')" />
        </q-item-section>
      </q-item>
      <!-- TAGS FILTER -->
      <q-expansion-item dense expand-separator>
        <template v-slot:header>
          <q-item-section avatar>
            <q-avatar icon="fa fat fa-tags" />
          </q-item-section>

          <q-item-section class="text-capitalize">
            {{ $t('tags') }}
          </q-item-section>

          <q-item-section side v-if="tagsSelected.length">
            <q-badge rounded color="grey-4" text-color="grey-14" :label="tagsSelected.length" />
          </q-item-section>
        </template>
        <q-card class="bg-grey-1">
          <q-card-section>
            <q-chip removable :label="tag" color="primary" text-color="white" icon="fa fat fa-tag"
              v-for="tag, index in tagsSelected" :key="index" @remove="deleteTag(index)" />
            <q-btn round unelevated color="grey-4" text-color="grey-14" size="sm" icon="fa fat fa-plus">
              <q-popup-proxy ref="qPopupTag" class="q-pa-sm">
                <q-input ref="qInputTag" dense autofocus v-model="inputTagText" :label="$t('new_tag')"
                  @keyup.enter="addTag" prefix="#" :rules="[val => (val && val.length > 0) || 'Field is required']">
                  <template v-slot:before>
                    <q-icon name="fa fat fa-tag" />
                  </template>
                  <template v-slot:append>
                    <q-btn round dense flat icon="add" @click="addTag" />
                  </template>
                </q-input>
              </q-popup-proxy>
            </q-btn>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </q-list>

  </inner-drawer>

</template>

<script lang="ts">

// import { date } from 'quasar'
import { useQuasar, exportFile } from 'quasar'
import { ref, computed, watch, onMounted, inject } from 'vue'
// import { useRoute, useRouter } from 'vue-router'
import { useRoute } from 'vue-router'
import { useI18n } from "vue-i18n"

import InnerDrawer from 'src/components/InnerDrawer.vue'
import DateRangePickerWithPresets from 'src/components/DateRangePickerWithPresets.vue'
import type { DateRange } from 'src/types/date'
// import { watchEffect } from 'vue'

import type { Map } from 'ol'
import GeoJSON from 'ol/format/GeoJSON'
import type Polygon from 'ol/geom/Polygon';
import type MultiPolygon from 'ol/geom/MultiPolygon';

import { bitesApi, breedingSitesApi, observationsApi } from 'src/boot/api'
import { mosquitoTaxonIds, breedingSiteTypes } from 'src/utils/constants';
import type { AxiosResponse, AxiosProgressEvent } from 'axios'

export default {
  components: {
    InnerDrawer,
    DateRangePickerWithPresets
  },
  emits: [
    'update-layers:mosquitoes',
    'update-layers:breeding-sites',
    'update-layers:bites',
    'update-layers:sampling-effort',
    'update-filters:tags',
    'update-filters:date'
  ],
  props: {
    selectedLocationPolygon: {
      type: Object as () => Polygon | MultiPolygon | null,
      default: null
    }
  },
  setup(props, { emit }) {
    const $q = useQuasar()
    const { t } = useI18n()
    const route = useRoute()
    // const router = useRouter()

    const map = inject<Map>('map')

    // LAYERS
    const mosquitoLayers = ref({
      albopictus: {
        name: ref(t('tiger_mosquito')),
        enabled: false,
        color: 'albopictus',
        icon: "fa fa-location-dot"
      },
      aegypti: {
        name: ref(t('yellow_fever_mosquito')),
        enabled: false,
        color: 'aegypti',
        icon: "fa fa-location-dot"
      },
      japonicus: {
        name: ref(t('asian_bush_mosquito')),
        enabled: false,
        color: 'japonicus',
        icon: "fa fa-location-dot"
      },
      koreicus: {
        name: ref(t('korean_mosquito')),
        enabled: false,
        color: 'koreicus',
        icon: "fa fa-location-dot"
      },
      culex: {
        name: ref(t('common_mosquito')),
        enabled: false,
        color: 'culex',
        icon: "fa fa-location-dot"
      }
    })

    const otherSpeciesLayers = ref({
      unidentified: {
        name: ref(t('unidentified_mosquito')),
        enabled: false,
        color: 'unidentified-mosquito',
        icon: 'fa fa-location-question'
      },
      other: {
        name: ref(t('other_species')),
        enabled: false,
        color: 'other-species',
        icon: 'fa fa-location-pin'
      }
    })

    const mosquitoSelected = computed(() => {
      const layers = { ...mosquitoLayers.value, ...otherSpeciesLayers.value }
      return (Object.keys(layers) as Array<keyof typeof layers>).filter(key => layers[key].enabled)
    })
    watch(mosquitoSelected, (newValue) => {
      emit('update-layers:mosquitoes', newValue)
    })

    const breedingSiteLayers = ref({
      stormDrainWater: {
        name: ref(t('storm_drain_water')),
        enabled: false,
        color: 'breeding-site',
        icon: 'fa fa-droplet'
      },
      stormDrainDry: {
        name: ref(t('storm_drain_dry')),
        enabled: false,
        color: 'breeding-site',
        icon: 'fa fa-droplet-slash'
      },
      other: {
        name: ref(t('other_sites')),
        enabled: false,
        color: 'breeding-site',
        icon: 'fa fa-tank-water'
      }
    })

    const breedingSitesSelected = computed(() => {
      return (Object.keys(breedingSiteLayers.value) as Array<keyof typeof breedingSiteLayers.value>).filter(key => breedingSiteLayers.value[key].enabled)
    })
    watch(breedingSitesSelected, (newValue) => {
      emit('update-layers:breeding-sites', newValue)
    })

    const bitesEnabled = ref(false)
    watch(bitesEnabled, (newValue) => {
      emit('update-layers:bites', newValue)
    })
    const samplingEffortEnabled = ref(false)
    watch(samplingEffortEnabled, (newValue) => {
      emit('update-layers:sampling-effort', newValue)
    })

    // FILTERS
    // const selectedDateRange = ref<DateRange>({ 'from': null, 'to': null })
    const selectedDateRange = ref<DateRange>({
      from: new Date(new Date().getFullYear(), 0, 1), // January 1st of current year
      to: new Date() // today
    });
    watch(selectedDateRange, (newValue) => {
      emit('update-filters:date', newValue)
    }, {
      immediate: true,
      deep: true
    })

    const qPopupTag = ref()
    const qInputTag = ref()
    const inputTagText = ref()
    const tagsSelected = ref<string[]>([])
    watch(tagsSelected, (newValue) => {
      emit('update-filters:tags', newValue)
    }, { deep: true })

    const downloadProgress = ref({
      bites: {
        loading: false,
        percentage: 0
      },
      observations: {
        loading: false,
        percentage: 0
      },
      breedingSites: {
        loading: false,
        percentage: 0
      }
    })
    async function downloadBites() {
      downloadProgress.value.bites.loading = true;
      downloadProgress.value.bites.percentage = 0;

      await bitesApi.list({
        format: 'csv',
        receivedAtAfter: selectedDateRange.value.from ? selectedDateRange.value.from.toISOString() : undefined,
        receivedAtBefore: selectedDateRange.value.to ? selectedDateRange.value.to.toISOString() : undefined,
        tags: tagsSelected.value.length ? tagsSelected.value : undefined,
        withinGeom: props.selectedLocationPolygon
          ? JSON.stringify(new GeoJSON().writeGeometryObject(props.selectedLocationPolygon, {
            dataProjection: 'EPSG:4326',
            featureProjection: map!.getView().getProjection()
          }))
          : undefined
      }, {
        onDownloadProgress: (event: AxiosProgressEvent) => {
          if (event.total) {
            downloadProgress.value.bites.percentage = Math.round((event.loaded * 100) / event.total);
          }
        }
      }).then((response: AxiosResponse) => {
        exportFile('bites.csv', response.data, 'text/csv')
        downloadProgress.value.bites.percentage = 100
      }).finally(() => {
        downloadProgress.value.bites.loading = false;
        downloadProgress.value.bites.percentage = 0;
      })
    }

    async function downloadObservations() {
      downloadProgress.value.observations.loading = true;
      downloadProgress.value.observations.percentage = 0;

      const taxonIds = mosquitoSelected.value == Object.keys(mosquitoLayers.value) ? undefined :
        mosquitoSelected.value.map(key => mosquitoTaxonIds[key]).flat();

      await observationsApi.list({
        format: 'csv',
        identificationTaxonIds: taxonIds?.length ? taxonIds.map(String) : undefined,
        receivedAtAfter: selectedDateRange.value.from ? selectedDateRange.value.from.toISOString() : undefined,
        receivedAtBefore: selectedDateRange.value.to ? selectedDateRange.value.to.toISOString() : undefined,
        tags: tagsSelected.value.length ? tagsSelected.value : undefined,
        withinGeom: props.selectedLocationPolygon
          ? JSON.stringify(new GeoJSON().writeGeometryObject(props.selectedLocationPolygon, {
            dataProjection: 'EPSG:4326',
            featureProjection: map!.getView().getProjection()
          }))
          : undefined
      }, {
        onDownloadProgress: (event: AxiosProgressEvent) => {
          if (event.total) {
            downloadProgress.value.observations.percentage = Math.round((event.loaded * 100) / event.total);
          }
        }
      }).then((response: AxiosResponse) => {
        exportFile('observations.csv', response.data, 'text/csv')
        downloadProgress.value.observations.percentage = 100
      }).finally(() => {
        downloadProgress.value.observations.loading = false;
        downloadProgress.value.observations.percentage = 0;
      })
    }

    async function downloadBreedingSites() {
      downloadProgress.value.breedingSites.loading = true;
      downloadProgress.value.breedingSites.percentage = 0;

      const breedingSiteTypesSelected = breedingSitesSelected.value.map(key => {
        if (key === 'stormDrainWater') {
          return breedingSiteTypes.stormDrain;
        } else if (key === 'stormDrainDry') {
          return breedingSiteTypes.stormDrain;
        } else if (key === 'other') {
          return breedingSiteTypes.other;
        }
        return [];
      }).flat();

      await breedingSitesApi.list({
        format: 'csv',
        siteType: breedingSiteTypesSelected.length ? breedingSiteTypesSelected : undefined,
        receivedAtAfter: selectedDateRange.value.from ? selectedDateRange.value.from.toISOString() : undefined,
        receivedAtBefore: selectedDateRange.value.to ? selectedDateRange.value.to.toISOString() : undefined,
        tags: tagsSelected.value.length ? tagsSelected.value : undefined,
        withinGeom: props.selectedLocationPolygon
          ? JSON.stringify(new GeoJSON().writeGeometryObject(props.selectedLocationPolygon, {
            dataProjection: 'EPSG:4326',
            featureProjection: map!.getView().getProjection()
          }))
          : undefined
      }, {
        onDownloadProgress: (event: AxiosProgressEvent) => {
          if (event.total) {
            downloadProgress.value.breedingSites.percentage = Math.round((event.loaded * 100) / event.total);
          }
        }
      }).then((response: AxiosResponse) => {
        exportFile('breeding_sites.csv', response.data, 'text/csv')
        downloadProgress.value.breedingSites.percentage = 100
      }).finally(() => {
        downloadProgress.value.breedingSites.loading = false;
        downloadProgress.value.breedingSites.percentage = 0;
      })
    }

    function showDownloadLicenseDialog(callback?: () => Promise<void>) {
      $q.dialog({
        title: t('data_license'),
        message: t('data_license_description').replace(/\\n/g, '<br>'),
        html: true,
        style: 'width: min(100%, 800px);',
        options: {
          type: 'checkbox',
          model: [],
          isValid: model => model.includes('accept'),
          items: [
            { label: t('i_understand_and_accept_license'), value: 'accept', color: 'primary' },
          ]
        },
        cancel: true,
        persistent: true
      }).onOk(() => {
        if (callback) {
          void callback();
        }
      });
    }

    onMounted(() => {
      // Init mosquito layer depending on the route query params
      // const mosquitoLayersToEnable = route.query.mosquitoes?.split(',')
      // if (mosquitoLayersToEnable !== undefined) {
      //   Object.keys(mosquitoLayers.value).forEach(key => {
      //     mosquitoLayers.value[key].enabled = mosquitoLayersToEnable.includes(key)
      //   })
      // }

      // Init breeding sites layer depending on the route query params
      // const breedingSitesLayersToEnable = route.query.breeding_sites?.split(',')
      // if (breedingSitesLayersToEnable !== undefined) {
      //   Object.keys(breedingSiteLayers.value).forEach(key => {
      //     breedingSiteLayers.value[key].enabled = breedingSitesLayersToEnable.includes(key)
      //   })
      // }

      // Init bites layer depending on the route query params
      if (route.query.bites !== undefined) {
        bitesEnabled.value = route.query.bites === 'true'
      }

      // Init sampling effort layer depending on the route query params
      if (route.query.sampling_effort !== undefined) {
        samplingEffortEnabled.value = route.query.sampling_effort === 'true'
      }

      // Init date filter
      // if (route.query.from !== undefined) {
      //   selectedDateRange.value = {
      //     'from': new Date(route.query.from),
      //     'to': new Date(route.query.to || date.formatDate(new Date(), 'YYYY/MM/DD'))
      //   }
      // }

      // Init tags filter
      // const tagsToEnable = route.query.tags?.split(',')
      // if (tagsToEnable !== undefined) {
      //   tagsSelected.value = tagsToEnable
      // }
    })

    // watchEffect(() => {
    //   router.push({
    //     ...route,
    //     params: {
    //       ...route.params
    //     },
    //     query: {
    //       ...route.query,
    //       ...{
    //         mosquitoes: mosquitoSelected.value.join(',') || undefined,
    //         breeding_sites: breedingSitesSelected.value?.join(',') || undefined,
    //         bites: bitesEnabled.value || undefined,
    //         sampling_effort: samplingEffortEnabled.value || undefined,
    //         from: date.formatDate(selectedDateRange.value?.from, 'YYYY/MM/DD') || undefined,
    //         to: date.formatDate(selectedDateRange.value?.to, 'YYYY/MM/DD') || undefined,
    //         tags: tagsSelected.value?.join(',') || undefined
    //       }
    //     }
    //   })
    // })

    return {
      mosquitoLayers,
      otherSpeciesLayers,
      breedingSiteLayers,
      selectedDateRange,
      mosquitoSelected,
      breedingSitesSelected,
      bitesEnabled,
      samplingEffortEnabled,
      qPopupTag,
      qInputTag,
      tagsSelected,
      inputTagText,
      downloadProgress,
      showDownloadLicenseDialog,
      downloadBites,
      downloadObservations,
      downloadBreedingSites,
      addTag() {
        qInputTag.value.validate()

        if (!qInputTag.value.hasError) {
          tagsSelected.value.push(inputTagText.value)
          inputTagText.value = undefined
          qPopupTag.value.hide()
        }
      },
      deleteTag(index: number) {
        tagsSelected.value.splice(index, 1)
      }
    }
  }
}

</script>
