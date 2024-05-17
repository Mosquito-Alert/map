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
        <q-btn :label="trans('Close')" class="ma-close-btn" @click="toggleLeftDrawer"/>
      </div>
      <div class="text-h5 toc-title-estimates">
        {{ trans('Encounter probability') }}
      </div>

      <div>
        <div class="category-box q-my-md">
          <q-select
            :label="trans('Select species')"
            :label-color="localSpeciesCode?'orange':'rgba(0, 0, 0, 0.6)'"
            :options="vectorOptions"
            option-value="code"
            option-label="label"
            color="orange"
            emit-value
            map-options
            :model-value="localSpeciesCode"
            @update:model-value="speciesCodeUpdated"
          />
        </div>
        <q-input
          :label="trans('Month / Year')"
          :label-color="localDate?'orange':'rgba(0, 0, 0, 0.6)'"
          :disable="!localSpeciesCode"
          :model-value="localDateString"
          readonly
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer" color="orange">
              <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                <q-date
                  :title="trans('Select model date')"
                  :navigation-min-year-month="minYearMonthPickerValue"
                  :navigation-max-year-month="maxYearMonthPickerValue"
                  default-view="Years"
                  color="orange-4"
                  years-in-month-view
                  emit-immediately
                  mask="YYYY/MM"
                  v-model="qDateModel"
                  @update:model-value="dateUpdated"
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
                  {{ trans('MODELED DATA') }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- LEGEND -->
        <div v-if="formIsValid">
          <hr class="q-my-lg">
          <div class="row title-shaded-box">{{ trans('Layer controls') }}</div>
          <div class="row shaded-box q-pa-sm">
            <div class="col-9 q-pr-md">
              <div class="row">
                <q-badge :outline="!localVisible" color="orange">
                  {{ trans('Opacity') }}
                </q-badge>
              </div>
              <q-slider
                v-model="localOpacity"
                :min="0"
                :max="1"
                :step="0.01"
                :disable="!localVisible"
                color="orange"
                label/>
            </div>
            <q-toggle class="col" checked-icon="check" v-model="localVisible" color="orange" size="lg"/>
          </div>
          <!-- LEGEND + FILTERS -->
          <div v-if="localVisible">
            <!-- LEGEND -->
            <div class="row justify-between q-mt-lg">
              <span>{{ trans('Low') }}</span>
              <span>{{ trans('Medium') }}</span>
              <span>{{ trans('High') }}</span>
            </div>
            <!-- ESTIMATION LEGEND -->
            <div class="row legend-row" :style="{'opacity': localOpacity}">
              <div class="col" v-for="(color, index) in palette" :key="index" :style="{'background-color': color}"></div>
            </div>
            <!-- FILTERS -->
            <hr class="q-my-lg">
            <div class="row title-shaded-box">{{ trans('Filters') }}</div>
            <div class="shaded-box ">
              <q-list>
                <!-- CERTAINTY FILTER -->
                <q-item>
                  <q-item-section avatar class="column flex-center">
                    <q-icon name="fas fa-handshake" color="orange"/>
                    <q-item-label class="text-grey-8">
                      {{ trans('Certainty') }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section>
                    <q-range
                      v-model="localFilter.certaintyRange"
                      :min="0.0"
                      :max="1.0"
                      :step="0.05"
                      label
                      drag-range
                      color="orange"
                      @change="handleFilterChange"
                      />
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-drawer>
</template>

<script>
import { computed, onMounted, ref, watch } from 'vue'
import { useStore } from 'vuex'
import LeftMenu from 'components/LeftMenu.vue'
import axios from 'axios'

export default {
  components: { LeftMenu },
  props: {
    expanded: {
      type: Boolean,
      default: true
    },
    speciesCode: {
      type: String
    },
    date: {
      type: Date,
      validator (value) {
        return value <= new Date()
      }
    },
    opacity: {
      type: Number,
      default: 1
    },
    visible: {
      type: Boolean,
      default: true
    },
    palette: {
      type: Array,
      required: true
    },
    filters: {
      type: Object
    },
    lang: {
      type: String,
      required: true,
      default: 'en'
    }
  },
  emits: [
    'firstMapCall',
    'toggleLeftDrawer',
    'startShareView',
    'speciesCodeChange',
    'dateChange',
    'opacityChange',
    'visiblitiyChange',
    'filtersChange',
    'filtersLazyChange'
  ],
  setup (props, context) {
    const $store = useStore()

    // Ref for controlling month picker visibility
    const qDateProxy = ref()

    // Object to store models manifest
    const modelsManifest = {}
    const manifestUrl = $store.getters['app/getModelsManifestUrl']
    const speciesModelManifest = computed(() => modelsManifest[localSpeciesCode.value])

    const localSpeciesCode = ref(props.speciesCode)
    const localDate = ref(props.date)
    const qDateModel = ref()
    watch(localDate, (newValue, oldValue) => {
      if (localDate.value) {
        // Same mask as in q-date
        qDateModel.value = localDate.value.getFullYear() + '/' + (localDate.value.getMonth() + 1).toString().padStart(2, '0')
      } else {
        console.log('undefined')
        qDateModel.value = undefined
      }

      context.emit('dateChange', newValue)
    })

    const localDateString = computed(() => {
      if (localDate.value === undefined) {
        return ''
      }

      const dateStr = localDate.value.toLocaleDateString(
        props.lang || 'en',
        { year: 'numeric', month: 'long' }
      )

      // Force capitalize of first letter
      return dateStr.charAt(0).toUpperCase() + dateStr.slice(1)
    })

    // Computed properties for setting min and max values for the year-month picker
    const minYearMonthPickerValue = computed(() => speciesModelManifest.value ? `${speciesModelManifest.value.fromYear}/${speciesModelManifest.value.fromMonth}` : undefined)
    const maxYearMonthPickerValue = computed(() => speciesModelManifest.value ? `${speciesModelManifest.value.toYear}/${speciesModelManifest.value.toMonth}` : undefined)

    const localVisible = ref(props.visible)
    watch(localVisible, (newValue) => {
      context.emit('visiblitiyChange', newValue)
    })
    const localOpacity = ref(props.opacity)
    watch(localOpacity, (newValue, oldValue) => {
      context.emit('opacityChange', newValue)
    })
    const localFilter = ref({
      ...{
        certaintyRange: {
          min: 0,
          max: 1
        }
      },
      ...props.filters
    })
    watch(localFilter, (newValue, oldValue) => {
      context.emit('filtersChange', newValue)
    })

    // Computed property for checking form validity
    const formIsValid = computed(() => {
      // Check that both localSpeciesCode and localDate have values
      return [localSpeciesCode.value, localDate.value].every(value => value !== undefined)
    })

    const vectorOptions = computed(() => {
      // Code is used also for building the CSV urls paths.
      return [
        { code: 'albopictus', label: trans('Tiger mosquito') },
        { code: 'aegypti', label: trans('Yellow fever mosquito') },
        { code: 'japonicus', label: trans('Japonicus mosquito') },
        { code: 'koreicus', label: trans('Koreicus mosquito') },
        { code: 'culex', label: trans('Culex mosquito') },
        { code: 'biting', label: trans('Bites') }
      ]
    })

    const mobile = computed(() => {
      return $store.getters['app/getIsMobile']
    })

    onMounted(function () {
      getManifest(manifestUrl)
    })

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
            let cellValue = true
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
          if (callback) {
            callback()
          }
        })
    }

    const trans = function (text) {
      return $store.getters['app/getText'](text)
    }

    const callFirstMapCall = function () {
      context.emit('firstMapCall', {})
    }

    // Called when TOC is toggled
    const toggleLeftDrawer = function () {
      context.emit('toggleLeftDrawer', {})
    }

    const goInfoModal = function () {
      $store.commit('app/setModal', { id: 'info', content: { visibility: true, anchor: 'modeled_info' } })
    }

    const startShareView = function () {
      context.emit('startShareView', {})
    }

    // Called when calendar is clicked
    const dateUpdated = function (val, reason, details) {
      if (reason === 'month') {
        localDate.value = new Date(details.year, details.month - 1)
        // Once month is selected, hide the datePicker.
        qDateProxy.value.hide()
      }
    }

    const speciesCodeUpdated = function (value) {
      localSpeciesCode.value = value
      localDate.value = undefined
      context.emit('speciesCodeChange', value)
    }

    const handleFilterChange = (value) => {
      // Important, do { ...localFilter.value } to avoid passing a ProxyObject.
      context.emit('filtersLazyChange', { ...localFilter.value })
    }

    return {
      qDateModel,
      qDateProxy,
      localSpeciesCode,
      localDate,
      localDateString,
      localOpacity,
      localVisible,
      localFilter,
      minYearMonthPickerValue,
      maxYearMonthPickerValue,
      formIsValid,
      vectorOptions,
      mobile,
      trans,
      goInfoModal,
      toggleLeftDrawer,
      callFirstMapCall,
      startShareView,
      dateUpdated,
      speciesCodeUpdated,
      handleFilterChange
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
  font-weight: 700;
  color: #666666;
}
.toc-title-estimates::first-letter{
  text-transform: uppercase;
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
.title-shaded-box{
  font-family: 'Roboto';
  font-weight: 700;
  color: #666666;
  text-transform: uppercase;
}
.shaded-box{
  border-radius: 5px;
  background-color: $grey-color;
  margin: 3px 0px;
}
</style>
