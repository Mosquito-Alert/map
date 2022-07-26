/* eslint-disable no-unused-vars */
<template>
  <div id='mapa' class='bg-white'>
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
      style='height:100%'>

        <ol-zoom-control :duration='600' />
        <ol-view ref='view'
            maxZoom="19"
            :center='center'
            :zoom='zoom'
            :constrainResolution='false' />

        <div
          class="ol-attribution"
          :class="mobile?(!attrVisible?'mobile collapsed':'mobile'):''"
        >
          <div v-if="!mobile || attrVisible">
            © <a href="https://www.openstreetmap.org/copyright/" target="_blank">OpenStreetMap</a> contributors
            <!-- | © <a href="https://mapbox.com" target="_blank">Mapbox</a> -->
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
        <ol-tile-layer ref='baseMap' title='mapbox' zIndex="0">
          <ol-source-osm />
            <!-- <ol-source-xyz
              crossOrigin='anonymous'
              url='https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwZXNiYXNlc2lndGUiLCJhIjoiY2wxbHRmZXliMDlkeDNrcG40dm14OWZmNiJ9.UFRSz8T_c4riZkH3CyGgBQ' /> -->
        </ol-tile-layer>

    </ol-map>
  </div>
</template>

<script>
import 'vue3-openlayers/dist/vue3-openlayers.css'
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { transform } from 'ol/proj.js'
import MVT from 'ol/format/MVT'
import VectorTileLayer from 'ol/layer/VectorTile'
import VectorTileSource from 'ol/source/VectorTile'
import { Style, Fill } from 'ol/style'
import { Group as LayerGroup } from 'ol/layer'
import ShareMapView from '../js/ShareMapView'
import moment from 'moment'
// import { Base64 } from 'js-base64'
// import { RawDeflate, RawInflate, Deflate, Inflate, Gzip, Gunzip, Zip, Unzip } from 'zlibt2'
import { Buffer } from 'buffer'
// import { ungzip } from 'pako'

export default defineComponent({
  name: 'TheMapModels',
  emits: [
    'toggleLeftDrawer',
    'mapViewSaved',
    'setModelDate'
  ],
  props: ['viewCode'],
  setup (props, context) {
    const map = ref('null')
    const attrVisible = ref(false)
    const foldingIcon = ref('<')
    const leftDrawerIcon = ref('null')
    const $store = useStore()
    const CSVS = {}
    const GADM0 = 'gadm0'
    const GADM1 = 'gadm1'
    const GADM2 = 'gadm2'
    const backendUrl = $store.getters['app/getBackend']

    // Map general configuration
    const zoom = computed(() => {
      return mobile.value ? $store.getters['map/getDefault'].MOBILEZOOM : $store.getters['map/getDefault'].ZOOM
    })

    const center = computed(() => {
      const center = $store.getters['map/getDefault'].CENTER
      return transform(center, 'EPSG:4326', 'EPSG:3857')
    })

    const mobile = computed(() => {
      return $store.getters['app/getIsMobile']
    })

    const toggleLeftDrawer = function () {
      context.emit('toggleLeftDrawer', {})
      leftDrawerIcon.value = (leftDrawerIcon.value === 'keyboard_arrow_right') ? 'keyboard_arrow_left' : 'keyboard_arrow_right'
    }

    function unfoldAttribution () {
      attrVisible.value = !attrVisible.value
      if (attrVisible.value) {
        foldingIcon.value = '>'
      } else {
        foldingIcon.value = '<'
      }
    }

    onMounted(function () {
      leftDrawerIcon.value = 'keyboard_arrow_left'
      map.value.map.on('pointermove', function (event) {
        const hit = this.forEachFeatureAtPixel(event.pixel, function (feature, layer) {
          return true
        }, { hitTolerance: 10 })
        if (hit) this.getTargetElement().style.cursor = 'pointer'
        else this.getTargetElement().style.cursor = ''
      })

      const paramViewCode = (props.viewCode) ? props.viewCode : null
      if (paramViewCode) {
        // Add model prefix to code
        loadView(map.value.map, 'M-' + paramViewCode)
      }
    })

    const _ = function (text) {
      return $store.getters['app/getText'](text)
    }

    const shareViewUrl = backendUrl + 'api/view/save/'
    const loadViewUrl = backendUrl + 'api/view/load/'

    function shareModelView () {
      const modelDate = $store.getters['map/getModelDate']
      console.log(modelDate)
      if (!modelDate) {
        context.emit('mapViewSaved', { status: 'error', msg: 'Share view error. No model is loaded' })
        return
      }
      const ol = map.value.map
      const newView = new ShareMapView(ol, {
        viewType: 'models',
        modelDate,
        url: shareViewUrl,
        callback: handleShareView
      })
      newView.save()
    }

    function handleShareView (status) {
      if (status.status === 'error') {
        console.log(status.msg)
      } else {
        console.log(status.code)
      }
      context.emit('mapViewSaved', status)
    }

    function loadView (ol, viewCode) {
      const newView = new ShareMapView(ol, {
        url: loadViewUrl + viewCode
      })
      newView.load(handleLoadView)
    }

    function handleLoadView (response) {
      const d = response.view[0].date
      context.emit('setModelDate', moment(d).startOf('year').format('MM/YYYY'))
      const jsonView = JSON.parse(response.view[0].view)
      $store.commit('map/setDefaults', {
        zoom: jsonView.zoom,
        center: transform(jsonView.center, 'EPSG:3857', 'EPSG:4326'),
        mobilezoom: jsonView.zoom
      })
    }

    function csvJSON (csv, model) {
      // const lines = csv.split('\n')
      const lines = csv.split(/\r?\n/)
      const dict = {}
      console.log(model)
      const fields = $store.getters['app/getModelsFieldNames']
      const jsonFields = JSON.parse(JSON.stringify(fields))
      const headers = lines[0].split(',')
      const indexId = headers.indexOf(jsonFields[model].id)
      const indexEst = headers.indexOf(jsonFields[model].est)
      if (model === GADM2) {
        console.log(headers)
        console.log(indexId)
        console.log(indexEst)
      }
      // const indexSe = headers.indexOf('prob')
      for (let i = 1; i < lines.length; i++) {
        const currentLine = lines[i].split(',')
        const nutsId = currentLine[indexId]
        const prob = currentLine[indexEst]
        // const se = currentLine[indexSe]
        dict[nutsId] = prob
      }
      return dict
    }

    function spinner (status) {
      $store.commit('app/setModal', {
        id: 'wait',
        content: {
          visibility: status
        }
      })
    }

    const loadModel = async function (data) {
      console.log(data)
      map.value.map.removeLayer(modelsLayer)
      spinner(false)

      const urls = data.modelsCsv

      await Promise.all(urls.map(m =>
        // fetch(m).then(resp => resp.text())
        fetch(m).then(resp => resp.json())
      )).then(texts => {
        // Check for errors
        texts.forEach(text => {
          const encoded = text.content
          const buf = Buffer.from(encoded, 'base64')
          const decoded = buf.toString('utf-8')
          if (!('0' in CSVS)) {
            CSVS['0'] = csvJSON(decoded, GADM0)
          } else if (!('1' in CSVS)) {
            CSVS['1'] = csvJSON(decoded, GADM1)
          } else if (!('2' in CSVS)) {
            CSVS['2'] = csvJSON(decoded, GADM2)
          }
        })
        console.log(CSVS)
        map.value.map.addLayer(modelsLayer)
        gadm0.on('prerender', function () {
          spinner(true)
        })
        gadm1.on('prerender', function () {
          spinner(true)
        })
        gadm2.on('prerender', function () {
          spinner(true)
        })

        map.value.map.on('rendercomplete', function () {
          console.log('postrender')
          spinner(false)
        })
      }).catch((error) => {
        console.log(error)
      })
    }

    const styles = {}
    const colorizeGadm0 = (feature, style) => {
      return colorizeGadm(feature, style, CSVS['0'])
    }

    const colorizeGadm1 = (feature, style) => {
      return colorizeGadm(feature, style, CSVS['1'])
    }
    const colorizeGadm2 = (feature, style) => {
      return colorizeGadm(feature, style, CSVS['2'])
    }

    const colorizeGadm = (feature, style, CSV) => {
      const id = feature.properties_.id
      const value = CSV[id]
      if (value === undefined) {
        return null
      }
      if (value < 0.0000025) {
        if (!('1' in styles)) {
          styles['1'] = new Fill({
            color: 'rgb(254,235,226, 1)'
          })
          style = styles['1']
        } else {
          style = styles['1']
        }
      } else if (value < 0.00012) {
        if (!('2' in styles)) {
          styles['2'] = new Fill({
            color: 'rgb(251,180,185, 1)'
          })
          style = styles['2']
        } else {
          style = styles['2']
        }
      } else if (value < 0.00015) {
        if (!('3' in styles)) {
          styles['3'] = new Fill({
            color: 'rgb(247,104,161, 1)'
          })
          style = styles['3']
        } else {
          style = styles['3']
        }
      } else {
        if (!('4' in styles)) {
          styles['4'] = new Fill({
            color: 'rgb(174,1,126, 1)'
          })
          style = styles['4']
        } else {
          style = styles['4']
        }
      }

      return new Style({
        fill: style
      })
    }

    const gadm0 = new VectorTileLayer({
      minZoom: 0,
      maxZoom: 3,
      declutter: true,
      renderMode: 'hybrid',
      source: new VectorTileSource({
        format: new MVT(),
        url: backendUrl + 'api/tiles/gadm0/{z}/{x}/{y}'
      }),
      style: colorizeGadm0
    })

    const gadm1 = new VectorTileLayer({
      minZoom: 3,
      maxZoom: 5,
      declutter: true,
      renderMode: 'hybrid',
      source: new VectorTileSource({
        format: new MVT(),
        url: backendUrl + 'api/tiles/gadm1/{z}/{x}/{y}'
      }),
      style: colorizeGadm1
    })

    const gadm2 = new VectorTileLayer({
      minZoom: 5,
      maxZoom: 17,
      declutter: true,
      renderMode: 'hybrid',
      source: new VectorTileSource({
        maxZoom: 7,
        format: new MVT(),
        url: backendUrl + 'api/tiles/gadm2/{z}/{x}/{y}'
      }),
      style: colorizeGadm2
    })

    const modelsLayer = new LayerGroup({
      layers: [gadm0, gadm1, gadm2]
    })

    return {
      _,
      center,
      zoom,
      mobile,
      loadView,
      shareModelView,
      toggleLeftDrawer,
      attrVisible,
      foldingIcon,
      unfoldAttribution,
      leftDrawerIcon,
      map,
      loadModel
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
    background: #33333342;
    font-size: 10px;
    color: white;
    padding: 4px 10px;
    border-radius: 10px;
    height: 20px;
    line-height: 13px;
    display:inline-block;
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
</style>
