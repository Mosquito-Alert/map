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
        class="calendar-input"
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

    onMounted(function () {
      const d = new Date()
      getCurrentDate.value = d.getFullYear() + '/' + (d.getMonth() + 1)
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

    const applyfilter = function () {
      const dataUrl = $store.getters['app/getModelsServerPath']
      const urls = [
        dataUrl + 'model_gadm0.csv',
        dataUrl + 'model_gadm1.csv',
        dataUrl + 'model_gadm2.csv'
      ]
      context.emit('loadModel', {
        esp: 'tig',
        year: 2022,
        month: 8,
        modelsCsv: urls
      })
    }

    return {
      _,
      mobile,
      dateSelected,
      getCurrentDate,
      modelDate,
      inputDate,
      monthPicker,
      checkValue,
      toggleLeftDrawer,
      applyfilter,
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
.models-calendar{
  font-weight: 600;
}

.q-field--filled.calendar-input{
  background: $primary-color;
  border-radius: 4px;
}

.q-field--filled.calendar-input input,
.q-field--filled.calendar-input div i{
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
    .q-toolbar__title {
      padding: 28px;
      border-top: 1px solid $grey-color;
    }
  }
}
:deep(.q-drawer__content) {
  display: flex;
  flex-direction: row;
  box-shadow: 3px 0 6px rgba(0,0,0,0.25), 2px 0 2px rgba(0,0,0,0.22);
  width: $left-drawer-width;
}

.collapsed :deep(.q-drawer__content.fit){
  width: 60px !important;
}

* {
  scrollbar-width: thin;
  scrollbar-color: #EFA501 #ccc;
}

.q-drawer__content.fit.scroll.expanded{
  width: 250px !important;
}
.lang-wrapper{
  position: relative;
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
@media (max-width: 640px) {
  .aside button {
    scale: 0.9;
  }
}
</style>
