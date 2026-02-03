<template>
  <inner-drawer :title="$t('reports')" :init-collapsed="initCollapsed" header-height="78.5px" width="400px">
    <q-list separator>
      <q-item-label header class="row q-px-none">
        <span class="text-weight-light text-uppercase text-grey-7">{{ $t('layers') }}</span>
      </q-item-label>
      <!-- MOSQUITO SELECTION -->
      <q-expansion-item :model-value="mosquitoSelected.length > 0" dense expand-separator header-class="q-px-none">
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
                class="no-shadow" :label="$t(item.name_key)" :color="item.enabled ? item.color : 'grey-3'"
                :text-color="item.enabled ? 'white' : 'grey-14'" :icon-selected="item.icon" />
            </div>
            <q-separator inset />
            <div class='row'>
              <q-chip v-for="(item, index) in otherSpeciesLayers" :key="index" v-model:selected="item.enabled"
                class="no-shadow" :label="$t(item.name_key)" :color="item.enabled ? item.color : 'grey-3'"
                :text-color="item.enabled ? 'white' : 'grey-14'" :icon-selected="item.icon" />
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>
      <!-- BREEDING SITES -->
      <q-expansion-item :model-value="breedingSitesSelected.length > 0" dense expand-separator header-class="q-px-none">
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
              class="no-shadow" :label="$t(item.name_key)" :color="item.enabled ? item.color : 'grey-3'"
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
        <q-item-section avatar class="items-center">
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

          <q-item-section class="text-capitalize text-grey-14">
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

import { useQuasar, exportFile } from 'quasar'
import { ref, computed, watch } from 'vue'
import { useI18n } from "vue-i18n"

import InnerDrawer from 'src/components/InnerDrawer.vue'
import DateRangePickerWithPresets from 'src/components/DateRangePickerWithPresets.vue'
import type { DateRange } from 'src/types/date'

import { bitesApi, breedingSitesApi, observationsApi } from 'src/boot/api'
import { mosquitoTaxonIds, breedingSiteTypes } from 'src/utils/constants';
import type { AxiosResponse, AxiosProgressEvent } from 'axios'
import { useBoundaryStore } from 'src/stores/boundaryStore'

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
    enabledMosquitoes: {
      type: Array as () => string[],
      required: false,
      default: () => []
    },
    enabledBites: {
      type: Boolean,
      required: false,
      default: false
    },
    enabledBreedingSites: {
      type: Array as () => string[],
      required: false,
      default: () => []
    },
    enabledSamplingEffort: {
      type: Boolean,
      required: false,
      default: false
    },
    fromDate: {
      type: Date,
      required: false,
      default: null
    },
    toDate: {
      type: Date,
      required: false,
      default: null
    },
    tags: {
      type: Array as () => string[],
      required: false,
      default: () => []
    },
  },
  setup(props, { emit }) {
    const $q = useQuasar()
    const { t } = useI18n()

    const boundaryStore = useBoundaryStore();

    // LAYERS
    const mosquitoLayers = ref({
      albopictus: {
        name_key: 'tiger_mosquito',
        enabled: props.enabledMosquitoes?.includes('albopictus') || false,
        color: 'albopictus',
        icon: "fa fa-location-dot"
      },
      aegypti: {
        name_key: 'yellow_fever_mosquito',
        enabled: props.enabledMosquitoes?.includes('aegypti') || false,
        color: 'aegypti',
        icon: "fa fa-location-dot"
      },
      japonicus: {
        name_key: 'asian_bush_mosquito',
        enabled: props.enabledMosquitoes?.includes('japonicus') || false,
        color: 'japonicus',
        icon: "fa fa-location-dot"
      },
      koreicus: {
        name_key: 'korean_mosquito',
        enabled: props.enabledMosquitoes?.includes('koreicus') || false,
        color: 'koreicus',
        icon: "fa fa-location-dot"
      },
      culex: {
        name_key: 'common_mosquito',
        enabled: props.enabledMosquitoes?.includes('culex') || false,
        color: 'culex',
        icon: "fa fa-location-dot"
      }
    })

    const otherSpeciesLayers = ref({
      unidentified: {
        name_key: 'unidentified_mosquito',
        enabled: props.enabledMosquitoes?.includes('unidentified') || false,
        color: 'unidentified-mosquito',
        icon: 'fa fa-location-question'
      },
      other: {
        name_key: 'other_species',
        enabled: props.enabledMosquitoes?.includes('other') || false,
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
        name_key: 'storm_drain_water',
        enabled: props.enabledBreedingSites?.includes('stormDrainWater') || false,
        color: 'breeding-site',
        icon: 'fa fa-droplet'
      },
      stormDrainDry: {
        name_key: 'storm_drain_dry',
        enabled: props.enabledBreedingSites?.includes('stormDrainDry') || false,
        color: 'breeding-site',
        icon: 'fa fa-droplet-slash'
      },
      other: {
        name_key: 'other_sites',
        enabled: props.enabledBreedingSites?.includes('other') || false,
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

    const bitesEnabled = ref(props.enabledBites)
    watch(bitesEnabled, (newValue) => {
      emit('update-layers:bites', newValue)
    })
    const initCollapsed = computed(() => {
      return $q.platform.is.mobile && (
        mosquitoSelected.value.length > 0 ||
        breedingSitesSelected.value.length > 0 ||
        bitesEnabled.value
      )
    })

    const samplingEffortEnabled = ref(props.enabledSamplingEffort)
    watch(samplingEffortEnabled, (newValue) => {
      emit('update-layers:sampling-effort', newValue)
    })

    // FILTERS
    const selectedDateRange = ref<DateRange>({
      from: props.fromDate,
      to: props.toDate
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
    const tagsSelected = ref<string[]>(props.tags || [])
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

      const selectedBoundary = await boundaryStore.getTemporalBoundary();

      await bitesApi.list({
        format: 'csv',
        receivedAtAfter: selectedDateRange.value.from ? selectedDateRange.value.from.toISOString() : undefined,
        receivedAtBefore: selectedDateRange.value.to ? selectedDateRange.value.to.toISOString() : undefined,
        tags: tagsSelected.value.length ? tagsSelected.value : undefined,
        boundaryUuid: selectedBoundary ? selectedBoundary.uuid : undefined,
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

      const selectedBoundary = await boundaryStore.getTemporalBoundary();

      await observationsApi.list({
        format: 'csv',
        identificationTaxonIds: taxonIds?.length ? taxonIds.map(String) : undefined,
        receivedAtAfter: selectedDateRange.value.from ? selectedDateRange.value.from.toISOString() : undefined,
        receivedAtBefore: selectedDateRange.value.to ? selectedDateRange.value.to.toISOString() : undefined,
        tags: tagsSelected.value.length ? tagsSelected.value : undefined,
        boundaryUuid: selectedBoundary ? selectedBoundary.uuid : undefined,
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

      const selectedBoundary = await boundaryStore.getTemporalBoundary();

      await breedingSitesApi.list({
        format: 'csv',
        siteType: breedingSiteTypesSelected.length ? breedingSiteTypesSelected : undefined,
        receivedAtAfter: selectedDateRange.value.from ? selectedDateRange.value.from.toISOString() : undefined,
        receivedAtBefore: selectedDateRange.value.to ? selectedDateRange.value.to.toISOString() : undefined,
        tags: tagsSelected.value.length ? tagsSelected.value : undefined,
        boundaryUuid: selectedBoundary ? selectedBoundary.uuid : undefined,
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

    return {
      mosquitoLayers,
      otherSpeciesLayers,
      breedingSiteLayers,
      selectedDateRange,
      mosquitoSelected,
      breedingSitesSelected,
      bitesEnabled,
      initCollapsed,
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
