<!--
  THIS COMPONENT CONTAINS
  - MAIN MENU TOOLS
  - TABLE OF CONTENTS FOR MODELS
-->

<template>
  <q-drawer
    show-if-above
    side="left"
    behavior="desktop"
    width=""
    v-touch-swipe.mouse.left="toggleLeftDrawer"
  >
    <!-- Main menu -->
    <left-menu item="models"
      @leftMenuMounted="callFirstMapCall"
      @startShareView="startShareView"
    />

    <!-- Drawer content -->
    <div class="toc-models"
      :class="expanded?'expanded':'collapsed'"
    >
      <div v-if="mobile" class="text-right q-ma-md">
        <q-btn :label="_('Close')" class="ma-close-btn" @click="toggleLeftDrawer"/>
      </div>
      <div class="text-h5 toc-title-estimates">
        {{ _('Estimates') }}
      </div>

      <div>
        <div class="category-box q-my-md">
          <q-select
            :label="_('Select species')"
            v-model="modelVector"
            color="orange"
            :label-color="modelVector?'orange':'rgba(0, 0, 0, 0.6)'"
            :options="vectorOptions"
            :option-value="'code'"
            :option-label="'type'"
            @update:model-value="filterModels"
          />

        </div>

        <q-input
          v-if="modelVector"
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

        <div class="q-mt-xl flex-center model-buttons">
          <div>
            <div @click="goInfoModal">
              <div class="div-link flex-center q-ml-xs">
                <div>
                  <i class="fa-thin fa-circle-info"></i>
                </div>
                <div class="q-ml-xs lower-case capitalFirstLetter">
                  {{ _('MODELED DATA') }}
                </div>
              </div>
            </div>
          </div>
            <div>
            <q-btn
              class="ma-btn no-margin"
              :class="(disabled)?'disabled':''"
              @click="applyfilter">
                {{ _('Apply') }}
            </q-btn>
          </div>
        </div>
        <!-- LEGEND -->
        <div v-if="showLegend">
          <hr class="q-my-xl">
          <div class="flex spaceBetween">
            <div class="uppercase text-bold">
              {{ _('Probability') }}
            </div>
            <div class="estimation-palettes">
              <q-icon v-if="estimation" name="palette" class="text-orange cursor-pointer" size="2em" @click="showPalettes" />
              <q-toggle checked-icon="check" v-model="estimation" @update:model-value="checkEstimation" color="orange" size="lg"/>
            </div>
          </div>
          <div class="flex spaceBetween">
            <div>
                <q-popup-proxy ref="colorPickerEst" class="estimation-colors">
                      <q-color
                        no-header
                        no-footer
                        default-view="palette"
                        :palette="palettes"
                        class="my-picker q-ma-md"
                        @click="clickColor"
                      />
                </q-popup-proxy>
            </div>
          </div>
          <!-- ESTIMATION -->
          <div v-if="estimation" class="row">
            <div class="col-4 text-left">{{ _('Low') }}</div>
            <div class="col-4 text-center">{{ _('Medium') }}</div>
            <div class="col-4 text-right">{{ _('High') }}</div>
          </div>
          <!-- ESTIMATION LEGEND -->
          <div v-if="estimation" class="row legend-row" :style="{'opacity': 1 - (estimationTransparency/100)}">
              <div class="col-2" :style="{'background-color': estLegendColors[0]}"></div>
              <div class="col-2" :style="{'background-color': estLegendColors[1]}"></div>
              <div class="col-2" :style="{'background-color': estLegendColors[2]}"></div>
              <div class="col-2" :style="{'background-color': estLegendColors[3]}"></div>
              <div class="col-2" :style="{'background-color': estLegendColors[4]}"></div>
              <div class="col-2" :style="{'background-color': estLegendColors[5]}"></div>
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
              @update:model-value="setEstimationTransparency"/>
          </div>
          <!-- UNCERTAINTY -->
          <div class="flex spaceBetween">
            <div class="uppercase text-bold">
              {{ _('Uncertainty') }}
            </div>
            <div>
              <q-icon v-if="uncertainty" name="palette" class="text-orange cursor-pointer" size="2em" @click="showPicker" />
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
          <div v-if="uncertainty" class="row q-mt-sm alignt-items-centered" :style="{'opacity': 1 - (uncertaintyTransparency/100)}">
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
import { watch, computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import LeftMenu from 'components/LeftMenu.vue'
// import { StatusCodes as STATUS_CODES } from 'http-status-codes'
import axios from 'axios'

export default {
  components: { LeftMenu },
  props: ['expanded'],
  emits: [
    'loadModel',
    'clearModel',
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
    // const inputDate = ref(null)
    const inputDate = ref(null)
    const legendCanvas = ref(null)
    const modelDate = ref(null)
    const getCurrentDate = ref()
    const monthPicker = ref()
    const $store = useStore()
    const showLegend = ref(false)
    const disabled = ref(true)
    const disabledInfo = ref(true)
    const modelVector = ref()
    const estimation = ref(true)
    const uncertainty = ref(true)
    const modelsCalendar = ref()
    const backendUrl = $store.getters['app/getBackend']
    // const defaults = JSON.parse(JSON.stringify($store.getters['app/getModelDefaults']))
    const modelsManifest = {}
    const startingModelDate = ref('2014/05')
    // const estimationColor = ref()
    const palettes = ref(null)
    let estimationColors = $store.getters['app/getEstimationColors']
    const estLegendColors = ref(estimationColors)
    const initialSeTransparency = $store.getters['app/getModelDefaults'].uncertaintyTransparency
    const estimationTransparency = ref(0)
    const uncertaintyTransparency = ref(initialSeTransparency)
    const manifestUrl = $store.getters['app/getModelsManifestUrl']

    // colors for uncertainty
    const colorsTo = [
      hexToRgb('#ff0000'), hexToRgb('#ff8000'), hexToRgb('#ffff00'),
      hexToRgb('#00ff00'), hexToRgb('#00ff80'), hexToRgb('#00ff80'),
      hexToRgb('#0080ff'), hexToRgb('#0000ff'), hexToRgb('#8000ff'),
      hexToRgb('#ff00ff'), hexToRgb('#cdcdcd'), hexToRgb('#7f7f7f'),
      hexToRgb('#191919'), hexToRgb('#000000')
    ]

    onMounted(function () {
      palettes.value = [].concat.apply([], $store.getters['app/getEstimationPalettes'])
      const defaults = $store.getters['app/getModelDefaults']
      // Check if referer is Reports map
      if (defaults.vector !== '') {
        const index = vectorOptions.value.findIndex(obj => {
          return (obj.code === defaults.vector)
        })
        modelVector.value = vectorOptions.value[index]
        // Init view. Get values from store
        showLegend.value = true
        estimation.value = defaults.estimation
        uncertainty.value = defaults.uncertainty
        estimationTransparency.value = defaults.estimationTransparency
        uncertaintyTransparency.value = defaults.uncertaintyTransparency
        uncertaintyColor.value = defaults.uncertaintyColor
        inputDate.value = defaults.month + '/' + defaults.year
        context.emit('loadModel', defaults)
      }

      const d = new Date()
      getCurrentDate.value = d.getFullYear() + '/' + (d.getMonth() + 1)
      uncertaintyColor.value = defaults.uncertaintyColor
      // Get model manifest to activate/deactivate calendar
      getManifest(manifestUrl)
    })

    const callFirstMapCall = function () {
      context.emit('firstMapCall', {})
    }

    const getManifest = function (url, callback = false) {
      // IF modelsManifest already exists, then call callback
      if (Object.keys(modelsManifest).length !== 0) {
        if (callback) {
          callback()
        }
        return true
      }
      axios(url)
        .then(function (resp) {
          // Read csv manifest
          const lines = resp.data.split(/\r?\n/)
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
          if (callback) {
            callback()
          }
        })
    }

    // Read default uncertainty color from store
    const seColor = computed(() => {
      return $store.getters['app/getUncertaintyColor']
    })

    const models = computed(() => {
      return $store.getters['app/getModels']
    })

    const vectorOptions = computed(() => {
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

    // Called when TOC is toggled
    const toggleLeftDrawer = function () {
      context.emit('toggleLeftDrawer', {})
    }

    const mobile = computed(() => {
      return $store.getters['app/getIsMobile']
    })

    const dateSelected = computed(() => {
      return modelDate.value !== null
    })

    // Called when calendar is clicked
    const checkValue = function (val, reason, details) {
      showLegend.value = false
      context.emit('clearModel')
      if (reason === 'month') {
        modelDate.value = val
        inputDate.value = val
        monthPicker.value.hide()
        $store.commit('map/setModelDate', inputDate.value)
      }
      disabled.value = (!modelVector.value || !inputDate.value)
      if (inputDate.value) {
        disabledInfo.value = false
      }
    }

    // Called when model is selected
    const filterModels = function () {
      showLegend.value = false
      context.emit('clearModel')

      context.emit('filterObservations', {
        type: modelVector.value.type,
        code: modelVector.value.code
      })

      // Check if selected models is available. if not clear modelDate
      startingModelDate.value = modelsManifest[modelVector.value.code].year + '/01'
      if (modelDate.value) {
        const selected = parseInt(modelDate.value.slice(-4))
        const previous = parseInt(startingModelDate.value.substring(0, 4))
        if (previous > selected) {
          inputDate.value = null
          modelDate.value = null
        }
      }

      if (modelVector.value && inputDate.value) {
        disabled.value = false
      } else {
        disabled.value = true
      }
    }

    // Called when apply button is clicked
    const applyfilter = async function () {
      if (inputDate.value === null || !modelVector.value) {
        $store.commit('app/setModal', { id: 'error', content: { visibility: true, msg: 'Must select model first' } })
      } else {
        const parts = inputDate.value.split('/')
        const serverModels = $store.getters['app/getModelsUrl']
        const selectedModel = modelVector.value.code
        const urls = [
          serverModels + `gadm1/${selectedModel}/${parts[1]}/${parts[0]}/` + 'gadm1_monthly.csv',
          serverModels + `gadm2/${selectedModel}/${parts[1]}/${parts[0]}/` + 'gadm2_monthly.csv',
          serverModels + `gadm3/${selectedModel}/${parts[1]}/${parts[0]}/` + 'gadm3_monthly.csv',
          serverModels + `gadm4/${selectedModel}/${parts[1]}/${parts[0]}/` + 'gadm4_monthly.csv'
        ]
        // Add grid (2km x 2km) layer based on manifest
        if (modelsManifest[selectedModel].cell === 'true') {
          urls.push(serverModels + `sampling_cells_025/${selectedModel}/${parts[1]}/${parts[0]}/` + 'sampling_cells_025_monthly.csv')
        }
        const centroidsUrls = [
          backendUrl + 'media/centroids/gadm1_centroid.json',
          backendUrl + 'media/centroids/gadm2_centroid.json',
          backendUrl + 'media/centroids/gadm3_centroid.json',
          backendUrl + 'media/centroids/gadm4_centroid.json'
        ]
        const estimationPalettes = $store.getters['app/getEstimationPalettes']

        // Prepare payload to update store
        const payload = {
          vector: selectedModel,
          year: parts[1],
          month: parts[0],
          estimation: estimation.value,
          uncertainty: uncertainty.value,
          estimationTransparency: estimationTransparency.value,
          estimationOpacity: 1 - (estimationTransparency.value / 100),
          uncertaintyTransparency: uncertaintyTransparency.value,
          uncertaintyOpacity: 1 - (uncertaintyTransparency.value / 100),
          uncertaintyColor: uncertaintyColor.value,
          estimationColors: estimationColors,
          estimationPalettes: estimationPalettes,
          modelsCsv: urls,
          centroidsUrls: centroidsUrls
        }
        $store.commit('app/setModelDefaults', payload)
        context.emit('loadModel', payload)
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

    const errorDownloadingModels = function () {
      showLegend.value = false
    }

    // Update UI when loading a model from a shared view
    const loadSharedModel = async function (payload) {
      estLegendColors.value = payload.estimationColors
      modelVector.value = payload.vector
      inputDate.value = payload.month + '/' + payload.year
      modelDate.value = inputDate.value
      estimation.value = payload.estimation
      uncertainty.value = payload.uncertainty
      uncertaintyColor.value = payload.uncertaintyColor
      estimationTransparency.value = payload.estimationTransparency
      uncertaintyTransparency.value = payload.uncertaintyTransparency
      estimationColors = payload.estimationColors
      // applyfilter as a callback after modelsManifest is downloaded
      getManifest(manifestUrl, applyfilter)
    }

    const setEstimationTransparency = function () {
      // 0 - 100 slider values
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

    const showPalettes = function () {
      colorPickerEst.value.show()
    }

    const showPicker = function () {
      colorPickerSe.value.show()
    }

    const setUncertaintyColor = function (e) {
      colorPickerSe.value.hide()
      uncertaintyColor.value = e
      $store.commit('app/setUncertaintyColor', uncertaintyColor.value)
      context.emit('uncertaintyColorsChanged')
    }

    const clickColor = function (event) {
      let el = event.target
      let idx = 0
      while (el.previousElementSibling) {
        idx += 1
        el = el.previousElementSibling
      }
      const p = $store.getters['app/getEstimationPalettes']
      const index = Math.floor(idx / 6)
      estimationColors = p[index]
      estLegendColors.value = estimationColors
      $store.commit('app/setEstimationColors', estimationColors)
      colorPickerEst.value.hide()
      context.emit('estimationColorsChanged')
    }

    const goInfoModal = function () {
      $store.commit('app/setModal', { id: 'info', content: { visibility: true, anchor: 'modeled_info' } })
    }

    const startShareView = function () {
      context.emit('startShareView', {})
    }

    // Required to change lang on current selection
    watch(vectorOptions, (cur, old) => {
      if (modelVector.value) {
        if (modelVector.value.code) {
          const index = cur.findIndex(obj => {
            return (obj.code === modelVector.value.code)
          })
          modelVector.value = cur[index]
        }
      }
    })

    return {
      _,
      errorDownloadingModels,
      goInfoModal,
      estLegendColors,
      clickColor,
      estimationColors,
      startingModelDate,
      palettes,
      colorsTo,
      seColor,
      uncertaintyColor,
      setUncertaintyColor,
      showPalettes,
      showPicker,
      colorPickerEst,
      colorPickerSe,
      setEstimationTransparency,
      setUncertaintyTransparency,
      estimationTransparency,
      uncertaintyTransparency,
      loadSharedModel,
      disabled,
      disabledInfo,
      showLegend,
      legendCanvas,
      checkEstimation,
      checkUncertainty,
      uncertainty,
      estimation,
      showCalendar,
      modelsCalendar,
      modelVector,
      models,
      vectorOptions,
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
      refInput,
      callFirstMapCall,
      startShareView
    }
  }
}
</script>

<style scoped lang="scss">
.toc-models{
  padding: 0px;
  width: 100%;
  overflow: auto;
  &.expanded{
    z-index:10;
  }
  &.expanded > div:not(.text-right){
    padding: 18px;
  }
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
button.ma-btn-no-bg{
  padding: 8px 10px;
  background: none;
  box-shadow: none;
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

.model-buttons{
  justify-content: space-between;
}
@media (max-width: 640px) {
  .aside button {
    scale: 0.9;
  }
}
.my-picker.q-color-picker{
  box-shadow: none;
}

.estimation-colors div :deep(div.q-color-picker__cube){
  width: 16% !important;
  margin: 3px 0 !important;
}
.div-link{
  cursor: pointer;
  color: rgb(0,0,0,0.6);
}
.div-link:hover{
  color: $primary-color;
}
.div-link div i {
  font-size: 22px;
}
.div-link
.lower-case{
      text-transform: lowercase;
}
.capitalFirstLetter:first-letter {
    text-transform: uppercase;
}
.flex-center{
  display: flex;
  align-items: center;
}
.text-h4-normal{
  font-size: 2.125rem;
  font-weight: 100;
}
.toc-title-estimates{
  font-family: 'Roboto';
  text-transform: Capitalize;
  font-weight: 700;
  color: #666666;
}
.ma-close-btn::before{
  box-shadow: none;
}
button.ma-close-btn,
.ma-close-btn{
  padding: 8px 10px;
  border-radius: 3px;
  background: $primary-color;
  box-shadow: none;
  color: white;
}
button.ma-close-btn:hover,
.ma-close-btn:hover{
  opacity:0.7;
}
</style>
