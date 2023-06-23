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
        <q-btn :label="trans('Close')" class="ma-close-btn" @click="toggleLeftDrawer"/>
      </div>
      <div class="text-h5 toc-title-estimates">
        {{ trans('Distribution') }}
      </div>

      <div>
        <div class="category-box q-my-md">
          <q-select
            ref="qSelect"
            :label="trans('Select species')"
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
                      {{ trans('Distribution data') }}
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
        <div v-if="selectedLayers" class="wms-layers-container">
          <hr class="q-my-xl"/>
          <!-- Columns titles -->
          <div class="row">
            <div class="col-2"></div>
            <div class="col-7 text-center q-px-md transparency-title">{{ trans('Transparency') }}</div>
            <div class="col-3"></div>
          </div>
          <!-- DRAGGABLE LIST -->
            <draggable
              v-model="selectedLayers"
              item-key="id"
              ghost-class="ghost"
              animation=450
              handle=".handle"
              @change="reorderLayers"
            >
              <template #item="{ element }">
                <div class="flex row draggable-item">

                  <div class="col-2 q-pl-sm">{{ element.year }}</div>

                  <div class="col-5 q-pl-sm q-pr-xs">
                    <q-slider
                    :min="0"
                    :max="1"
                    :step="0.05"
                    class="wms-slider"
                    v-model="element.transparency"
                    color="orange"
                    @update:model-value="checkVisibility($event, element, 'transparency')"
                    />
                  </div>

                  <div class="col-3">
                    <!-- <q-checkbox
                      dense
                      checked-icon="check"
                      v-model="element.visible"
                      color="orange"
                      size="lg"
                      @update:model-value="checkVisibility($event, element, 'visible')"
                    /> -->
                    <q-toggle
                      checked-icon="check"
                      v-model="element.visible"
                      @update:model-value="checkVisibility($event, element, 'visible')"
                      color="orange"
                      size="lg"/>
                  </div>

                  <div class="col-2 text-right flex justify-end">
                    <div>
                      <a @click.stop :href="buildDownloadUrl(element)">
                        <i :title="trans('Download shp')" style="size:0.7em" class="fa-solid fa-download"></i>
                      </a>
                    </div>
                    <div>
                      <q-icon name="more_vert" class="handle" size="1.5em"/>
                    </div>
                  </div>

                </div>
              </template>
            </draggable>
        </div>
        <!-- LEGEND -->
        <div v-if="selectedLayers" class="wms-legend" >
          <div class="legend-title q-mt-lg q-mb-md">{{ trans('Legend') }}</div>
          <div class="q-mt-lg">
            <img :src="legendImageSource">
          </div>
        </div>
      </div>
    </div>
  </q-drawer>
</template>

<script>
import { watch, computed, onMounted, ref } from 'vue'
import { useAppStore } from '../stores/appStore.js'
import LeftMenu from 'components/LeftMenu.vue'
import draggable from 'vuedraggable'
// import { wmsSelectedLayers } from 'src/store/app/getters'

export default {
  components: { LeftMenu, draggable },
  props: ['expanded'],
  emits: [
    'firstMapCall',
    'toggleLeftDrawer',
    'loadWms',
    'layerVisibleChange',
    'reorderLayers',
    'exportImage'
  ],
  setup (props, context) {
    const appStore = useAppStore()
    const disabled = ref(true)
    const disabledInfo = ref(true)
    const modelVector = ref()
    const qSelect = ref()
    let currentView
    const selectedLayers = ref()

    const WMS = computed(() => {
      return JSON.parse(JSON.stringify(appStore.getWmsData))
    })

    onMounted(function () {
      currentView = JSON.parse(JSON.stringify(appStore.getCurrentWMSView))
      if ('code' in currentView) {
        const index = vectorOptions.value.findIndex(obj => {
          return (obj.code === currentView.code)
        })
        modelVector.value = vectorOptions.value[index]
        getWMS(currentView)
      }
    })

    const vectorOptions = computed(() => {
      return [
        { code: 'tiger', type: trans('Tiger mosquito'), disable: !WMS.value.tiger },
        { code: 'yellow', type: trans('Yellow fever mosquito'), disable: !WMS.value.yellow },
        { code: 'japonicus', type: trans('Japonicus mosquito'), disable: !WMS.value.japonicus },
        { code: 'koreicus', type: trans('Koreicus mosquito'), disable: !WMS.value.koreicus },
        { code: 'culex', type: trans('Culex mosquito'), disable: !WMS.value.culex }
      ]
    })

    // // Get rid off reactiveness
    const legendImageSource = computed(() => {
      const data = JSON.parse(JSON.stringify(appStore.legendData))
      const lang = appStore.getLang
      const geoserverUrl = data.wms_url
      const layerName = data.layer
      const widthSize = 40
      const heightSize = 30
      const fontName = 'Roboto'
      const fontSize = '16px'

      return `${geoserverUrl}?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=${widthSize}&HEIGHT=${heightSize}&LAYER=${layerName}&LANGUAGE=${lang}&LEGEND_OPTIONS=fontName:${fontName};fontSize:${fontSize};fontAntiAliasing:false`
    })

    const callFirstMapCall = function () {
      context.emit('firstMapCall', {})
    }

    const trans = function (text) {
      return appStore.getText(text)
    }

    // Called when TOC is toggled
    const toggleLeftDrawer = function () {
      context.emit('toggleLeftDrawer', {})
    }

    const mobile = computed(() => {
      return appStore.getIsMobile
    })

    // Called when model is selected
    const getWMS = function (formValue) {
      const code = formValue.code
      selectedLayers.value = WMS.value[code]

      appStore.setCurrentWMSView({
        code: code,
        years: JSON.parse(JSON.stringify(WMS.value[code]))
      })
      context.emit('loadWms', WMS.value[code])
    }

    const goInfoModal = function () {
      appStore.setModal({ id: 'info', content: { visibility: true, anchor: 'wms_info' } })
    }

    const startShareView = function () {
      if (!modelVector.value) {
        appStore.setModal({
          id: 'error',
          content: {
            visibility: true,
            msg: 'Must select wms first'
          }
        })
        context.emit('endShareView', {
          error: 'Shareview error. No WMS is loaded',
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

    const checkVisibility = function (e, layer, property) {
      const selectedSpecies = modelVector.value.code
      // WMS.value[selectedSpecies] = JSON.parse(JSON.stringify(selectedLayers.value))
      appStore.setWMSLayers({
        species: selectedSpecies,
        layers: JSON.parse(JSON.stringify(selectedLayers.value))
      })

      appStore.setWmsProperties({
        id: layer.id,
        property: property,
        value: e,
        species: selectedSpecies
      })

      context.emit('layerChange', {
        key: property,
        layerId: layer.id,
        value: e
      })
    }

    const reorderLayers = function () {
      const selectedSpecies = modelVector.value.code
      appStore.setWMSLayers({
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
      appStore.setWMSLayers({
        species: view.species,
        layers: view.layers
      })
      getWMS({ code: view.species })
    }

    const exportImage = function () {
      console.log('emit')
      context.emit('exportImage', {})
    }

    const buildDownloadUrl = (element) => {
      const downLink = `${element.wms_url}?service=WFS&version=1.0.0&request=GetFeature&typeName=${element.layer}&outputFormat=SHAPE-ZIP`
      return downLink
      // https://mapserver.mosquitoalert.com/geoserver/mosquitoalert/wms?service=WFS&version=1.0.0&request=GetFeature&typeName=mosquitoalert%3Astatus_2303_shp&outputFormat=SHAPE-ZIP
    }
    return {
      trans,
      buildDownloadUrl,
      exportImage,
      selectedLayers,
      legendImageSource,
      setForm,
      reorderLayers,
      qSelect,
      checkVisibility,
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
  text-transform: Capitalize;
  font-weight: 700;
  color: #666666;
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
