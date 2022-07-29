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
          :label="_('Year / Month')"
          value=""
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
            :class="(inputDate === null || !model)?'disabled':''"
            @click="applyfilter">
              {{ _('Apply') }}
          </button>
        </div>
        <hr class="q-my-xl">
        <!-- LEGEND -->
        <div class="flex spaceBetween">
          <div class="uppercase">{{ _('Probability') }}</div>
          <div>
            <label class="cookie-comply-switch">
              <input
                v-model="estimation"
                type="checkbox"
                @change="checkEstimation">

              <span class="cookie-comply-slider cookie-comply-round"></span>
            </label>
          </div>
        </div>
        <!-- GRADIENT -->
        <div v-if="estimation" class="flex">
            <div
              class="q-mt-lg gradient"
              :style="{ backgroundImage: gradientString }">
            </div>
        </div>
        <div class="flex spaceBetween q-mt-xl">
          <div class="uppercase">{{ _('Uncertainty') }}</div>
          <div>
            <label class="cookie-comply-switch">
              <input
                v-model="uncertainty"
                type="checkbox"
                @change="checkUncertainty">

              <span class="cookie-comply-slider cookie-comply-round"></span>
            </label>
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
  emits: ['checkModelEstimation', 'checkModelUncertainty'],
  setup (props, context) {
    const refInput = ref(null)
    const inputDate = ref(null)
    const legendCanvas = ref(null)
    const modelDate = ref(null)
    const getCurrentDate = ref()
    const monthPicker = ref()
    const $store = useStore()
    const model = ref()
    const estimation = ref()
    const uncertainty = ref()
    const modelsCalendar = ref()
    const gradientString = ref()
    const backendUrl = $store.getters['app/getBackend']

    onMounted(function () {
      const d = new Date()
      getCurrentDate.value = d.getFullYear() + '/' + (d.getMonth() + 1)
      const json = JSON.parse(JSON.stringify($store.getters['app/getModelsProperties']))
      gradientString.value = `linear-gradient(90deg, ${json.gadm0.colorFrom}, ${json.gadm0.colorTo})`
      console.log(gradientString.value)
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
    }

    const filterModels = function () {
      context.emit('filterObservations', {
        type: model.value.type,
        code: model.value.code
      })
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
          modelsCsv: urls,
          centroidsUrls: centroidsUrls
        })
        estimation.value = true
        uncertainty.value = true
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

    return {
      _,
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
}
.uppercase{
  text-transform: uppercase;
}
input:checked + .cookie-comply-slider{
  background: orange;
}
.estimation-legend{
  height: 80px;
  width: 100%;
}
.gradient{
  height: 40px;
  width: 100%;
}
@media (max-width: 640px) {
  .aside button {
    scale: 0.9;
  }
}
</style>
