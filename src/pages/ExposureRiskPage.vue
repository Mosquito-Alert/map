<template>
  <inner-drawer :title="$t('exposure_risk')" :init-collapsed="$q.platform.is.mobile && formIsValid">
    <q-select :key="$i18n.locale" :label="$t('select_species')"
      :label-color="selectedSpeciesCode ? 'primary' : 'rgba(0, 0, 0, 0.6)'" :options="vectorOptions" option-value="code"
      option-label="label" color="primary" emit-value map-options v-model="selectedSpeciesCode"
      @update:model-value="selectedDate = undefined" />
    <q-input :label="$t('month') + ' / ' + $t('year')" class='text-capitalize'
      :label-color="selectedDate ? 'primary' : 'rgba(0, 0, 0, 0.6)'" :disable="!selectedSpeciesCode"
      :model-value="selectedDateString" readonly>
      <template v-slot:append>
        <q-icon name="event" class="cursor-pointer" color="primary">
          <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
            <q-date :title="$t('select_month')" :navigation-min-year-month="minYearMonthPickerValue"
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
          <span class="text-weight-light text-uppercase text-grey-7">{{ $t('layer_controls') }}</span>
          <q-space />
          <q-btn-group flat stretch class="bg-grey-1">
            <q-btn icon="fa fat fa-info" size="xs" @click="showInfoDialog()" />
          </q-btn-group>
        </div>
        <div class="row bg-grey-3 rounded-borders q-pa-sm">
          <div class="col-9">
            <q-badge :outline="!visibleLayer" color="primary" :label="$t('opacity')" />
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
            <span>{{ $t('low') }}</span>
            <span>{{ $t('medium') }}</span>
            <span>{{ $t('high') }}</span>
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
          <span class="text-weight-light text-uppercase text-grey-7">{{ $t('filters') }}</span>
          <div class="bg-grey-3 rounded-borders">
            <q-list>
              <!-- CERTAINTY FILTER -->
              <q-item>
                <q-item-section avatar class="column flex-center">
                  <q-icon name="fas fa-handshake" color="primary" />
                  <q-item-label class="text-grey-8">
                    {{ $t('certainty') }}
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

  <ExposureRiskMapLayer v-if="formIsValid && selectedSpeciesCode && selectedDate" :level="1" :visible="visibleLayer"
    :opacity="opacityLayer" :species-code="selectedSpeciesCode" :date="selectedDate" :palette="palette"
    :filters="localFilter" />
  <ExposureRiskMapLayer v-if="formIsValid && selectedSpeciesCode && selectedDate" :level="2" :visible="visibleLayer"
    :opacity="opacityLayer" :species-code="selectedSpeciesCode" :date="selectedDate" :palette="palette"
    :filters="localFilter" />
  <ExposureRiskMapLayer v-if="formIsValid && selectedSpeciesCode && selectedDate" :level="3" :min-zoom="7"
    :visible="visibleLayer" :opacity="opacityLayer" :species-code="selectedSpeciesCode" :date="selectedDate"
    :palette="palette" :filters="localFilter" />
  <ExposureRiskMapLayer v-if="formIsValid && selectedSpeciesCode && selectedDate" :level="4" :min-zoom="10"
    :visible="visibleLayer" :opacity="opacityLayer" :species-code="selectedSpeciesCode" :date="selectedDate"
    :palette="palette" :filters="localFilter" />
</template>

<script setup lang="ts">

import { useQuasar, date } from 'quasar'
import { useI18n } from 'vue-i18n'
import { cdn } from 'boot/axios'

import { computed, ref, onMounted, watch, onUnmounted, reactive } from 'vue'
import { useRouteQuery, useRouteParams } from '@vueuse/router'

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

const selectedSpeciesCode = useRouteParams('speciesCode', '', { transform: String })

// Treat dates from useRouteParams. See: https://github.com/vueuse/vueuse/issues/2663#issuecomment-1952493495
// In JS [] === [] is false, and vue watch detect changes everytime.
const selectedDateQuery = useRouteParams<string>('date', '');
const selectedDate = computed<Date | undefined>({
  get() {
    if (!selectedDateQuery.value) return undefined;
    return date.extractDate(selectedDateQuery.value, 'YYYY-MM');
  },
  set(val: Date | undefined) {
    if (!val) {
      selectedDateQuery.value = '';
      return;
    }
    selectedDateQuery.value = date.formatDate(val, 'YYYY-MM');
  },
})

const certaintyMin = useRouteQuery('certainty_min', '0', { transform: Number })
const certaintyMax = useRouteQuery('certainty_max', '1', { transform: Number })

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

const localFilter = reactive({
  certaintyRange: {
    min: certaintyMin.value,
    max: certaintyMax.value
  }
})
watch(
  () => localFilter.certaintyRange,
  (newRange) => {
    certaintyMin.value = newRange.min
    certaintyMax.value = newRange.max
  },
  { deep: true }
)

const vectorOptions = computed(() => {
  return [
    // Code is used also for building the CSV urls paths.
    { code: 'albopictus', label: t('tiger_mosquito') },
    { code: 'aegypti', label: t('yellow_fever_mosquito') },
    { code: 'japonicus', label: t('asian_bush_mosquito') },
    { code: 'koreicus', label: t('korean_mosquito') },
    { code: 'culex', label: t('common_mosquito') },
    { code: 'biting', label: t('bites') }
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

function dateUpdated(val: unknown, reason: string, details: { year: number; month: number }) {
  // Called when calendar is clicked
  if (reason === 'month') {
    selectedDate.value = new Date(details.year, details.month - 1)
    // Once month is selected, hide the datePicker.
    qDateProxy.value.hide()
  }
}
</script>
