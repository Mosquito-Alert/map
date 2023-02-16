<!--
  MAP COMPONENT FOR MODELS TAB
-->

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
      @movestart='hideSpinner'
      @moveend='updateMap'
      style='height:100%'>

        <ol-zoom-control :duration='600' />
        <ol-view ref='view'
            multiWorld="true"
            maxZoom="19"
            maxResolution="39135.75848201024"
            :center='center'
            :zoom='zoom'
            :constrainResolution='true' />

        <div
          class="ol-attribution"
          :class="mobile?(!attrVisible?'mobile collapsed':'mobile'):''"
        >
          <div v-if="!mobile || attrVisible">
            © <a href="https://www.openstreetmap.org/copyright/" target="_blank">OpenStreetMap</a> contributors
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
import { GeojsonFromCsv } from '../js/GeojsonFromCsv.js'
import GridModelLayer from '../js/GridModelLayer'
import { StatusCodes as STATUS_CODES } from 'http-status-codes'
// import MSession from '../js/session.js'

export default defineComponent({
  name: 'TheMapModels',
  emits: [
    'toggleLeftDrawer',
    'endShareView',
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
    // let mySession
    const GADM1 = 'gadm1'
    const GADM2 = 'gadm2'
    const GADM3 = 'gadm3'
    const GADM4 = 'gadm4'
    const backendUrl = $store.getters['app/getBackend']
    let estModelLayer
    let seModelLayer
    let seModelLayer1
    let seModelLayer2
    let seModelLayer3
    let seModelLayer4
    let ol
    let gadm4MaxZoom
    let dataGridGeojson
    const RANGS = [0.16, 0.32, 0.48, 0.65, 0.82, 1]
    $store.commit('map/selectFeature', {})

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
      leftDrawerIcon.value = 'keyboard_arrow_left'
      // const paramViewCode = (props.viewCode) ? props.viewCode : null
      // if (paramViewCode) {
      //   loadView(map.value.map, 'M-' + paramViewCode)
      // }
    })

    const _ = function (text) {
      return $store.getters['app/getText'](text)
    }

    const shareViewUrl = backendUrl + 'api/view/save/'
    const loadViewUrl = backendUrl + 'api/view/load/'

    // Call when user shares view
    function shareModelView () {
      const modelData = JSON.parse(JSON.stringify($store.getters['app/getModelDefaults']))
      if (!modelData.vector || !modelData.year) {
        const content = {
          error: 'Share view error. No model is loaded',
          visibility: true,
          url: ''
        }
        $store.commit('app/setModal', {
          id: 'share',
          content: content
        })
        context.emit('endShareView', content)
        return
      }

      // After mapview is shared then handle it
      const newView = new ShareMapView(ol, {
        viewType: 'models',
        csrfToken: $store.getters['app/getCsrfToken'],
        filters: {
          vector: modelData.vector,
          year: modelData.year,
          month: modelData.month,
          estimation: modelData.estimation,
          uncertainty: modelData.uncertainty,
          estimationTransparency: modelData.estimationTransparency,
          uncertaintyTransparency: modelData.uncertaintyTransparency,
          uncertaintyColor: modelData.uncertaintyColor,
          estimationColors: $store.getters['app/getEstimationColors']
        },
        url: shareViewUrl,
        callback: handleShareView
      })
      newView.save()
    }

    // Handle shared view
    function handleShareView (status) {
      let content
      if (status.status !== STATUS_CODES.OK) {
        content = {
          error: status.msg,
          visibility: true,
          url: ''
        }
        $store.commit('app/setModal', {
          id: 'share',
          content: content
        })
      } else {
        const frontend = $store.getters['app/getFrontendUrl']
        content = {
          url: frontend + status.code + '/' + $store.getters['app/getLang'],
          visibility: true,
          error: ''
        }
        $store.commit('app/setModal', {
          id: 'share',
          content: content
        })
      }
      context.emit('endShareView', content)
    }

    // Load shared view. Get data from database and then handle it
    function loadView (viewCode) {
      const newView = new ShareMapView(map.value.map, {
        url: loadViewUrl + viewCode + '/',
        csrfToken: $store.getters['app/getCsrfToken']
      })
      newView.load(handleLoadView)
    }

    // Handle shared view
    function handleLoadView (response) {
      // Check status response
      if (response.status !== STATUS_CODES.OK) {
        $store.commit('app/setModal', {
          id: 'error',
          content: {
            visibility: true,
            msg: response.msg,
            redirection: false
          }
        })
        return true
      }
      const d = response.view[0].date
      context.emit('setModelDate', moment(d).startOf('year').format('MM/YYYY'))
      const jsonView = JSON.parse(response.view[0].view)
      $store.commit('map/setCurrents', {
        zoom: jsonView.zoom,
        center: transform(jsonView.center, 'EPSG:3857', 'EPSG:4326'),
        mobilezoom: jsonView.zoom
      })
      // Search type from code
      const type = Object.keys(models).find((key, index) => {
        return (models[key].modelName === jsonView.filters.vector)
      })
      // Send data to layout so it udpates UI accordingly
      context.emit('loadSharedModel', {
        vector: { code: jsonView.filters.vector, type: _(models[type].common_name) },
        year: jsonView.filters.year,
        month: jsonView.filters.month,
        estimation: jsonView.filters.estimation,
        uncertainty: jsonView.filters.uncertainty,
        estimationTransparency: jsonView.filters.estimationTransparency,
        uncertaintyTransparency: jsonView.filters.uncertaintyTransparency,
        uncertaintyColor: jsonView.filters.uncertaintyColor,
        estimationColors: jsonView.filters.estimationColors
      })
    }

    // Turn CSV file into dict
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
        if (nutsId !== undefined) {
          const prob = currentLine[indexEst]
          const se = currentLine[indexSe]
          dict[nutsId] = { prob, se }
        }
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

    // Do geometry grid to show probability at bigger zooms
    const doGRID = function (data) {
      const gridSize = $store.getters['app/getGridSize']
      dataGridGeojson = GeojsonFromCsv(data, jsonProperties.grid, gridSize)
      const estimationColors = $store.getters['app/getEstimationColors']
      estModelLayer = new GridModelLayer(ol, dataGridGeojson.est, {
        colors: estimationColors,
        rangs: RANGS,
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
        zIndex: 16,
        color: seColor.value,
        minZoom: jsonProperties.grid.minZoom,
        maxZoom: jsonProperties.grid.maxZoom
      })
      seModelLayer.addLayer()
    }

    const clearModel = async function (data) {
      if (seModelLayer) {
        map.value.map.removeLayer(seModelLayer.layer)
        seModelLayer = null
      }
      if (seModelLayer1) {
        map.value.map.removeLayer(seModelLayer1.layer)
      }
      if (seModelLayer2) {
        map.value.map.removeLayer(seModelLayer2.layer)
      }
      if (seModelLayer3) {
        map.value.map.removeLayer(seModelLayer3.layer)
      }
      if (seModelLayer4) {
        map.value.map.removeLayer(seModelLayer4.layer)
      }
      if (estModelLayer) {
        map.value.map.removeLayer(estModelLayer.layer)
        estModelLayer = null
      }
      map.value.map.removeLayer(modelsLayer)
    }

    // Get all data necessary to load a model and add layers to  map
    const loadModel = async function (data) {
      let ERROR_404 = false
      if (estModelLayer) {
        map.value.map.removeLayer(estModelLayer.layer)
        estModelLayer = null
      }
      clearModel()
      spinner(true)
      CSVS = {}
      const urls = data.modelsCsv

      // PROBABILITY GEOMETRIES FROM VECTOR TILES
      await Promise.all(urls.map(m =>
        fetch(m).then(resp => {
          if (resp.status === 404) {
            ERROR_404 = true
          }
          return resp.text()
        })
      )).then(texts => {
        texts.forEach(text => {
          if (text.message || ERROR_404) {
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
          const decoded = text
          if (!('1' in CSVS)) {
            CSVS['1'] = csvJSON(decoded, GADM1)
          } else if (!('2' in CSVS)) {
            CSVS['2'] = csvJSON(decoded, GADM2)
          } else if (!('3' in CSVS)) {
            CSVS['3'] = csvJSON(decoded, GADM3)
          } else if (!('4' in CSVS)) {
            CSVS['4'] = csvJSON(decoded, GADM4)
          } else if (!estModelLayer) {
            doGRID(decoded)
          }
        })

        if (ERROR_404) {
          $store.commit('app/setModal', {
            id: 'error',
            content: {
              visibility: true,
              msg: 'MODEL NOT FOUND'
            }
          })
          context.emit('errorDownloadingModels')
          return true
        }
        gadm1.getSource().refresh()
        gadm2.getSource().refresh()
        gadm3.getSource().refresh()
        gadm4.getSource().refresh()

        map.value.map.addLayer(modelsLayer)
        gadm1.on('prerender', function () {
          spinner(true)
        })
        gadm2.on('prerender', function () {
          spinner(true)
        })
        gadm3.on('prerender', function () {
          spinner(true)
        })
        gadm4.on('prerender', function () {
          spinner(true)
        })
        estimationVisibility(data.estimation)
        estimationOpacity(1 - (data.estimationTransparency / 100))

        // If cell layer is on
        if (urls.length > 4) {
          gadm4MaxZoom = jsonProperties.gadm4.maxZoom
          gadm4.setMaxZoom(gadm4MaxZoom)
          estModelLayer.layer.on('prerender', function () {
            spinner(true)
          })
        } else {
          // if it is not
          gadm4MaxZoom = 19
          gadm4.setMaxZoom(gadm4MaxZoom)
        }
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

      // UNCERTAINTY GEOMETRIES FROM GEOJSON FILES
      CENTROIDS = {}
      const centroids = data.centroidsUrls
      await Promise.all(centroids.map(m =>
        fetch(m, {
          credentials: 'include'
        }).then(resp => resp.json())
      )).then(jsons => {
        // Check for errors
        jsons.forEach(json => {
          if (!('1' in CENTROIDS)) {
            CENTROIDS['1'] = putDataOnCentroids(json, CSVS['1'], 1)
          } else if (!('2' in CENTROIDS)) {
            CENTROIDS['2'] = putDataOnCentroids(json, CSVS['2'], 2)
          } else if (!('3' in CENTROIDS)) {
            CENTROIDS['3'] = putDataOnCentroids(json, CSVS['3'], 3)
          } else if (!('4' in CENTROIDS)) {
            CENTROIDS['4'] = putDataOnCentroids(json, CSVS['4'], 4)
          }
        })
        const seColor = $store.getters['app/getUncertaintyColor']

        seModelLayer1 = new GridModelLayer(ol, CENTROIDS['1'], {
          zIndex: 15,
          color: seColor,
          minZoom: jsonProperties.gadm1.minZoom - 1,
          maxZoom: jsonProperties.gadm1.maxZoom
        })

        seModelLayer2 = new GridModelLayer(ol, CENTROIDS['2'], {
          zIndex: 15,
          color: seColor,
          minZoom: jsonProperties.gadm2.minZoom,
          maxZoom: jsonProperties.gadm2.maxZoom
        })

        seModelLayer3 = new GridModelLayer(ol, CENTROIDS['3'], {
          zIndex: 15,
          color: seColor,
          minZoom: jsonProperties.gadm3.minZoom,
          maxZoom: jsonProperties.gadm3.maxZoom
        })

        seModelLayer4 = new GridModelLayer(ol, CENTROIDS['4'], {
          zIndex: 15,
          color: seColor,
          minZoom: jsonProperties.gadm4.minZoom,
          maxZoom: gadm4MaxZoom
        })

        seModelLayer1.addLayer()
        seModelLayer2.addLayer()
        seModelLayer3.addLayer()
        seModelLayer4.addLayer()
        uncertaintyVisibility(data.uncertainty)
        uncertaintyOpacity(1 - (data.uncertaintyTransparency / 100))
      }).catch((error) => {
        console.log(error)
      })
    }

    // Filter centroids with data and add SE value from csv
    const putDataOnCentroids = function (json, csv, flag) {
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

    // Function styles for probability layers based on scale
    const colorizeGadm1 = (feature, style) => {
      return colorizeGadm(feature, style, CSVS['1'])
    }
    const colorizeGadm2 = (feature, style) => {
      return colorizeGadm(feature, style, CSVS['2'])
    }

    const colorizeGadm3 = (feature, style) => {
      return colorizeGadm(feature, style, CSVS['3'])
    }

    const colorizeGadm4 = (feature, style) => {
      return colorizeGadm(feature, style, CSVS['4'])
    }

    // General function style for probability
    const colorizeGadm = (feature, style, CSV) => {
      const estimationColors = $store.getters['app/getEstimationColors']
      const id = feature.properties_.id
      if (CSV[id] === undefined) {
        return null
      }
      const value = CSV[id].prob
      let c
      if (value < RANGS[0]) {
        c = estimationColors[0]
      } else if (value < RANGS[1]) {
        c = estimationColors[1]
      } else if (value < RANGS[2]) {
        c = estimationColors[2]
      } else if (value < RANGS[3]) {
        c = estimationColors[3]
      } else if (value < RANGS[4]) {
        c = estimationColors[4]
      } else {
        c = estimationColors[5]
      }
      style = new Fill({
        color: c
      })
      return new Style({
        fill: style,
        stroke: new Stroke({
          color: '#fff'
        })
      })
    }

    const tilesUrl = $store.getters['app/getTilesUrl']

    // Define layers for probability
    const gadm1 = new VectorTileLayer({
      maxZoom: jsonProperties.gadm1.maxZoom,
      declutter: true,
      renderMode: 'hybrid',
      source: new VectorTileSource({
        maxZoom: jsonProperties.gadm1.maxZoom + 1,
        format: new MVT(),
        url: tilesUrl + '/gadm1/{z}/{x}/{y}.pbf'
      }),
      style: colorizeGadm1
    })

    const gadm2 = new VectorTileLayer({
      minZoom: jsonProperties.gadm2.minZoom,
      maxZoom: jsonProperties.gadm2.maxZoom,
      declutter: true,
      renderMode: 'hybrid',
      source: new VectorTileSource({
        maxZoom: jsonProperties.gadm2.maxZoom,
        format: new MVT(),
        url: tilesUrl + '/gadm2/{z}/{x}/{y}.pbf'
      }),
      style: colorizeGadm2
    })

    const gadm3 = new VectorTileLayer({
      minZoom: jsonProperties.gadm3.minZoom,
      maxZoom: jsonProperties.gadm3.maxZoom,
      declutter: true,
      renderMode: 'hybrid',
      source: new VectorTileSource({
        maxZoom: jsonProperties.gadm3.maxZoom - 1,
        format: new MVT(),
        url: tilesUrl + '/gadm3/{z}/{x}/{y}.pbf'
      }),
      style: colorizeGadm3
    })

    const gadm4 = new VectorTileLayer({
      minZoom: jsonProperties.gadm4.minZoom,
      maxZoom: jsonProperties.gadm4.maxZoom,
      declutter: true,
      renderMode: 'hybrid',
      source: new VectorTileSource({
        maxZoom: jsonProperties.gadm4.maxZoom - 2,
        format: new MVT(),
        url: tilesUrl + '/gadm4/{z}/{x}/{y}.pbf'
      }),
      style: colorizeGadm4
    })

    // Group previous layers as a single map layer
    const modelsLayer = new LayerGroup({
      layers: [gadm1, gadm2, gadm3, gadm4]
    })

    function updateMap () {
      // Save view params into store
      const newZoom = map.value.map.getView().getZoom()
      $store.commit('map/setDefaults', {
        zoom: newZoom,
        center: transform(
          map.value.map.getView().getCenter(),
          'EPSG:3857', 'EPSG:4326'
        )
      })
    }

    // Change estimation visibility
    const estimationVisibility = function (state) {
      $store.commit('app/setModelEstimation', state)
      gadm1.setVisible(state)
      gadm2.setVisible(state)
      gadm3.setVisible(state)
      gadm4.setVisible(state)
      if (estModelLayer) {
        estModelLayer.layer.setVisible(state)
      }
    }

    // Change uncertainty visibility
    const uncertaintyVisibility = function (state) {
      $store.commit('app/setModelUncertainty', state)
      seModelLayer1.layer.setVisible(state)
      seModelLayer2.layer.setVisible(state)
      seModelLayer3.layer.setVisible(state)
      seModelLayer4.layer.setVisible(state)
      if (seModelLayer) {
        seModelLayer.layer.setVisible(state)
      }
    }

    // Change estimation opacity
    const estimationOpacity = function (opacity) {
      gadm1.setOpacity(opacity)
      gadm2.setOpacity(opacity)
      gadm3.setOpacity(opacity)
      gadm4.setOpacity(opacity)
      if (estModelLayer) {
        estModelLayer.layer.setOpacity(opacity)
      }
    }

    // Change uncertainty opacity
    const uncertaintyOpacity = function (opacity) {
      if (seModelLayer1) {
        seModelLayer1.layer.setOpacity(opacity)
      }
      if (seModelLayer2) {
        seModelLayer2.layer.setOpacity(opacity)
      }
      if (seModelLayer3) {
        seModelLayer3.layer.setOpacity(opacity)
      }
      if (seModelLayer4) {
        seModelLayer4.layer.setOpacity(opacity)
      }
      if (seModelLayer) {
        seModelLayer.layer.setOpacity(opacity)
      }
    }

    // Redraw estimation. Get colors from store
    const estimationRefresh = function () {
      if (estModelLayer) {
        map.value.map.removeLayer(estModelLayer.layer)
      }
      const estimationColors = $store.getters['app/getEstimationColors']
      if (dataGridGeojson) {
        estModelLayer = new GridModelLayer(ol, dataGridGeojson.est, {
          colors: estimationColors,
          rangs: RANGS,
          zIndex: 15,
          minZoom: jsonProperties.grid.minZoom,
          maxZoom: jsonProperties.grid.maxZoom
        })
        estModelLayer.addLayer()
      }

      gadm1.getSource().refresh()
      gadm2.getSource().refresh()
      gadm3.getSource().refresh()
      gadm4.getSource().refresh()
    }

    // Redraw uncertainty. Get colors from store
    const uncertaintyRefresh = function () {
      const seColor = $store.getters['app/getUncertaintyColor']
      if (seModelLayer) {
        map.value.map.removeLayer(seModelLayer.layer)
      }
      if (seModelLayer1) {
        map.value.map.removeLayer(seModelLayer1.layer)
      }
      if (seModelLayer2) {
        map.value.map.removeLayer(seModelLayer2.layer)
      }
      if (seModelLayer3) {
        map.value.map.removeLayer(seModelLayer3.layer)
      }
      if (seModelLayer4) {
        map.value.map.removeLayer(seModelLayer4.layer)
      }

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

      seModelLayer3 = new GridModelLayer(ol, CENTROIDS['3'], {
        zIndex: 15,
        color: seColor,
        minZoom: jsonProperties.gadm3.minZoom,
        maxZoom: jsonProperties.gadm3.maxZoom
      })

      seModelLayer4 = new GridModelLayer(ol, CENTROIDS['4'], {
        zIndex: 15,
        color: seColor,
        minZoom: jsonProperties.gadm4.minZoom,
        maxZoom: gadm4MaxZoom
      })

      if (gadm4MaxZoom === jsonProperties.gadm4.maxZoom) {
        seModelLayer = new GridModelLayer(ol, dataGridGeojson.se, {
          zIndex: 16,
          color: seColor,
          minZoom: jsonProperties.grid.minZoom,
          maxZoom: jsonProperties.grid.maxZoom
        })
        seModelLayer.addLayer()
      }
      seModelLayer1.addLayer()
      seModelLayer2.addLayer()
      seModelLayer3.addLayer()
      seModelLayer4.addLayer()
      uncertaintyOpacity(1 - ($store.getters['app/getModelDefaults'].uncertaintyTransparency / 100))
    }

    const hideSpinner = function () {
      spinner(false)
    }
    return {
      _,
      hideSpinner,
      uncertaintyRefresh,
      estimationRefresh,
      estimationVisibility,
      uncertaintyVisibility,
      estimationOpacity,
      uncertaintyOpacity,
      baseMap,
      updateMap,
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
      loadModel,
      clearModel
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
</style>
