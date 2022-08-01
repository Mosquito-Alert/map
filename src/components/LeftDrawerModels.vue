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
                  navigation-min-year-month='2015/01'
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
            <div class="uppercase text-bold">{{ _('Probability') }}</div>
            <div>
              <q-toggle checked-icon="check" v-model="estimation" @update:model-value="checkEstimation" color="orange" size="lg"/>
            </div>
          </div>
          <!-- ESTIMATION -->
          <div v-if="estimation" class="row">
            <div class="col-4 text-left">{{ _('Low') }}</div>
            <div class="col-4 text-center">{{ _('Medium') }}</div>
            <div class="col-4 text-right">{{ _('High') }}</div>
          </div>
          <!-- ESTIMATION LEGEND -->
          <div v-if="estimation" class="row">
              <div
                class="gradient"
                :style="{ backgroundImage: gradientString }">
              </div>
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
          <div class="flex spaceBetween q-mt-xl">
            <div class="uppercase text-bold">{{ _('Uncertainty') }}</div>
            <div>
              <q-toggle checked-icon="check" v-model="uncertainty" @update:model-value="checkUncertainty" color="orange" size="lg"/>
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
                <div class="circle very-low"></div>
              </div>
              <div class="col-3 text-center">
                <div class="circle low"></div>
              </div>
              <div class="col-3 text-center">
                <div class="circle medium"></div>
              </div>
              <div class="col-3 text-center">
                <div class="circle high"></div>
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
    'uncertaintyTransparency'
  ],
  setup (props, context) {
    const refInput = ref(null)
    const inputDate = ref(null)
    const legendCanvas = ref(null)
    const modelDate = ref(null)
    const getCurrentDate = ref()
    const monthPicker = ref()
    const $store = useStore()
    const showLegend = ref(false)
    const disabled = ref(true)
    const model = ref()
    const estimationTransparency = ref(1)
    const uncertaintyTransparency = ref(1)
    const estimation = ref(true)
    const uncertainty = ref(true)
    const modelsCalendar = ref()
    const gradientString = ref()
    const backendUrl = $store.getters['app/getBackend']

    onMounted(function () {
      const d = new Date()
      getCurrentDate.value = d.getFullYear() + '/' + (d.getMonth() + 1)
      const json = JSON.parse(JSON.stringify($store.getters['app/getModelsProperties']))
      gradientString.value = `linear-gradient(90deg, ${json.gadm0.colorFrom}, ${json.gadm0.colorTo})`
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
    }

    const applyfilter = function () {
      if (inputDate.value === null || !model.value) {
        $store.commit('app/setModal', { id: 'error', content: { visibility: true, msg: 'Must select model first' } })
      } else {
        const parts = inputDate.value.split('/')
        // const serverModels = $store.getters['app/getModelsServerPath']
        const serverModels = '//api.github.com/repos/Mosquito-Alert/global_minimal_model_estimates/contents/'
        const selectedModel = model.value.code
        const urls = [
          serverModels + `gadm0/${selectedModel}/${parts[1]}/${parts[0]}/` + 'gadm0_monthly.csv',
          serverModels + `gadm1/${selectedModel}/${parts[1]}/${parts[0]}/` + 'gadm1_monthly.csv',
          serverModels + `gadm2/${selectedModel}/${parts[1]}/${parts[0]}/` + 'gadm2_monthly.csv',
          serverModels + `sampling_cells_05/${selectedModel}/${parts[1]}/${parts[0]}/` + 'sampling_cells_05_monthly.csv'
        ]
        const centroidsUrls = [
          backendUrl + 'media/centroids/gadm0_centroid.json',
          backendUrl + 'media/centroids/gadm1_centroid.json',
          backendUrl + 'media/centroids/gadm2_centroid.json'
        ]
        context.emit('loadModel', {
          esp: selectedModel,
          year: parts[1],
          month: parts[0],
          est: estimation.value,
          estTransparency: estimationTransparency.value,
          seTransparency: uncertaintyTransparency.value,
          se: uncertainty.value,
          modelsCsv: urls,
          centroidsUrls: centroidsUrls
        })

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

    return {
      _,
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
  background: rgba(0,0,0,0.6);
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
@media (max-width: 640px) {
  .aside button {
    scale: 0.9;
  }
}
</style>
