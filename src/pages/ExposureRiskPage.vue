<template>
  <inner-drawer :title="$t('exposure_risk')">
    <q-select label="Select species" :label-color="selectedSpeciesCode ? 'primary' : 'rgba(0, 0, 0, 0.6)'"
      :options="vectorOptions" option-value="code" option-label="label" color="primary" emit-value map-options
      v-model="selectedSpeciesCode" @update:model-value="selectedDate = undefined" />
    <q-input label="Month / Year" class='text-capitalize' :label-color="selectedDate ? 'primary' : 'rgba(0, 0, 0, 0.6)'"
      :disable="!selectedSpeciesCode" :model-value="selectedDateString" readonly>
      <template v-slot:append>
        <q-icon name="event" class="cursor-pointer" color="primary">
          <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
            <q-date title="Select model date" :navigation-min-year-month="minYearMonthPickerValue"
              :navigation-max-year-month="maxYearMonthPickerValue" default-view="Years" color="primary"
              years-in-month-view emit-immediately mask="YYYY/MM" v-model="qDateModel"
              @update:model-value="dateUpdated" />
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>

    <div class='q-mt-lg' v-if="formIsValid">
      <!-- LAYER CONTROLS -->
      <div v-show="selectedSpeciesCode" class="q-mt-xl">
        <div class="row">
          <span class="text-weight-light text-uppercase text-grey-7">Layer Controls</span>
          <q-space />
          <q-btn-group flat stretch class="bg-grey-1">
            <q-btn icon="fa fat fa-info" size="xs" @click="showInfoDialog()" />
            <q-btn icon="fa fat fa-download" size="xs" />
          </q-btn-group>
        </div>
        <div class="row bg-grey-3 rounded-borders q-pa-sm">
          <div class="col-9">
            <q-badge :outline="!visibleLayer" color="primary" label="Opacity" />
            <q-slider v-model="opacityLayer" :min="0" :max="1" :step="0.05" color="primaray" label />
          </div>
          <q-toggle v-model="visibleLayer" class="col" checked-icon="check" color="primaray" size="lg" />
        </div>
      </div>
      <!-- LEGEND + FILTERS -->
      <div v-if="visibleLayer">
        <!-- LEGEND -->
        <div class="q-ma-xs">
          <!-- LABELS -->
          <div class="row justify-between q-mt-lg">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>
          <!-- PALETTE -->
          <div class="row" :style="{ 'opacity': opacityLayer, 'height': '25px' }">
            <div class="col" v-for="(color, index) in palette" :key="index" :style="{ 'background-color': color }">
            </div>
          </div>
        </div>
        <!-- FILTERS -->
        <q-separator class='q-my-lg' inset />
        <div>
          <span class="text-weight-light text-uppercase text-grey-7">Filters</span>
          <div class="bg-grey-3 rounded-borders">
            <q-list>
              <!-- CERTAINTY FILTER -->
              <q-item>
                <q-item-section avatar class="column flex-center">
                  <q-icon name="fas fa-handshake" color="primary" />
                  <q-item-label class="text-grey-8">
                    Certainty
                  </q-item-label>
                </q-item-section>
                <q-item-section>
                  <q-range v-model="localFilter.certaintyRange" :min="0.0" :max="1.0" :step="0.05" label drag-range
                    color="primary" />
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>
      </div>
    </div>
  </inner-drawer>

  <ExposureRiskMapLayer v-if="formIsValid && selectedSpeciesCode && selectedDate" :level="1"
    :visible="visibleLayer" :opacity="opacityLayer" :species-code="selectedSpeciesCode" :date="selectedDate"
    :palette="palette" :filters="localFilter" />
</template>

<script lang="ts">

import { useQuasar, date } from 'quasar'
import { useI18n } from 'vue-i18n'
import { cdn } from 'boot/axios'

import { computed, ref, onMounted, watch, onUnmounted } from 'vue'
// import { useRouter, useRoute } from 'vue-router'

import { useMapUiStore } from 'src/stores/mapUI';

import InnerDrawer from 'src/components/InnerDrawer.vue'
import ExposureRiskMapLayer from 'src/components/ExposureRiskMapLayer.vue'

interface ModelEntry {
  fromYear: string;
  fromMonth: string;
  toYear: string;
  toMonth: string;
  cell: string;
}

export default {
  name: 'ExposureRiskPage',
  components: {
    InnerDrawer,
    ExposureRiskMapLayer
  },
  props: {
    speciesCode: {
      type: String
    },
    date: {
      type: Date,
      validator(value: Date) {
        return value <= new Date()
      }
    },
    filters: {
      type: Object
    }
  },
  setup(props) {
    // const route = useRoute()
    // const router = useRouter()

    const mapUi = useMapUiStore();

    const $q = useQuasar()
    const { t } = useI18n()
    // Ref for controlling month picker visibility
    const qDateProxy = ref()

    const palette = ref(['#fef0d9', '#fdd49e', '#fdbb84', '#fc8d59', '#e34a33', '#b30000'])

    // Object to store models manifest
    const modelsManifest: Record<string, ModelEntry> = {}
    const speciesModelManifest = computed(() => {
      const code = selectedSpeciesCode.value;
      return code ? modelsManifest[code] : undefined;
    });

    const selectedSpeciesCode = ref<string | undefined>(props.speciesCode)
    const selectedDate = ref(props.date)
    const qDateModel = ref()
    watch(selectedDate, (newValue,) => {
      if (selectedDate.value) {
        // Same mask as in q-date
        qDateModel.value = date.formatDate(newValue, qDateProxy.value.mask)
      } else {
        qDateModel.value = undefined
      }
    })

    const selectedDateString = computed(() => {
      return selectedDate.value?.toLocaleDateString(
        $q.lang.isoName || 'en',
        { year: 'numeric', month: 'long' }
      )
    })

    // Computed properties for setting min and max values for the year-month picker
    const minYearMonthPickerValue = computed(() => speciesModelManifest.value ? `${speciesModelManifest.value.fromYear}/${speciesModelManifest.value.fromMonth}` : undefined)
    const maxYearMonthPickerValue = computed(() => speciesModelManifest.value ? `${speciesModelManifest.value.toYear}/${speciesModelManifest.value.toMonth}` : undefined)

    // Computed property for checking form validity
    const formIsValid = computed(() => {
      // Check that both selectedSpeciesCode and selectedDate have values
      return [selectedSpeciesCode.value, selectedDate.value].every(value => value !== undefined)
    })

    const visibleLayer = ref(true)
    const opacityLayer = ref(1)

    const localFilter = ref({
      ...{
        certaintyRange: {
          min: 0,
          max: 1
        }
      },
      ...props.filters
    })

    const vectorOptions = computed(() => {
      return [
        // Code is used also for building the CSV urls paths.
        { code: 'albopictus', label: 'Tiger mosquito' },
        { code: 'aegypti', label: 'Yellow fever mosquito' },
        { code: 'japonicus', label: 'Japonicus mosquito' },
        { code: 'koreicus', label: 'Koreicus mosquito' },
        { code: 'culex', label: 'Culex mosquito' },
        { code: 'biting', label: 'Bites' }
      ]
    })

    onMounted(() => {
      mapUi.setGrayscale(true);
      cdn.get('static/models/global_minimal_model_estimates/model_manifest.csv')
        .then((resp) => {
          // Read csv manifest
          const lines = resp.data.split(/\r?\n/)
          const headers = lines[0].toLowerCase().split(',')
          const targetIdx = headers.indexOf('target')
          const fromIdx = headers.indexOf('from')
          const toIdx = headers.indexOf('to')
          const cellIdx = headers.indexOf('cell')
          for (let i = 1; i < lines.length; i++) {
            if (lines[i] === '') break
            const currentLine = lines[i].split(',')
            const target = currentLine[targetIdx].toLowerCase()
            const from = currentLine[fromIdx].toLowerCase().split('-')
            const to = currentLine[toIdx].toLowerCase().split('-')
            const cell = currentLine[cellIdx].toLowerCase()
            let cellValue = 'true'
            if (cell !== '') {
              cellValue = currentLine[cellIdx].toLowerCase()
            }
            modelsManifest[target] = {
              fromYear: from[0],
              fromMonth: from[1].padStart(2, '0'),
              toYear: to[0],
              toMonth: to[1].padStart(2, '0'),
              cell: cellValue
            }
          }
        })
        .catch(() => {
          $q.notify({
            color: 'negative',
            position: 'bottom',
            message: 'Loading failed',
            icon: 'report_problem'
          })
        })
    })

    onUnmounted(() => {
      mapUi.setGrayscale(false);
    })

    function showInfoDialog() {
      $q.dialog({
        title: t('information'),
        message: t('models_layer_info').replace(/\\n/g, '<br>'),
        html: true,
        style: 'width: min(100%, 800px);',
      })
    }

    // watchEffect(() => {
    //   const newParams = [selectedSpeciesCode, selectedDate].every(item => item.value !== undefined) ?
    //     {
    //       speciesCode: selectedSpeciesCode.value,
    //       date: date.formatDate(selectedDate.value, 'YYYY-MM-DD')
    //     } : {}

    //   router.push({
    //     ...route,
    //     params: newParams,
    //     query: {
    //       ...route.query,
    //       ...{
    //         certainty_min: localFilter.value.certaintyRange.min > 0 ? localFilter.value.certaintyRange.min : undefined,
    //         certainty_max: localFilter.value.certaintyRange.max < 1 ? localFilter.value.certaintyRange.max : undefined

    //       }
    //     }
    //   })
    // })

    return {
      selectedSpeciesCode,
      vectorOptions,
      qDateModel,
      selectedDateString,
      selectedDate,
      qDateProxy,
      minYearMonthPickerValue,
      maxYearMonthPickerValue,
      formIsValid,
      visibleLayer,
      opacityLayer,
      palette,
      localFilter,
      showInfoDialog,
      dateUpdated(val: unknown, reason: string, details: { year: number; month: number }) {
        // Called when calendar is clicked
        if (reason === 'month') {
          selectedDate.value = new Date(details.year, details.month - 1)
          // Once month is selected, hide the datePicker.
          qDateProxy.value.hide()
        }
      }
    }
  }
}
</script>
