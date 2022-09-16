<template>
  <q-drawer
    show-if-above
    side="left"
    behavior="desktop"
    width=""
    v-touch-swipe.mouse.left="toggleLeftDrawer"
  >
    <!-- Main menu -->
    <left-menu item="models" />

    <!-- Drawer content -->
    <div class="toc-models"
      :class="expanded?'expanded':'collapsed'"
    >
      <div v-if="mobile">
        <q-icon
          name="close"
          class="close-menu"
          @click="toggleLeftDrawer"
        />
      </div>

      <div>
        <div class="category-box q-my-md">
          <q-select
            :label="_('Models')"
            v-model="model"
            color="orange"
            :label-color="model?'orange':'rgba(0, 0, 0, 0.6)'"
            :options="options"
            :option-value="'code'"
            :option-label="'type'"
            @update:model-value="filterModels"
          />

        </div>

        <q-input
          v-if="model"
          readonly
          class="calendar-input"
          input-class="cursor-pointer"
          :label="_('Month / Year')"
          v-model="inputDate"
          mask="##/####"
          :label-color="dateSelected?'orange':'rgba(0, 0, 0, 0.6)'"
          ref="refInput"
          @click="showCalendar"
        >
          <template v-slot:append>
            <q-icon ref="modelsCalendar" name="event_note" class="models-calendar cursor-pointer" color="orange">
              <q-popup-proxy ref="monthPicker" transition-show="scale" transition-hide="scale">
                <q-date
                  :title="_('Select model date')"
                  :subtitle="_('Click on year and month')"
                  :navigation-min-year-month="startingModelDate"
                  :navigation-max-year-month="getCurrentDate"
                  mask="MM/YYYY"
                  years-in-month-view="true"
                  emit-immediately
                  default-view="Years"
                  v-model="modelDate"
                  color="orange-4"
                  @update:model-value="checkValue"
                />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>

        <div class="q-mt-xl flex-right">
          <button
            class="ma-btn no-margin"
            :class="(disabled)?'disabled':''"
            @click="applyfilter">
              {{ _('Apply') }}
          </button>
        </div>
        <!-- LEGEND -->
        <div v-if="showLegend">
          <hr class="q-my-xl">
          <div class="flex spaceBetween">
            <div class="uppercase text-bold">
              {{ _('Probability') }}
            </div>
            <div>
              <!-- <q-icon v-if="estimation" name="palette" class="text-orange" size="2em" @click="showPicker" /> -->
              <q-toggle checked-icon="check" v-model="estimation" @update:model-value="checkEstimation" color="orange" size="lg"/>
            </div>
          </div>
          <!-- <div class="flex spaceBetween">
            <div>
                <q-popup-proxy ref="colorPickerEst">
                      <q-color
                        v-model="estimationColorTo"
                        no-header
                        no-footer
                        default-view="palette"
                        :palette="colorsTo"
                        class="my-picker q-ma-md"
                        @change="setColorTo"
                      />
                </q-popup-proxy>
            </div>
          </div> -->
          <!-- ESTIMATION -->
          <div v-if="estimation" class="row">
            <div class="col-4 text-left">{{ _('Low') }}</div>
            <div class="col-4 text-center">{{ _('Medium') }}</div>
            <div class="col-4 text-right">{{ _('High') }}</div>
          </div>
          <!-- ESTIMATION LEGEND -->
          <div v-if="estimation" class="row legend-row">
              <!-- <div
                class="gradient"
                :style="{ backgroundImage: gradientString }">
              </div> -->
              <div class="col-2 legend-1"></div>
              <div class="col-2 legend-2"></div>
              <div class="col-2 legend-3"></div>
              <div class="col-2 legend-4"></div>
              <div class="col-2 legend-5"></div>
              <div class="col-2 legend-6"></div>
          </div>
          <!-- ESTIMATION TRANSPARENCY -->
          <div class="row q-mt-lg">
            <div v-if="estimation" class="col text-center">{{ _('Transparency') }}</div>
          </div>
          <div v-if="estimation" class="row">
            <q-slider
              :min="0"
              :max="100"
              v-model="estimationTransparency"
              color="orange"
              @update:model-value="setEstTransparency"/>
          </div>
          <!-- UNCERTAINTY -->
          <div class="flex spaceBetween">
            <div class="uppercase text-bold">
              {{ _('Uncertainty') }}
            </div>
            <div>
              <q-icon v-if="uncertainty" name="palette" class="text-orange" size="2em" @click="showPicker2" />
              <q-toggle checked-icon="check" v-model="uncertainty" @update:model-value="checkUncertainty" color="orange" size="lg"/>
            </div>
          </div>
          <div class="flex spaceBetween">
            <div>
                <q-popup-proxy ref="colorPickerSe">
                  <q-color
                    v-model="uncertaintyColor"
                    no-header
                    no-footer
                    default-view="palette"
                    :palette="colorsTo"
                    class="my-picker q-ma-md"
                    @change="setUncertaintyColor"
                  />
                </q-popup-proxy>
            </div>
          </div>
          <!-- UNCERTAINTY LEGEND -->
          <div v-if="uncertainty" class="row q-mt-md">
            <div class="col-3 text-center">{{ _('Very low') }}</div>
            <div class="col-3 text-center">{{ _('Low') }}</div>
            <div class="col-3 text-center">{{ _('Medium') }}</div>
            <div class="col-3 text-center">{{ _('High') }}</div>
          </div>
          <div v-if="uncertainty" class="row q-mt-sm alignt-items-centered">
              <div class="col-3 text-center">
                <div class="circle very-low" :style="{ background: seColor }"></div>
              </div>
              <div class="col-3 text-center">
                <div class="circle low" :style="{ background: seColor }"></div>
              </div>
              <div class="col-3 text-center">
                <div class="circle medium" :style="{ background: seColor }"></div>
              </div>
              <div class="col-3 text-center">
                <div class="circle high" :style="{ background: seColor }"></div>
              </div>
          </div>
          <!-- UNCERTAINTY TRANSPARENCY -->
          <div class="row q-mt-lg">
            <div v-if="uncertainty" class="col text-center">{{ _('Transparency') }}</div>
          </div>
          <div v-if="uncertainty" class="row">
            <q-slider
              :min="0"
              :max="100"
              v-model="uncertaintyTransparency"
              color="orange"
              @update:model-value="setUncertaintyTransparency"/>
          </div>
        </div>
      </div>
    </div>
  </q-drawer>
</template>

<script>
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import LeftMenu from 'components/LeftMenu.vue'

export default {
  components: { LeftMenu },
  props: ['expanded'],
  emits: [
    'checkModelEstimation',
    'checkModelUncertainty',
    'estimationTransparency',
    'uncertaintyTransparency',
    'estimationColorsChanged',
    'uncertaintyColorsChanged'
  ],
  setup (props, context) {
    const uncertaintyColor = ref(null)
    const colorPickerEst = ref(null)
    const colorPickerSe = ref(null)
    const refInput = ref(null)
    const estimationColorTo = ref('#d600d6')
    const estimationColorFrom = ref()
    const inputDate = ref(null)
    const legendCanvas = ref(null)
    const modelDate = ref(null)
    const getCurrentDate = ref()
    const monthPicker = ref()
    const $store = useStore()
    const showLegend = ref(false)
    const disabled = ref(true)
    const model = ref()
    const estimationTransparency = ref(0)
    const uncertaintyTransparency = ref(0)
    const estimation = ref(true)
    const uncertainty = ref(true)
    const modelsCalendar = ref()
    const backendUrl = $store.getters['app/getBackend']
    const defaults = JSON.parse(JSON.stringify($store.getters['app/getModelDefaults']))
    const modelsManifest = {}
    const startingModelDate = ref('2014/05')

    // QUASAR COLORS
    // red, pink, purple, deep-purple, indigo,
    // blue, light-blue, cyan, teal, green,
    // light-green, lime, yellow, amber, orange,
    // deep-orange, brown, grey, blue-grey
    const colorsTo = [
      // hexToRgb('#f44336'),
      hexToRgb('#fbe727'),
      hexToRgb('#e91e63'), hexToRgb('#9c27b0'),
      hexToRgb('#673ab7'), hexToRgb('#3f51b5'), hexToRgb('#2196f3'),
      hexToRgb('#03a9f4'), hexToRgb('#00bcd4'), hexToRgb('#009688'),
      hexToRgb('#4caf50'), hexToRgb('#8bc34a'), hexToRgb('#cddc39'),
      hexToRgb('#ffeb3b'), hexToRgb('#ffc107'), hexToRgb('#ff9800'),
      hexToRgb('#ff5722'), hexToRgb('#795548'), hexToRgb('#9e9e9e'),
      hexToRgb('#607d8b'), hexToRgb('#000000')
    ]
    const colorsFrom = [
      // hexToRgb('#ffebee'),
      hexToRgb('#46337e'),
      hexToRgb('#fce4ec'), hexToRgb('#f3e5f5'),
      hexToRgb('#ede7f6'), hexToRgb('#e8eaf6'), hexToRgb('#e3f2fd'),
      hexToRgb('#e1f5fe'), hexToRgb('#e0f7fa'), hexToRgb('#e0f2f1'),
      hexToRgb('#e8f5e9'), hexToRgb('#f1f8e9'), hexToRgb('#f9fbe7'),
      hexToRgb('#fffde7'), hexToRgb('#fff8e1'), hexToRgb('#fff3e0'),
      hexToRgb('#fbe9e7'), hexToRgb('#efebe9'), hexToRgb('#fafafa'),
      hexToRgb('#eceff1'), hexToRgb('#000000')
    ]

    onMounted(function () {
      const d = new Date()
      getCurrentDate.value = d.getFullYear() + '/' + (d.getMonth() + 1)
      estimationColorFrom.value = defaults.estimationColorFrom
      estimationColorTo.value = defaults.estimationColorTo
      uncertaintyColor.value = defaults.uncertaintyColor
      // Fetch model manifest to activate/deactivate calendar
      const manifestUrl = backendUrl + $store.getters['app/getModelsManifest']
      fetch(manifestUrl)
        .then(function (response) {
          return response.text()
        })
        .then(function (manifest) {
          // Read csv manifest
          const lines = manifest.split(/\r?\n/)
          const headers = lines[0].toLowerCase().split(',')
          const targetIdx = headers.indexOf('target')
          const yearIdx = headers.indexOf('from')
          const cellIdx = headers.indexOf('cell')
          for (let i = 1; i < lines.length; i++) {
            if (lines[i] === '') break
            const currentLine = lines[i].split(',')
            const target = currentLine[targetIdx].toLowerCase()
            const year = currentLine[yearIdx].toLowerCase()
            const cell = currentLine[cellIdx].toLowerCase()
            let cellValue = true
            if (cell !== '') {
              cellValue = currentLine[cellIdx].toLowerCase()
            }
            modelsManifest[target] = { year: year, cell: cellValue }
          }
        })
    })

    const seColor = computed(() => {
      return $store.getters['app/getUncertaintyColor']
    })
    const gradientString = computed(() => {
      const defaults = JSON.parse(JSON.stringify($store.getters['app/getModelDefaults']))
      return `linear-gradient(90deg, ${defaults.estimationColorFrom}, ${defaults.estimationColorTo})`
    })

    const models = computed(() => {
      return $store.getters['app/getModels']
    })

    const options = computed(() => {
      return [
        { code: 'albopictus', type: _('Tiger mosquito') },
        { code: 'aegypti', type: _('Yellow fever mosquito') },
        { code: 'japonicus', type: _('Japonicus mosquito') },
        { code: 'koreicus', type: _('Koreicus mosquito') },
        { code: 'culex', type: _('Culex mosquito') },
        { code: 'biting', type: _('Bites') }
      ]
    })

    const _ = function (text) {
      return $store.getters['app/getText'](text)
    }

    const toggleLeftDrawer = function () {
      context.emit('toggleLeftDrawer', {})
    }

    const mobile = computed(() => {
      return $store.getters['app/getIsMobile']
    })

    const dateSelected = computed(() => {
      return modelDate.value !== null
    })

    const checkValue = function (val, reason, details) {
      if (reason === 'month') {
        modelDate.value = val
        inputDate.value = val
        monthPicker.value.hide()
        $store.commit('map/setModelDate', inputDate.value)
      }
      disabled.value = (!model.value || !inputDate.value)
    }

    const filterModels = function () {
      context.emit('filterObservations', {
        type: model.value.type,
        code: model.value.code
      })
      if (model.value && inputDate.value) {
        disabled.value = false
      }
      startingModelDate.value = modelsManifest[model.value.code].year + '/01'
    }

    const applyfilter = function () {
      if (inputDate.value === null || !model.value) {
        $store.commit('app/setModal', { id: 'error', content: { visibility: true, msg: 'Must select model first' } })
      } else {
        const parts = inputDate.value.split('/')
        const serverModels = $store.getters['app/getModelsServerPath']
        // const serverModels = '//api.github.com/repos/Mosquito-Alert/global_minimal_model_estimates/contents/'
        const selectedModel = model.value.code
        const urls = [
          // serverModels + `gadm0/${selectedModel}/${parts[1]}/${parts[0]}/` + 'gadm0_monthly.csv',
          serverModels + `gadm1/${selectedModel}/${parts[1]}/${parts[0]}/` + 'gadm1_monthly.csv',
          serverModels + `gadm2/${selectedModel}/${parts[1]}/${parts[0]}/` + 'gadm2_monthly.csv',
          serverModels + `gadm3/${selectedModel}/${parts[1]}/${parts[0]}/` + 'gadm3_monthly.csv',
          serverModels + `gadm4/${selectedModel}/${parts[1]}/${parts[0]}/` + 'gadm4_monthly.csv'
        ]
        // Add cell layer based on manifest
        if (modelsManifest[selectedModel].cell === 'true') {
          urls.push(serverModels + `sampling_cells_025/${selectedModel}/${parts[1]}/${parts[0]}/` + 'sampling_cells_025_monthly.csv')
        }
        const centroidsUrls = [
          // backendUrl + 'media/centroids/gadm0_centroid.json',
          backendUrl + 'media/centroids/gadm1_centroid.json',
          backendUrl + 'media/centroids/gadm2_centroid.json',
          backendUrl + 'media/centroids/gadm3_centroid.json',
          backendUrl + 'media/centroids/gadm4_centroid.json'
        ]
        const payload = {
          esp: selectedModel,
          year: parts[1],
          month: parts[0],
          est: estimation.value,
          se: uncertainty.value,
          estTransparency: estimationTransparency.value,
          seTransparency: uncertaintyTransparency.value,
          estimationColorFrom: estimationColorFrom.value,
          estimationColorTo: estimationColorTo.value,
          uncertaintyColor: uncertaintyColor.value
        }
        $store.commit('app/setModelDefaults', payload)
        context.emit('loadModel', {
          esp: selectedModel,
          year: parts[1],
          month: parts[0],
          est: estimation.value,
          se: uncertainty.value,
          estTransparency: estimationTransparency.value,
          seTransparency: uncertaintyTransparency.value,
          estimationColorFrom: estimationColorFrom.value,
          estimationColorTo: estimationColorTo.value,
          uncertaintyColor: uncertaintyColor.value,
          modelsCsv: urls,
          centroidsUrls: centroidsUrls
        })
        if (mobile.value) {
          toggleLeftDrawer()
        }
        disabled.value = true
        showLegend.value = true
      }
    }

    const showCalendar = function () {
      modelsCalendar.value.$el.click()
    }

    const checkEstimation = function () {
      context.emit('checkModelEstimation', { status: estimation.value })
    }

    const checkUncertainty = function () {
      context.emit('checkModelUncertainty', { status: uncertainty.value })
    }

    const loadSharedModel = function (payload) {
      model.value = payload.esp
      inputDate.value = payload.month + '/' + payload.year
      modelDate.value = inputDate.value
      estimation.value = payload.est
      uncertainty.value = payload.se
      estimationColorFrom.value = payload.estimationColorFrom
      estimationColorTo.value = payload.estimationColorTo
      uncertaintyColor.value = payload.uncertaintyColor
      estimationTransparency.value = 100 * (1 - payload.estTransparency)
      uncertaintyTransparency.value = 100 * (1 - payload.seTransparency)
      applyfilter()
    }

    const setEstTransparency = function () {
      context.emit('estimationTransparency', { transparency: estimationTransparency.value })
    }

    const setUncertaintyTransparency = function () {
      context.emit('uncertaintyTransparency', { transparency: uncertaintyTransparency.value })
    }

    function hexToRgb (hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      const c = result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null
      return c ? `rgb(${c.r},${c.g},${c.b})` : null
    }

    const setColorTo = function (e) {
      const ind = colorsTo.indexOf(e)
      $store.commit('app/setEstimationColors', {
        from: colorsFrom[ind],
        to: e
      })
      colorPickerEst.value.hide()
      context.emit('estimationColorsChanged')
    }

    const showPicker = function () {
      colorPickerEst.value.show()
    }

    const showPicker2 = function () {
      colorPickerSe.value.show()
    }

    const setUncertaintyColor = function (e) {
      colorPickerSe.value.hide()
      uncertaintyColor.value = e
      $store.commit('app/setUncertaintyColor', uncertaintyColor.value)
      context.emit('uncertaintyColorsChanged')
    }

    return {
      _,
      startingModelDate,
      colorsTo,
      seColor,
      estimationColorFrom,
      estimationColorTo,
      uncertaintyColor,
      setUncertaintyColor,
      showPicker,
      showPicker2,
      colorPickerEst,
      colorPickerSe,
      setColorTo,
      setEstTransparency,
      setUncertaintyTransparency,
      estimationTransparency,
      uncertaintyTransparency,
      loadSharedModel,
      disabled,
      showLegend,
      gradientString,
      legendCanvas,
      checkEstimation,
      checkUncertainty,
      uncertainty,
      estimation,
      showCalendar,
      modelsCalendar,
      model,
      models,
      options,
      mobile,
      dateSelected,
      getCurrentDate,
      modelDate,
      inputDate,
      monthPicker,
      checkValue,
      toggleLeftDrawer,
      applyfilter,
      filterModels,
      refInput
    }
  }
}
</script>

<style scoped lang="scss">
.toc-models{
  padding: 20px;
  width: 100%;
  overflow: auto;
}

.toc-models::-webkit-scrollbar {
    height: 12px;
    width: 4px;
    background: #ccc;
}

.toc-models::-webkit-scrollbar-thumb {
    background: #EFA501;
    -webkit-border-radius: 1ex;
    -webkit-box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.75);
}
.toc-models .q-field--filled {
  background: $primary-color;
  border-radius: 4px;
}

:deep(.toc-models .q-field--filled .q-field__inner .q-field__control){
  background: $primary-color;
}
:deep(.q-field--filled.calendar-input i),
:deep(.q-field--filled.calendar-input input){
  color: white !important;
}

.models-calendar{
  font-weight: 600;
}
.q-header,
.q-drawer{
  width: $left-drawer-width;
  z-index:1200;
}
.q-drawer {
  box-shadow: 3px 0 6px rgba(0,0,0,0.25), 2px 0 2px rgba(0,0,0,0.22);
  .q-toolbar {
    box-shadow: 2px 0 4px rgba(0,0,0,0.25), 1px 0 1px rgba(0,0,0,0.22);
    background: white;
    height: 100%;
    width: 60px;
    top: 0px;
    bottom: 0px;
    flex-direction: column;
  }
}

:deep(.q-drawer__content) {
  display: flex;
  flex-direction: row;
  box-shadow: 3px 0 6px rgba(0,0,0,0.25), 2px 0 2px rgba(0,0,0,0.22);
  width: $left-drawer-width;
  overflow:hidden;
}

* {
  scrollbar-width: thin;
  scrollbar-color: #EFA501 #ccc;
}

.li-item.active{
  background: $primary-color;
  color: white;
}

:deep(button.q-btn.disabled) {
  opacity: 0.3 !important;
}
div.flex-right{
  display:flex;
  justify-content: right;
}
.flex{
  display:flex;
}
.spaceBetween{
  justify-content: space-between;
  align-items: center;
}
button.ma-btn{
  padding: 8px 10px;
  border-radius: 3px;
  background: $primary-color;
  box-shadow: none;
  color: white;
}
.no-margin{
  margin: 0px;
}
button.ma-btn.disabled{
  background: $grey-color;
  pointer-events: none;
}
.uppercase{
  text-transform: uppercase;
}
.cookie-comply-slider:focus{
  outline: none;
}
input:checked + .cookie-comply-slider{
  background: orange;
}
.estimation-legend{
  height: 80px;
  width: 100%;
}
.gradient{
  height: 20px;
  width: 100%;
}

.circle {
  border-radius: 50%;
  margin: auto;
}

.circle.very-low{
  width: 8px;
  height: 8px;
}

.circle.low{
  width: 16px;
  height: 16px;
}

.circle.medium{
  width: 24px;
  height: 24px;
}

.circle.high{
  width: 32px;
  height: 32px;
}
.alignt-items-centered{
  align-items: center;
}
.legend-row{
  height: 25px;
}

.legend-1{
  background: #fde725;
}

.legend-2{
  background: #9fda3a;
}

.legend-3{
  background: #4ac16d;
}

.legend-4{
  background: #1fa187;
}

.legend-5{
  background: #277f8e;
}

.legend-6{
  background: #365c8d;
}

@media (max-width: 640px) {
  .aside button {
    scale: 0.9;
  }
}
.my-picker.q-color-picker{
  box-shadow: none;
}
</style>
