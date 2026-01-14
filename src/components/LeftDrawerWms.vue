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
    <left-menu item="wms"
      @leftMenuMounted="callFirstMapCall"
      @startShareView="startShareView"
    />

    <!-- Drawer content -->
    <div class="toc-models"
      :class="expanded?'expanded':'collapsed'"
    >
      <div v-if="mobile" class="text-right q-ma-md">
        <q-btn :label="$t('close')" class="ma-close-btn" @click="toggleLeftDrawer"/>
      </div>
      <div class="text-h5 toc-title-estimates">
        {{ $t('discoveries') }}
      </div>

      <div>
        <div class="category-box q-my-md">
          <q-select
            ref="qSelect"
            :label="$t('select_species')"
            v-model="modelVector"
            color="orange"
            :label-color="modelVector?'orange':'rgba(0, 0, 0, 0.6)'"
            :options="vectorOptions"
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
                    <div class="q-ml-xs">
                      {{ $t('discoveries_data') }}
                    </div>
                  </div>
                </div>
                <!-- Not visible link. Required to export map image -->
                <a id="image-download" download="map.png"></a>
              </div>
            <div>
            <!-- END INFO LINK -->
          </div>

        </div>

        <!-- YEARS FOR SELECTED SPECIES -->
        <div v-if="selectedLayers">
          <hr class="q-my-xl"/>
          <!-- Columns titles -->
          <div class="row">
            <div class="col-2"></div>
            <div class="col-7 text-center q-px-md transparency-title">{{ $t('opacity') }}</div>
            <div class="col-3"></div>
          </div>
          <!-- DRAGGABLE LIST -->
          <div class="flex row draggable-item justify-center">
            <div class="col-7 q-pl-sm q-pr-xs">
              <q-slider
              :min="0"
              :max="1"
              :step="0.05"
              class="wms-slider"
              v-model="localOpacity"
              color="orange"
              />
            </div>

            <div class="col-3">
              <q-toggle
                checked-icon="check"
                v-model="localVisible"
                color="orange"
                size="lg"/>
            </div>

            <q-btn flat round color="orange" icon="fa fa-solid fa-download" size="sm" :loading=loadingDownload @click="downloadShapefile">
              <q-tooltip>Download shp</q-tooltip>
            </q-btn>
          </div>
        <!-- LEGEND -->
        <div class="wms-legend" >
          <div class="legend-title q-mt-lg q-mb-md">{{ $t('legend') }}</div>
          <div class="q-mt-lg">
            <img :src="legendImageSource">
          </div>
        </div>
      </div>
      </div>
    </div>
  </q-drawer>
</template>

<script>
import { watch, computed, ref } from 'vue'
import { useStore } from 'vuex'
import LeftMenu from 'components/LeftMenu.vue'
import { exportFile } from 'quasar'
import { useI18n } from 'vue-i18n'

export default {
  components: { LeftMenu },
  props: ['expanded', 'wmsUrl', 'layerName'],
  emits: [
    'firstMapCall',
    'toggleLeftDrawer',
    'loadWms',
    'reorderLayers',
    'exportImage',
    'opacityChange',
    'visibleChange'
  ],
  setup (props, context) {
    const $store = useStore()
    const { t } = useI18n()

    const disabled = ref(true)
    const disabledInfo = ref(true)
    const modelVector = ref()
    const qSelect = ref()
    const selectedLayers = ref()
    const localOpacity = ref(1.0)
    const localVisible = ref(true)
    const loadingDownload = ref(false)

    watch(localOpacity, value => {
      context.emit('opacityChange', value)
    })

    watch(localVisible, value => {
      context.emit('visibleChange', value)
    })

    const WMS = computed(() => {
      return JSON.parse(JSON.stringify($store.getters['app/getWmsData']))
    })

    const vectorOptions = computed(() => {
      return [
        { code: 'tiger', type: t('Tiger mosquito'), wms_field: 'albopictus', disable: false },
        { code: 'yellow', type: t('Yellow fever mosquito'), wms_field: 'aegypti', disable: false },
        { code: 'japonicus', type: t('Japonicus mosquito'), wms_field: 'japonicus', disable: false },
        { code: 'koreicus', type: t('Koreicus mosquito'), wms_field: 'koreicus', disable: false }
      ]
    })

    // // Get rid off reactiveness
    const legendImageSource = computed(() => {
      const lang = $store.getters['app/getLang']
      const geoserverUrl = 'https://mapserver.mosquitoalert.com/geoserver/wms'
      const layerName = 'mosquitoalert:discoveries'
      const widthSize = 40
      const heightSize = 30
      const fontName = 'Roboto'
      const fontSize = '16px'

      return `${geoserverUrl}?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=${widthSize}&HEIGHT=${heightSize}&LAYER=${layerName}&LANGUAGE=${lang}&LEGEND_OPTIONS=fontName:${fontName};fontSize:${fontSize};fontAntiAliasing:false`
    })

    const callFirstMapCall = function () {
      context.emit('firstMapCall', {})
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
      selectedLayers.value = formValue.code
      context.emit('loadWms', formValue.wms_field)
      context.emit('opacityChange', localOpacity.value)
    }

    const goInfoModal = function () {
      $store.commit('app/setModal', { id: 'info', content: { visibility: true, anchor: 'wms_info' } })
    }

    const startShareView = function () {
      if (!modelVector.value) {
        $store.commit('app/setModal', {
          id: 'error',
          content: {
            visibility: true,
            msg: 'Must select a species first'
          }
        })
        context.emit('endShareView', {
          error: 'Shareview error. No species layer is loaded',
          visibility: true,
          url: ''
        })
      } else {
      // Prepare WMS data.
        const layersJSON = JSON.parse(JSON.stringify(selectedLayers.value))
        // const visibleLayers = layersJSON.filter((layer) => {
        //   return layer.visible === true
        // })
        const payload = {
          species: modelVector.value.code,
          layers: layersJSON
        }
        context.emit('startShareView', payload)
      }
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

    const reorderLayers = function () {
      const selectedSpecies = modelVector.value.code
      $store.commit('app/setWMSLayers', {
        species: selectedSpecies,
        layers: JSON.parse(JSON.stringify(selectedLayers.value))
      })
      context.emit('reorderLayers',
        JSON.parse(JSON.stringify(selectedLayers.value))
      )
    }

    const setForm = function (view) {
      const index = vectorOptions.value.findIndex(obj => {
        return (obj.code === view.species)
      })
      modelVector.value = vectorOptions.value[index]
      // override wms from shared view
      WMS[view.species] = view.layers
      selectedLayers.value = view.layers
      $store.commit('app/setWMSLayers', {
        species: view.species,
        layers: view.layers
      })
      getWMS({ code: view.species })
    }

    const exportImage = function () {
      console.log('emit')
      context.emit('exportImage', {})
    }

    const downloadShapefile = async function () {
      const url = 'https://mapserver.mosquitoalert.com/geoserver/mosquitoalert/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=mosquitoalert:discoveries&outputFormat=SHAPE-ZIP'
      loadingDownload.value = true

      try {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const blob = await response.blob()
        exportFile('discoveries.zip', blob)
      } catch (err) {
        console.error('Failed to download shapefile:', err)
      } finally {
        loadingDownload.value = false
      }
    }

    return {
      loadingDownload,
      localOpacity,
      localVisible,
      downloadShapefile,
      exportImage,
      selectedLayers,
      legendImageSource,
      setForm,
      reorderLayers,
      qSelect,
      goInfoModal,
      disabled,
      disabledInfo,
      modelVector,
      vectorOptions,
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
  font-weight: 700;
  color: #666666;
}
.toc-title-estimates::first-letter{
  text-transform: uppercase;
}
.wms-layers-container{
  margin-top: 20px;
  // padding: 10px;
  color: $dark-grey;
  // border: 1px solid $grey-color;
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
.handle{
  opacity:0;
  cursor: move;
}
.draggable-item{
  padding: 0px 0px;
  border-radius: 5px;
  background-color: $grey-color;
  margin: 3px 0px;
}
.draggable-item:hover .handle{
  opacity:1
}
.legend-title{
  display: none;
}
.wms-slider {
  height: 2px;
}
.transparency-title{
  color: black;
}
.no-pad-right{
  padding-right: 0px;
}
.fa-download{
  cursor: pointer;
  color: #ff9800 ;
}
</style>
