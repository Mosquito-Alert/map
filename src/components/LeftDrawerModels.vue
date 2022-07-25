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
      <q-input
        readonly
        class="q-pl-md calendar-input"
        input-class="cursor-pointer"
        :label="_('Year / Month')"
        value=""
        v-model="inputDate"
        mask="##/####"
        fill-mask="##/####"
        :label-color="dateSelected?'rgba(0, 0, 0, 0.6)':'orange'"
        :filled="dateSelected"
        ref="refInput"
      >
        <template v-slot:append>
          <q-icon name="event_note" class="models-calendar cursor-pointer" color="orange">
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

      <div class="category-box q-my-md">
        <div v-for="layer, code in models" :key="code"
          class="li-item li-models q-pl-md q-py-md"
          :data-code="code"
          :data-type="layer.modelName"
          @click="filterModels(layer, $event)"
          v-text="_(layer.common_name)">
        </div>
        <!-- <div v-text="_(layer.common_name)" class="toc-item-name"></div> -->
        <div class="separator"></div>
      </div>

        <button @click="applyfilter" class="q-mt-xl">
          Load Model
        </button>
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
  setup (props, context) {
    const refInput = ref(null)
    const inputDate = ref(null)
    const modelDate = ref(null)
    const getCurrentDate = ref()
    const monthPicker = ref()
    const $store = useStore()
    let onModelIsSelected = false
    let selectedModel = null

    onMounted(function () {
      const d = new Date()
      getCurrentDate.value = d.getFullYear() + '/' + (d.getMonth() + 1)
    })

    const models = computed(() => {
      return $store.getters['app/getModels']
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

    const filterModels = function (layer, event) {
      const obj = event.target
      onModelIsSelected = true
      // First Disable all active items
      const activ = obj.parentNode.querySelector('.active')
      if (activ) {
        activ.classList.remove('active')
      }

      selectedModel = obj.dataset.type
      context.emit('filterObservations', {
        type: obj.dataset.type,
        code: obj.dataset.code
      })

      const classes = obj.classList
      if (classes.contains('active')) {
        obj.classList.remove('active')
        if (obj.querySelector('img')) {
          obj.querySelector('img').src = layer.icon_disabled
        }
      } else {
        obj.classList.add('active')
        if (obj.querySelector('img')) {
          obj.querySelector('img').src = layer.icon
        }
      }
    }

    const applyfilter = function () {
      if (inputDate.value === null || !onModelIsSelected) {
        $store.commit('app/setModal', { id: 'error', content: { visibility: true, msg: 'Must select model first' } })
      } else {
        const parts = inputDate.value.split('/')
        // const serverModels = $store.getters['app/getModelsServerPath']
        const serverModels = '//api.github.com/repos/Mosquito-Alert/global_minimal_model_estimates/contents'
        const urls = [
          serverModels + `gadm0/${selectedModel}/${parts[1]}/${parts[0]}/` + 'gadm0_monthly.csv',
          serverModels + `gadm1/${selectedModel}/${parts[1]}/${parts[0]}/` + 'gadm1_monthly.csv',
          serverModels + `gadm2/${selectedModel}/${parts[1]}/${parts[0]}/` + 'gadm2_monthly.csv'
        ]
        context.emit('loadModel', {
          esp: selectedModel,
          year: parts[1],
          month: parts[0],
          modelsCsv: urls
        })
      }
    }

    return {
      _,
      models,
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

.toc-models .q-field--filled .q-field__inner .q-field__control{
  background: $primary-color;
}

.toc-models .q-field--filled .q-field__control i {
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

@media (max-width: 640px) {
  .aside button {
    scale: 0.9;
  }
}
</style>
