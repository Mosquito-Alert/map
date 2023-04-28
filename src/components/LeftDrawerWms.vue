º<!--
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
    <left-menu item="wms"
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
        {{ trans('WMS') }}
      </div>

      <div>
        <div class="category-box q-my-md">
          <q-select
            :label="trans('Select species')"
            v-model="modelVector"
            color="orange"
            :label-color="modelVector?'orange':'rgba(0, 0, 0, 0.6)'"
            :options="categories"
            :option-value="'code'"
            :option-label="'type'"
            @update:model-value="getWMS"
          />

          </div>
          <!-- INFO LINK -->
            <div class="q-mt-xl flex-center model-buttons">
              <div>
                <div @click="goInfoModal">
                  <div class="div-link flex-center q-ml-xs">
                    <div>
                      <i class="fa-thin fa-circle-info"></i>
                    </div>
                    <div class="q-ml-xs lower-case capitalFirstLetter">
                      {{ trans('WMS info link') }}
                    </div>
                  </div>
                </div>
              </div>
            <div>
            <!-- END INFO LINK -->
          </div>

        </div>

        <!-- YEARS FOR SELECTED SPECIES -->
        <div v-if="selectedLayers" class="wms-layers-container">
          <!-- Columns titles -->
          <div class="row">
            <div class="col-2"></div>
            <div class="col-2 q-px-md"></div>
            <div class="col-8 text-center">{{ trans('Transparency') }}</div>
          </div>
          <div v-for="(layer, index) in selectedLayers" :key="index" class="flex row">
            <div class="col-2">
              <q-checkbox
                dense
                checked-icon="check"
                v-model="layer.visible"
                color="orange"
                size="lg"
                @update:model-value="checkVisibility($event, layer.id, 'visible')"
              />
            </div>

            <div class="col-2 q-px-xs">{{ layer.year }}</div>

            <div class="col-8 q-px-sm">
              <q-slider
              :min="0"
              :max="1"
              :step="0.05"
              v-model="layer.transparency"
              color="orange"
              @update:model-value="checkVisibility($event, layer.id, 'transparency')"
              />
            </div>
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

export default {
  components: { LeftMenu },
  props: ['expanded'],
  emits: [
    'firstMapCall',
    'toggleLeftDrawer',
    'loadWms',
    'layerVisibleChange'
  ],
  setup (props, context) {
    const $store = useStore()
    const disabled = ref(true)
    const disabledInfo = ref(true)
    const modelVector = ref()
    const selectedLayers = ref()
    let WMS

    onMounted(function () {
      WMS = JSON.parse(JSON.stringify($store.getters['app/getWmsData']))
      for (const species in WMS) {
        for (const layer in WMS[species]) {
          if (layer < 2) {
            WMS[species][layer].visible = true
          } else {
            WMS[species][layer].visible = false
          }
          WMS[species][layer].transparency = 0.5
          WMS[species][layer].id = species + '_' + layer
        }
      }
    })

    // Get rid off reactiveness

    const callFirstMapCall = function () {
      context.emit('firstMapCall', {})
    }

    // Read default uncertainty color from store
    // const models = computed(() => {
    //   return $store.getters['app/getModels']
    // })

    const categories = computed(() => {
      return [
        { code: 'tiger', type: trans('Tiger mosquito') },
        { code: 'yellow', type: trans('Yellow fever mosquito') },
        { code: 'japonicus', type: trans('Japonicus mosquito') },
        { code: 'koreicus', type: trans('Koreicus mosquito') },
        { code: 'culex', type: trans('Culex mosquito') }
      ]
    })

    const trans = function (text) {
      return $store.getters['app/getText'](text)
    }

    // Called when TOC is toggled
    const toggleLeftDrawer = function () {
      context.emit('toggleLeftDrawer', {})
    }

    const mobile = computed(() => {
      return $store.getters['app/getIsMobile']
    })

    // Called when model is selected
    const getWMS = function (formValue) {
      const code = formValue.code
      selectedLayers.value = WMS[code]
      context.emit('loadWms', WMS[code])
    }

    // Update UI when loading a model from a shared view
    const loadSharedModel = async function (payload) {
    }

    const goInfoModal = function () {
      $store.commit('app/setModal', { id: 'info', content: { visibility: true, anchor: 'modeled_info' } })
    }

    const startShareView = function () {
      context.emit('startShareView', {})
    }

    // Required to change lang on current selection
    watch(categories, (cur, old) => {
      if (modelVector.value) {
        if (modelVector.value.code) {
          const index = cur.findIndex(obj => {
            return (obj.code === modelVector.value.code)
          })
          modelVector.value = cur[index]
        }
      }
    })

    const checkVisibility = function (e, layerId, property) {
      context.emit('layerChange', {
        key: property,
        layerId,
        value: e
      })
    }

    return {
      trans,
      checkVisibility,
      selectedLayers,
      goInfoModal,
      loadSharedModel,
      disabled,
      disabledInfo,
      categories,
      mobile,
      toggleLeftDrawer,
      getWMS,
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
.wms-layers-container{
  margin-top: 20px;
  padding: 10px;
  color: $dark-grey;
  border: 1px solid $grey-color;
}
.wms-layers-item{
  display: flex;
  vertical-align: bottom;
  align-content: stretch;
  flex-wrap: nowrap;
  flex-direction: row;
  margin: 3px 0px;
}
.flex-expand{
  flex-grow: 1;
}
.flex.row{
  align-items:center;
}
</style>
