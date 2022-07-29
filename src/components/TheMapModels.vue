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
      @moveend='showZoom'
      style='height:100%'>

        <ol-zoom-control :duration='600' />
        <ol-view ref='view'
            multiWorld="true"
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
import { Style, Fill, Stroke } from 'ol/style'
import { Group as LayerGroup } from 'ol/layer'
import ShareMapView from '../js/ShareMapView'
import moment from 'moment'
import { getInterpolatedColor } from '../js/InterpolateColors.js'
import { GeojsonFromCsv } from '../js/GeojsonFromCsv.js'
import { Buffer } from 'buffer'
import GridModelLayer from '../js/GridModelLayer'

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
    const baseMap = ref('null')
    const attrVisible = ref(false)
    const foldingIcon = ref('<')
    const leftDrawerIcon = ref('null')
    const $store = useStore()
    let CSVS = {}
    let CENTROIDS = {}
    const GADM0 = 'gadm0'
    const GADM1 = 'gadm1'
    const GADM2 = 'gadm2'
    const backendUrl = $store.getters['app/getBackend']
    let estModelLayer
    let seModelLayer = null
    let seModelLayer0
    let seModelLayer1
    let seModelLayer2
    let ol

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

    const properties = $store.getters['app/getModelsProperties']
    const jsonProperties = JSON.parse(JSON.stringify(properties))

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
      ol = map.value.map
      // Setup field names from models

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
      if (!modelDate) {
        context.emit('mapViewSaved', { status: 'error', msg: 'Share view error. No model is loaded' })
        return
      }
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
      const lines = csv.split(/\r?\n/)
      const dict = {}
      const headers = lines[0].split(',')
      const indexId = headers.indexOf(jsonProperties[model].id)
      const indexEst = headers.indexOf(jsonProperties[model].est)
      const indexSe = headers.indexOf(jsonProperties[model].se)
      for (let i = 1; i < lines.length; i++) {
        const currentLine = lines[i].split(',')
        const nutsId = currentLine[indexId]
        const prob = currentLine[indexEst]
        const se = currentLine[indexSe]
        dict[nutsId] = { prob, se }
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

    const doGRID = function (data) {
      const gridSize = $store.getters['app/getGridSize']
      const dataGridGeojson = GeojsonFromCsv(data, jsonProperties.grid, gridSize)
      const colors = {
        from: jsonProperties.grid.colorFrom,
        to: jsonProperties.grid.colorTo
      }
      estModelLayer = new GridModelLayer(ol, dataGridGeojson.est, {
        colors,
        zIndex: 15,
        minZoom: jsonProperties.grid.minZoom,
        maxZoom: jsonProperties.grid.maxZoom
      })
      estModelLayer.addLayer()

      // Grid SE layer
      if (seModelLayer) {
        map.value.map.removeLayer(seModelLayer.layer)
      }
      seModelLayer = new GridModelLayer(ol, dataGridGeojson.se, {
        zIndex: 15,
        minZoom: jsonProperties.grid.minZoom,
        maxZoom: jsonProperties.grid.maxZoom
      })
      seModelLayer.addLayer()
    }

    const loadModel = async function (data) {
      map.value.map.removeLayer(modelsLayer)
      spinner(true)
      CSVS = {}
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
          } else if (!estModelLayer) {
            doGRID(decoded)
          }
        })

        gadm0.getSource().refresh()
        gadm1.getSource().refresh()
        gadm2.getSource().refresh()

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
          spinner(false)
        })
      }).catch((error) => {
        console.log(error)
      })

      CENTROIDS = {}
      const centroids = data.centroidsUrls
      await Promise.all(centroids.map(m =>
        fetch(m).then(resp => resp.json())
      )).then(jsons => {
        // Check for errors
        jsons.forEach(json => {
          if (!('0' in CENTROIDS)) {
            CENTROIDS['0'] = putDataOnCentroids(json, CSVS['0'], 0)
          } else if (!('1' in CENTROIDS)) {
            CENTROIDS['1'] = putDataOnCentroids(json, CSVS['1'], 1)
          } else if (!('2' in CENTROIDS)) {
            CENTROIDS['2'] = putDataOnCentroids(json, CSVS['2'], 2)
          }
        })
        if (seModelLayer0) {
          map.value.map.removeLayer(seModelLayer0.layer)
        }
        if (seModelLayer1) {
          map.value.map.removeLayer(seModelLayer1.layer)
        }
        if (seModelLayer2) {
          map.value.map.removeLayer(seModelLayer2.layer)
        }
        seModelLayer0 = new GridModelLayer(ol, CENTROIDS['0'], {
          zIndex: 15,
          minZoom: jsonProperties.gadm0.minZoom,
          maxZoom: jsonProperties.gadm0.maxZoom
        })
        seModelLayer0.addLayer()

        seModelLayer1 = new GridModelLayer(ol, CENTROIDS['1'], {
          zIndex: 15,
          minZoom: jsonProperties.gadm1.minZoom,
          maxZoom: jsonProperties.gadm1.maxZoom
        })
        seModelLayer1.addLayer()

        seModelLayer2 = new GridModelLayer(ol, CENTROIDS['2'], {
          zIndex: 15,
          minZoom: jsonProperties.gadm2.minZoom,
          maxZoom: jsonProperties.gadm2.maxZoom
        })
        seModelLayer2.addLayer()
      }).catch((error) => {
        console.log(error)
      })
    }

    const putDataOnCentroids = function (json, csv, flag) {
      // Filter centroids with data and add SE value from csv
      const filtered = json.features.filter(f => {
        if (f.properties.id in csv) {
          f.properties.se = csv[f.properties.id].se
          return f.properties.id in csv
        } else {
          return false
        }
      })
      return {
        type: 'FeatureCollection',
        model: json.model,
        features: filtered
      }
    }

    // const styles = {}
    const colorizeGadm0 = (feature, style) => {
      const colors = {
        from: jsonProperties.gadm0.colorFrom,
        to: jsonProperties.gadm0.colorTo
      }
      return colorizeGadm(feature, style, CSVS['0'], colors)
    }

    const colorizeGadm1 = (feature, style) => {
      const colors = {
        from: jsonProperties.gadm1.colorFrom,
        to: jsonProperties.gadm1.colorTo
      }
      return colorizeGadm(feature, style, CSVS['1'], colors)
    }
    const colorizeGadm2 = (feature, style) => {
      const colors = {
        from: jsonProperties.gadm2.colorFrom,
        to: jsonProperties.gadm2.colorTo
      }
      return colorizeGadm(feature, style, CSVS['2'], colors)
    }

    const colorizeGadm = (feature, style, CSV, colors) => {
      const id = feature.properties_.id
      if (CSV[id] === undefined) {
        return null
      }
      const value = CSV[id].prob
      const c = getInterpolatedColor(colors.from, colors.to, value)
      style = new Fill({
        color: c
      })
      return new Style({
        fill: style,
        stroke: new Stroke({
          color: 'rgb(145,0,63,1)'
        })
      })
    }

    const gadm0 = new VectorTileLayer({
      minZoom: jsonProperties.gadm0.minZoom,
      maxZoom: jsonProperties.gadm0.maxZoom,
      declutter: true,
      renderMode: 'hybrid',
      source: new VectorTileSource({
        format: new MVT(),
        url: backendUrl + 'api/tiles/gadm0/{z}/{x}/{y}'
      }),
      style: colorizeGadm0
    })

    const gadm1 = new VectorTileLayer({
      minZoom: jsonProperties.gadm1.minZoom,
      maxZoom: jsonProperties.gadm1.maxZoom,
      declutter: true,
      renderMode: 'hybrid',
      source: new VectorTileSource({
        format: new MVT(),
        url: backendUrl + 'api/tiles/gadm1/{z}/{x}/{y}'
      }),
      style: colorizeGadm1
    })

    const gadm2 = new VectorTileLayer({
      minZoom: jsonProperties.gadm2.minZoom,
      maxZoom: jsonProperties.gadm2.maxZoom,
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

    function showZoom () {
      const z = map.value.map.getView().getZoom()
      console.log(z)
    }

    const estimationVisibility = function (state) {
      gadm0.setVisible(state)
      gadm1.setVisible(state)
      gadm2.setVisible(state)
      estModelLayer.layer.setVisible(state)
    }

    const uncertaintyVisibility = function (state) {
      seModelLayer0.layer.setVisible(state)
      seModelLayer1.layer.setVisible(state)
      seModelLayer2.layer.setVisible(state)
      seModelLayer.layer.setVisible(state)
    }

    return {
      _,
      estimationVisibility,
      uncertaintyVisibility,
      baseMap,
      showZoom,
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
