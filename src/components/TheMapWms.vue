<!--
  MAP COMPONENT FOR MODELS TAB
-->

<template>
  <div id='mapa' class='bg-white'>
    <q-linear-progress :value="progress" color="orange" class="progress-bar-absolute"  v-if="progress>0 && progress<100"/>
    <q-btn v-if="mobile"
      class="drawer-handler-mobile"
      @click="toggleLeftDrawer"
    >
      <q-icon name="menu" />
    </q-btn>
    <q-btn v-else :icon="leftDrawerIcon" class="drawer-handler" @click="toggleLeftDrawer" />

    <ol-map ref='map'
      :loadTilesWhileAnimating='true'
      :loadTilesWhileInteracting='true'
      @movestart='hideSpinner'
      @moveend='updateMap'
      style='height:100%'>

        <ol-zoom-control :duration='600' />
        <ol-view ref='view'
            :multiWorld=false
            :maxZoom=19
            :maxResolution=39135.75848201024
            :center='center'
            :zoom='zoom'
            :constrainResolution='true' />

        <div
          class="ol-attribution"
          :class="mobile?(!attrVisible?'mobile collapsed':'mobile'):''"
        >
          <div v-if="!mobile || attrVisible">
            © <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap </a> contributors, © <a href='https://carto.com/about-carto'>Carto</a>
            | <a href="https://openlayers.org" target="_blank">OpenLayers</a>
          </div>
          <div v-if="mobile"
            class="attr-folder"
            v-html="foldingIcon"
            @click="unfoldAttribution"
          >
          </div>
        </div>
        <!-- base map -->
        <ol-tile-layer ref='baseMap' title='mapbox' :zIndex=0>
          <ol-source-xyz url='https://basemaps.cartocdn.com/rastertiles/light_nolabels/{z}/{x}/{y}.png' :preload="Infinity"/>
        </ol-tile-layer>
        <!-- Place labels layers -->
        <ol-tile-layer :z-index="10">
          <ol-source-xyz url="https://basemaps.cartocdn.com/rastertiles/light_only_labels/{z}/{x}/{y}.png" :preload="Infinity" :opaque="false" />
        </ol-tile-layer>
    </ol-map>
    <!-- DOWNLOAD BUTTON -->
    <!-- <cust-control
          ref="donwnloadControl"
          icon="fa-solid fa-download"
          class="wms ol-download ol-unselectable ol-control"
          :class="wmsNumberOfVisibleLayers?'enabled':'disabled'"
          title="Export map image"
          @clicked="exportPNG"
        >
        </cust-control> -->
  </div>
</template>

<script>
import 'vue3-openlayers/dist/vue3-openlayers.css'
// import CustControl from './CustControl'
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { transform } from 'ol/proj.js'
import TileLayer from 'ol/layer/Tile.js'
import TileWMS from 'ol/source/TileWMS.js'

export default defineComponent({
  name: 'TheMapModels',
  components: { },
  emits: [
    'toggleLeftDrawer',
    'endShareView',
    'loadSharedModel'
  ],
  props: ['viewCode', 'wmsUrl', 'layerName'],
  setup (props, context) {
    const map = ref('null')
    const leftDrawerIcon = ref('null')
    const $store = useStore()
    const baseMap = ref('null')
    const attrVisible = ref(false)
    const foldingIcon = ref('<')

    const wmsLayer = new TileLayer({
      visible: true
    })

    // Map general configuration
    const zoom = computed(() => {
      return mobile.value ? $store.getters['map/getCurrents'].MOBILEZOOM : $store.getters['map/getCurrents'].ZOOM
    })

    const center = computed(() => {
      const center = $store.getters['map/getCurrents'].CENTER
      return transform(center, 'EPSG:4326', 'EPSG:3857')
    })

    const mobile = computed(() => {
      return $store.getters['app/getIsMobile']
    })

    const toggleLeftDrawer = function () {
      context.emit('toggleLeftDrawer', {})
      leftDrawerIcon.value = (leftDrawerIcon.value === 'keyboard_arrow_right') ? 'keyboard_arrow_left' : 'keyboard_arrow_right'
    }

    const wmsNumberOfVisibleLayers = computed(() => {
      return $store.getters['app/wmsNumberOfVisibleLayers']
    })

    function unfoldAttribution () {
      // attrVisible.value = !attrVisible.value
      // if (attrVisible.value) {
      //   foldingIcon.value = '>'
      // } else {
      //   foldingIcon.value = '<'
      // }
    }

    onMounted(function () {
      leftDrawerIcon.value = 'keyboard_arrow_left'
      map.value.map.addLayer(wmsLayer)
    })

    const trans = function (text) {
      return $store.getters['app/getText'](text)
    }

    // const loadViewUrl = backendUrl + 'view/load/'

    // Call when user shares view
    function shareWmsView (data) {
      handleShareView()
    }

    // Handle shared view
    // Handle shared view
    function handleShareView () {
      const frontend = $store.getters['app/getFrontendUrl']
      const content = {
        url: frontend + 'discoveries/' + $store.getters['app/getLang'],
        visibility: true,
        error: ''
      }
      $store.commit('app/setModal', {
        id: 'share',
        content: content
      })

      context.emit('endShareView', content)
    }
    // Load shared view. Get data from database and then handle it
    // function loadView (viewCode) {
    // }

    // Handle shared view
    // function handleLoadView (response) {
    // }

    function updateMap () {
      // Save view params into store
      const newZoom = map.value.map.getView().getZoom()
      $store.commit('map/setCurrents', {
        zoom: newZoom,
        center: transform(
          map.value.map.getView().getCenter(),
          'EPSG:3857', 'EPSG:4326'
        )
      })
    }

    const reorderLayers = function (wms) {
      console.log('reorderLayers')
    }

    const loadWmsLayer = function (fieldName) {
      const wmsSource = new TileWMS({
        crossOrigin: 'anonymous',
        projection: 'EPSG:3857',
        url: 'https://mapserver.mosquitoalert.com/geoserver/mosquitoalert/wms',
        params: {
          LAYERS: 'mosquitoalert:discoveries',
          SRS: 'EPSG:3857',
          env: 'field:' + fieldName
        }
      })

      wmsLayer.setSource(wmsSource)

      $store.commit('app/setWmsNumberOfVisibleLayers', 1)
    }

    const updateOpacity = function (value) {
      wmsLayer.setOpacity(value)
    }

    const updateVisible = function (value) {
      wmsLayer.setVisible(value)
    }

    const findLayer = function (id) {
      return map.value.map.getLayers().array_.find((layer) => {
        return layer.get('id') === id
      })
    }

    const changeLayerProperty = function (payload) {
      try {
        const layer = findLayer(payload.layerId)
        if (payload.key === 'visible') {
          layer.setVisible(payload.value)
          if (payload.value) {
            $store.commit('app/increaseWmsNumberOfVisibleLayers')
          } else {
            $store.commit('app/decreaseWmsNumberOfVisibleLayers')
          }
        } else {
          if (payload.key === 'transparency') {
            layer.setOpacity(1 - payload.value)
          }
        }
      } catch (err) {
        console.log(err)
      }
    }
    const fitExtent = function (extent) {
      map.value.map.getView().fit(extent, { minResolution: 50, nearest: false }
      )
    }

    const exportPNG = function () {
      map.value.map.once('rendercomplete', function () {
        const mapCanvas = document.createElement('canvas')
        const size = map.value.map.getSize()
        mapCanvas.width = size[0]
        mapCanvas.height = size[1]
        const mapContext = mapCanvas.getContext('2d')
        Array.prototype.forEach.call(
          map.value.map.getViewport().querySelectorAll('.ol-layer canvas, canvas.ol-layer'),
          function (canvas) {
            if (canvas.width > 0) {
              const opacity =
                canvas.parentNode.style.opacity || canvas.style.opacity
              mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity)
              let matrix
              const transform = canvas.style.transform
              if (transform) {
                // Get the transform parameters from the style's transform matrix
                matrix = transform
                  .match(/^matrix\(([^(]*)\)$/)[1]
                  .split(',')
                  .map(Number)
              } else {
                matrix = [
                  parseFloat(canvas.style.width) / canvas.width,
                  0,
                  0,
                  parseFloat(canvas.style.height) / canvas.height,
                  0,
                  0
                ]
              }
              // Apply the transform to the export map context
              CanvasRenderingContext2D.prototype.setTransform.apply(
                mapContext,
                matrix
              )
              const backgroundColor = canvas.parentNode.style.backgroundColor
              if (backgroundColor) {
                mapContext.fillStyle = backgroundColor
                mapContext.fillRect(0, 0, canvas.width, canvas.height)
              }
              mapContext.drawImage(canvas, 0, 0)
            }
          }
        )
        mapContext.globalAlpha = 1
        mapContext.setTransform(1, 0, 0, 1, 0, 0)
        const link = document.getElementById('image-download')
        link.href = mapCanvas.toDataURL()
        link.click()
      })
      map.value.map.renderSync()
    }

    return {
      trans,
      wmsNumberOfVisibleLayers,
      fitExtent,
      reorderLayers,
      loadWmsLayer,
      changeLayerProperty,
      updateOpacity,
      updateVisible,
      exportPNG,
      baseMap,
      updateMap,
      center,
      zoom,
      mobile,
      // loadView,
      shareWmsView,
      toggleLeftDrawer,
      attrVisible,
      foldingIcon,
      unfoldAttribution,
      leftDrawerIcon,
      map
    }
  }
})
</script>

<style lang="scss">
  #mapa {
    flex: 1;
    position: relative;
  }
  .ol-zoom {
    bottom: 25px;
  }

  div.ol-zoom button.ol-zoom-in,
  div.ol-zoom button.ol-zoom-out{
    border-radius:10px;
  }
  .ol-zoom {
    border-radius: 10px;
    position: absolute;
    top: auto;
    right: 0.5em;
    left: auto;
    display: flex;
    flex-direction: column;
    background: none;
    z-index:20;
  }

  .ol-zoom button:focus,
  .ol-zoom button{
    background: $primary-button-background;
    color: $primary-button-text;
    border: none;
    width: 40px;
    height: 40px;
    line-height: 40px;
    margin-bottom: 6px;
    font-size: 2em;
    font-weight: normal;
    cursor: pointer;
    padding: 0 0 20px 0;
    box-shadow: $box-shadow;
    // box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
  }

  .ol-zoom button:hover {
    background: $primary-button-background-hover;
    color: $primary-button-text-hover;
    box-shadow: 0 7px 14px rgba(0,0,0,0.25), 0 5px 5px rgba(0,0,0,0.22);
    transition: all .6s cubic-bezier(.25,.8,.25,1);
  }
  //move the tooltips to the left of the zoom controls
  .ol-zoom .ol-has-tooltip:hover [role=tooltip] {
     left: -5.5em;
     border-radius: 4px 0 0 4px;
  }
  .ol-zoom .ol-zoom-out.ol-has-tooltip:hover [role=tooltip]{
     left: -6.2em;
  }
  .ol-attribution {
    position: absolute;
    top: auto;
    left: auto;
    bottom: 4px;
    right: 10px;
    z-index: 9;
    font-size: 10px;
    color: white;
    padding: 4px 10px;
    border-radius: 10px;
    height: 20px;
    line-height: 13px;
    display:inline-block;
  }
  .ol-attribution:not(.ol-collapsed){
    background: #33333342;
  }
  .ol-attribution div{
    display:inline;
  }

  .ol-attribution.mobile.collapsed .attr-folder{
    padding: 2px 4px;
  }

  .ol-attribution.mobile .attr-folder{
    padding: 2px 4px 2px 10px;
  }

  .ol-attribution.mobile{
    background: #333333aa;
    z-index:950;
  }

  .ol-attribution.mobile.collapsed{
    padding: 4px 6px;
  }

  .unfold-attribution{
    cursor: pointer;
  }

  .ol-control:hover {
    background-color: unset;
  }
  .ol-attribution a {
    color: #3498DB;
    text-decoration:none;
    &:hover{
      text-decoration:underline;
    }
  }
  .drawer-handler{
    background-color: $primary-color;
    position: absolute;
    top: $header-height;
    z-index: 100;
    padding: 20px 5px;
    cursor: pointer;
    border-radius: 0 10px 10px 0;
  }
  .drawer-handler-mobile{
    background-color: $primary-color;
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 100;
    padding: 10px;
    cursor: pointer;
    border-radius: 50%;
  }
.drawer-handler span i,
.drawer-handler-mobile span i{
  color: white;
}
.wms.ol-download{
  bottom: 130px;
  background: transparent;
}

.wms.ol-download.ol-control button {
  // background: $primary-button-background;
  color: white
}
</style>
