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
            :constrainResolution='true' />

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
// import { Buffer } from 'buffer'
import GridModelLayer from '../js/GridModelLayer'

export default defineComponent({
  name: 'TheMapModels',
  emits: [
    'toggleLeftDrawer',
    'mapViewSaved',
    'setModelDate',
    'loadSharedModel'
  ],
  props: ['viewCode'],
  setup (props, context) {
    const map = ref('null')
    const baseMap = ref('null')
    const attrVisible = ref(false)
    const foldingIcon = ref('<')
    const leftDrawerIcon = ref('null')
    const $store = useStore()
    let gitHubError = 0
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
    let dataGridGeojson

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
    const models = JSON.parse(JSON.stringify($store.getters['app/getModels']))
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

    const colors = computed(() => {
      return {
        from: $store.getters['app/getModelDefaults'].estimationColorFrom,
        to: $store.getters['app/getModelDefaults'].estimationColorTo
      }
    })

    const _ = function (text) {
      return $store.getters['app/getText'](text)
    }

    const shareViewUrl = backendUrl + 'api/view/save/'
    const loadViewUrl = backendUrl + 'api/view/load/'

    function shareModelView () {
      const modelData = JSON.parse(JSON.stringify($store.getters['app/getModelDefaults']))
      console.log(modelData)
      if (!modelData.esp || !modelData.year) {
        context.emit('mapViewSaved', { status: 'error', msg: 'Share view error. No model is loaded' })
        return
      }
      const newView = new ShareMapView(ol, {
        viewType: 'models',
        filters: {
          esp: modelData.esp,
          year: modelData.year,
          month: modelData.month,
          est: modelData.est,
          se: modelData.se,
          estTransparency: modelData.estTransparency,
          seTransparency: modelData.seTransparency,
          estimationColorFrom: modelData.estimationColorFrom,
          estimationColorTo: modelData.estimationColorTo,
          uncertaintyColor: modelData.uncertaintyColor
        },
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
      // Search type from code
      const type = Object.keys(models).find((key, index) => {
        return (models[key].modelName === jsonView.filters.esp)
      })
      context.emit('loadSharedModel', {
        esp: { code: jsonView.filters.esp, type: _(models[type].common_name) },
        year: jsonView.filters.year,
        month: jsonView.filters.month,
        est: jsonView.filters.est,
        se: jsonView.filters.se,
        estTransparency: jsonView.filters.estTransparency,
        seTransparency: jsonView.filters.seTransparency,
        estimationColorFrom: jsonView.filters.estimationColorFrom,
        estimationColorTo: jsonView.filters.estimationColorTo,
        uncertaintyColor: jsonView.filters.uncertaintyColor
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
          visibility: status,
          seamless: true
        }
      })
    }

    const doGRID = function (data) {
      const gridSize = $store.getters['app/getGridSize']
      dataGridGeojson = GeojsonFromCsv(data, jsonProperties.grid, gridSize)
      // const colors = {
      //   from: jsonDefaults.colorEstimationFrom,
      //   to: jsonProperties.colorEstimationTo
      // }
      estModelLayer = new GridModelLayer(ol, dataGridGeojson.est, {
        colors: colors.value,
        zIndex: 15,
        minZoom: jsonProperties.grid.minZoom,
        maxZoom: jsonProperties.grid.maxZoom
      })
      estModelLayer.addLayer()

      // Grid SE layer
      if (seModelLayer) {
        map.value.map.removeLayer(seModelLayer.layer)
      }
      const seColor = $store.getters['app/getModelDefaults'].uncertaintyColor
      seModelLayer = new GridModelLayer(ol, dataGridGeojson.se, {
        zIndex: 15,
        color: seColor.value,
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
        // fetch(m).then(resp => resp.json())
        fetch(m).then(resp => resp.text())
      )).then(texts => {
        // Check for errors
        texts.forEach(text => {
          if (text.message) {
            gitHubError = 1
            $store.commit('app/setModal', {
              id: 'error',
              content: {
                visibility: true,
                msg: text.message,
                link: text.documentation_url
              }
            })
            context.emit('errorDownloadingModels')
            return true
          }

          // const encoded = text.content
          // const buf = Buffer.from(encoded, 'base64')
          // let decoded = buf.toString('utf-8')
          const decoded = text
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
        estimationVisibility(data.est)
        estimationOpacity(1 - (data.estTransparency / 100))
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

      if (gitHubError) {
        spinner(false)
        return true
      }

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
        const seColor = $store.getters['app/getModelDefaults'].uncertaintyColor
        seModelLayer0 = new GridModelLayer(ol, CENTROIDS['0'], {
          zIndex: 15,
          color: seColor,
          minZoom: jsonProperties.gadm0.minZoom,
          maxZoom: jsonProperties.gadm0.maxZoom
        })

        seModelLayer1 = new GridModelLayer(ol, CENTROIDS['1'], {
          zIndex: 15,
          color: seColor,
          minZoom: jsonProperties.gadm1.minZoom,
          maxZoom: jsonProperties.gadm1.maxZoom
        })

        seModelLayer2 = new GridModelLayer(ol, CENTROIDS['2'], {
          zIndex: 15,
          color: seColor,
          minZoom: jsonProperties.gadm2.minZoom,
          maxZoom: jsonProperties.gadm2.maxZoom
        })

        seModelLayer0.addLayer()
        seModelLayer1.addLayer()
        seModelLayer2.addLayer()
        uncertaintyVisibility(data.se)
        uncertaintyOpacity(1 - (data.seTransparency / 100))
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
      // const colors = {
      //   from: jsonDefaults.colorEstimationFrom,
      //   to: jsonProperties.colorEstimationTo
      // }
      return colorizeGadm(feature, style, CSVS['0'], colors.value)
    }

    const colorizeGadm1 = (feature, style) => {
      // const colors = {
      //   from: jsonProperties.gadm1.colorFrom,
      //   to: jsonProperties.gadm1.colorTo
      // }
      return colorizeGadm(feature, style, CSVS['1'], colors.value)
    }
    const colorizeGadm2 = (feature, style) => {
      // const colors = {
      //   from: jsonProperties.gadm2.colorFrom,
      //   to: jsonProperties.gadm2.colorTo
      // }
      return colorizeGadm(feature, style, CSVS['2'], colors.value)
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
          color: 'rgb(0,0,0)'
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
      $store.commit('app/setModelEst', state)
      gadm0.setVisible(state)
      gadm1.setVisible(state)
      gadm2.setVisible(state)
      if (estModelLayer) {
        estModelLayer.layer.setVisible(state)
      }
    }

    const uncertaintyVisibility = function (state) {
      $store.commit('app/setModelSe', state)
      seModelLayer0.layer.setVisible(state)
      seModelLayer1.layer.setVisible(state)
      seModelLayer2.layer.setVisible(state)
      seModelLayer.layer.setVisible(state)
    }

    const estimationOpacity = function (opacity) {
      $store.commit('app/setEstTransparency', opacity)
      gadm0.setOpacity(opacity)
      gadm1.setOpacity(opacity)
      gadm2.setOpacity(opacity)
      if (estModelLayer.layer) {
        estModelLayer.layer.setOpacity(opacity)
      }
    }

    const uncertaintyOpacity = function (opacity) {
      $store.commit('app/setSeTransparency', opacity)
      if (seModelLayer0) {
        seModelLayer0.layer.setOpacity(opacity)
      }
      if (seModelLayer1) {
        seModelLayer1.layer.setOpacity(opacity)
      }
      if (seModelLayer2) {
        seModelLayer2.layer.setOpacity(opacity)
      }
      if (seModelLayer.layer) {
        seModelLayer.layer.setOpacity(opacity)
      }
    }

    const estimationRefresh = function () {
      if (estModelLayer) {
        map.value.map.removeLayer(estModelLayer.layer)
      }
      estModelLayer = new GridModelLayer(ol, dataGridGeojson.est, {
        colors: colors.value,
        zIndex: 15,
        minZoom: jsonProperties.grid.minZoom,
        maxZoom: jsonProperties.grid.maxZoom
      })
      estModelLayer.addLayer()

      gadm0.getSource().refresh()
      gadm1.getSource().refresh()
      gadm2.getSource().refresh()
    }

    const uncertaintyRefresh = function () {
      const seColor = $store.getters['app/getModelDefaults'].uncertaintyColor
      if (seModelLayer) {
        map.value.map.removeLayer(seModelLayer.layer)
      }
      if (seModelLayer0) {
        map.value.map.removeLayer(seModelLayer0.layer)
      }
      if (seModelLayer1) {
        map.value.map.removeLayer(seModelLayer1.layer)
      }
      if (seModelLayer2) {
        map.value.map.removeLayer(seModelLayer2.layer)
      }

      seModelLayer = new GridModelLayer(ol, dataGridGeojson.se, {
        zIndex: 15,
        color: seColor,
        minZoom: jsonProperties.grid.minZoom,
        maxZoom: jsonProperties.grid.maxZoom
      })

      seModelLayer0 = new GridModelLayer(ol, CENTROIDS['0'], {
        zIndex: 15,
        color: seColor,
        minZoom: jsonProperties.gadm0.minZoom,
        maxZoom: jsonProperties.gadm0.maxZoom
      })

      seModelLayer1 = new GridModelLayer(ol, CENTROIDS['1'], {
        zIndex: 15,
        color: seColor,
        minZoom: jsonProperties.gadm1.minZoom,
        maxZoom: jsonProperties.gadm1.maxZoom
      })

      seModelLayer2 = new GridModelLayer(ol, CENTROIDS['2'], {
        zIndex: 15,
        color: seColor,
        minZoom: jsonProperties.gadm2.minZoom,
        maxZoom: jsonProperties.gadm2.maxZoom
      })

      seModelLayer.addLayer()
      seModelLayer0.addLayer()
      seModelLayer1.addLayer()
      seModelLayer2.addLayer()
    }

    return {
      _,
      uncertaintyRefresh,
      estimationRefresh,
      estimationVisibility,
      uncertaintyVisibility,
      estimationOpacity,
      uncertaintyOpacity,
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
