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
            :maxZoom=10
            :maxResolution=39135.75848201024
            :center='center'
            :zoom='zoom'
            :constrainResolution='true' />

        <div
          class="ol-attribution"
          :class="mobile?(!attrVisible?'mobile collapsed':'mobile'):''"
        >
          <div v-if="!mobile || attrVisible">
            <a href="https://gadm.org/" target="_blank">© GADM</a>
            | <a href="https://openlayers.org" target="_blank">OpenLayers</a>
          </div>
          <div v-if="mobile"
            class="attr-folder"
            v-html="foldingIcon"
            @click="unfoldAttribution"
          >
          </div>
        </div>
    </ol-map>
  </div>
</template>

<script>
import 'vue3-openlayers/dist/vue3-openlayers.css'
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { transform } from 'ol/proj'
import MVT from 'ol/format/MVT'
import { bbox } from 'ol/loadingstrategy'
import GeoJSON from 'ol/format/GeoJSON'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import VectorTileLayer from 'ol/layer/VectorTile'
import VectorTileSource from 'ol/source/VectorTile'
import { Style, Fill, Stroke } from 'ol/style'
import CircleStyle from 'ol/style/Circle'
import { Group as LayerGroup } from 'ol/layer'
import Feature from 'ol/Feature'
import Tooltip from 'ol-ext/overlay/Tooltip'
import Hover from 'ol-ext/interaction/Hover'

import moment from 'moment'
import { GeojsonFromCsv } from '../js/GeojsonFromCsv.js'
import GridModelLayer from '../js/GridModelLayer'
import ShareMapView from '../js/ShareMapView'
import { StatusCodes as STATUS_CODES } from 'http-status-codes'
import axios from 'axios'

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
    const requestTimeoutMs = 20000
    const progress = ref(0)
    const baseMap = ref('null')
    const attrVisible = ref(false)
    const foldingIcon = ref('<')
    const leftDrawerIcon = ref('null')
    const $store = useStore()
    let CSVS = {}
    // let mySession
    const GADM1 = 'gadm1'
    const GADM2 = 'gadm2'
    const GADM3 = 'gadm3'
    const GADM4 = 'gadm4'
    const backendUrl = $store.getters['app/getBackend']
    let hoverSelectedFeatureId
    let estModelLayer
    let seModelLayer
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

      ol.on('loadstart', function () {
        spinner(true)
      })

      ol.on('loadend', function () {
        spinner(false)
      })

      ol.on('rendercomplete', function () {
        spinner(false)
      })

      // Adding base layer (gadm0)
      map.value.map.addLayer(gadm0)

      // Adding gadm probability model layers.
      map.value.map.addLayer(modelsLayerGroup)
      // Adding centroid uncertainty layers.
      map.value.map.addLayer(seModelsLayerGroup)

      // Displaying tooltip
      const tooltip = new Tooltip({
        // Function to display information about the hovered feature
        getHTML: function (feature, info) {
          if (feature !== undefined) {
            // Get the title of the feature
            const title = feature.get(
              // Find the attribute keys starting with 'NAME_' and select the most detailed one (highest number)
              feature.getKeys().filter(item => item.startsWith('NAME_')).sort((a, b) => b.localeCompare(a))[0]
            ).trim()

            // Show tooltip only if the title is not 'n.a.' (indicating no info available)
            if (!(title.toLowerCase().startsWith('n.a.') || title.toLowerCase() === 'na')) {
              return title
            }
          }
        },
        positioning: 'center-center',
        offsetBox: [0, -15]
      })
      ol.addOverlay(tooltip)

      // Creating hover interaction only for the baseGadmLayers
      const hover = new Hover({
        layers: baseGadmLayers
      })
      ol.addInteraction(hover)

      hover.on('hover', function (e) {
        tooltip.setFeature(e.feature)

        const featureHasChanged = (e.feature.getId() !== hoverSelectedFeatureId)

        if (featureHasChanged) {
          // Replace hoverSelectedFeatureId
          hoverSelectedFeatureId = e.feature.getId()

          // Notify each selectable GADM layer that is has changed, triggering a redraw.
          selectableGadmLayers.forEach(layer => {
            layer.changed()
          })
        }
      })

      hover.on('leave', function (e) {
        // Hide tooltip if no feature is hovered
        tooltip.removeFeature()
        tooltip.hide()

        // Reset hoverSelectedFeatureId
        hoverSelectedFeatureId = undefined

        // Notify each selectable GADM layer that it has changed, triggering a redraw.
        selectableGadmLayers.forEach(layer => {
          layer.changed()
        })
      })
    })

    const trans = function (text) {
      return $store.getters['app/getText'](text)
    }

    const shareViewUrl = backendUrl + 'view/save/'
    const loadViewUrl = backendUrl + 'view/load/'

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
      console.log(d)
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
        vector: { code: jsonView.filters.vector, type: trans(models[type].common_name) },
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
      // Clearing CSV data
      CSVS = {}

      // Hide model layer groups to improve performance during restyling
      modelsLayerGroup.setVisible(false)
      seModelsLayerGroup.setVisible(false)

      // Iterate through layers in model layer groups and trigger a change event to restyle them
      modelsLayerGroup.getLayers().forEach(layer => {
        layer.changed()
      })
      seModelsLayerGroup.getLayers().forEach(layer => {
        layer.changed()
      })

      // Remove specific layers if they exist
      if (seModelLayer) {
        map.value.map.removeLayer(seModelLayer.layer)
        seModelLayer = null
      }
      if (estModelLayer) {
        map.value.map.removeLayer(estModelLayer.layer)
        estModelLayer = null
      }
    }

    // function newAbortSignal (timeoutMs) {
    //   const abortController = new AbortController()
    //   setTimeout(abortController.abort(), timeoutMs)
    //   return abortController.signal
    // }

    // Get all data necessary to load a model and add layers to  map
    const loadModel = async function (data) {
      const process = { status: 'ok', data: {} }

      clearModel()
      spinner(true)
      const urls = data.modelsCsv

      const requests = urls.map((url) => {
        return axios.get(url, {
          // withCredentials: true,
          signal: AbortSignal.timeout(requestTimeoutMs), // Aborts request after 5 seconds
          onDownloadProgress: (progressEvent) => {
            progress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          }
        })
      })

      // GET CSV DATA FILES
      await axios.all(requests).then((responses) => {
        responses.forEach((resp) => {
          const decoded = resp.data
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
      }).catch(function (err) {
        process.status = 'error'
        process.data = err
        let errMsg = ''
        if (err.response.status === 404) {
          errMsg = 'Model not found on Server'
        } else {
          errMsg = err.message
        }
        spinner(false)
        $store.commit('app/setModal', { id: 'error', content: { visibility: true, msg: errMsg } })
        return false
      })

      // Call changed() to force calling the style function again (CSVS has changed)
      // modelsLayerGroup.getLayers().forEach(function (layer) {
      //   layer.changed()
      // })
      // seModelsLayerGroup.getLayers().forEach(function (layer) {
      //   layer.changed()
      // })

      estimationRefresh()
      estimationVisibility(data.estimation)
      estimationOpacity(1 - (data.estimationTransparency / 100))

      uncertaintyRefresh()
      uncertaintyVisibility(data.uncertainty)
      uncertaintyOpacity(1 - (data.uncertaintyTransparency / 100))
    }

    /**
     * Function to create a VectorTileLayer with specified parameters.
     * @param {number} minZoom - Minimum zoom level for the layer.
     * @param {number} zIndex - The z-index of the layer.
     * @param {string} tmsLayername - The name of the TMS layer.
     * @param {string} idPropertyname - The name of the property to use as the ID.
     * @param {number} csvIndex - Index of the CSV data.
     * @param {boolean} triggersSpinner - Flag indicating whether to trigger spinner.
     * @returns {VectorTileLayer} - The created VectorTileLayer.
     */
    function createGadmVectorTileLayer (minZoom, zIndex, tmsLayername, idPropertyname, csvIndex, triggersSpinner = true) {
      // Get the tiles URL from the store
      const tilesUrl = $store.getters['app/getTilesUrl']

      // Create the VectorTileLayer
      const layer = new VectorTileLayer({
        declutter: true,
        minZoom: minZoom,
        zIndex: zIndex,
        renderMode: 'hybrid',
        source: new VectorTileSource({
          minZoom: 2,
          maxZoom: 7,
          format: new MVT({
            featureClass: Feature,
            idProperty: idPropertyname
          }),
          url: tilesUrl + tmsLayername + '@EPSG:900913@pbf/{z}/{x}/{-y}.pbf'
        }),
        style: function (feature, resolution) {
          const estimationColors = $store.getters['app/getEstimationColors']
          const id = feature.getId()

          // Get the data from CSV if provided and determine color based on probability
          const dataObj = csvIndex !== undefined ? CSVS[csvIndex] : {}
          const color = dataObj !== undefined && dataObj[id] !== undefined ? estimationColors[Math.floor(dataObj[id].prob * estimationColors.length)] : '#D9D9D9'

          return new Style({
            fill: new Fill({
              color: color
            }),
            stroke: new Stroke({
              color: '#C9C9C9',
              width: 0.4
            })
          })
        }
      })

      // Attach spinner trigger events if specified
      if (triggersSpinner) {
        layer.on(['change', 'prerender'], function () {
          spinner(true)
        })
      }

      return layer
    }

    /**
     * Function to create a VectorTileLayer for selection based on an existing GADM layer.
     * @param {VectorTileLayer} gadmLayer - The existing GADM VectorTileLayer.
     * @returns {VectorTileLayer} - The created VectorTileLayer for selection.
     */
    function createGadmSelectionVectorTileLayer (gadmLayer) {
      return new VectorTileLayer({
        renderMode: 'vector',
        minZoom: gadmLayer.getMinZoom(),
        maxZoom: gadmLayer.getMaxZoom(),
        zIndex: gadmLayer.getZIndex(),
        source: gadmLayer.getSource(),
        style: function (feature, resolution) {
          // Check if the feature's ID exists in the hoverSelectedFeatureId object
          if (feature.getId() === hoverSelectedFeatureId) {
            // If yes, return the selected style
            return gadmSelectedStyle
          }
          // If not, no style is applied (feature remains unchanged)
        }
      })
    }

    const upperGadmBorderStyle = new Style({
      stroke: new Stroke({
        color: '#B9B9B9',
        width: 0.5
      })
    })

    /**
     * Function to create a VectorTileLayer for displaying the upper border of a GADM layer.
     * @param {VectorTileLayer} gadmLayer - The GADM VectorTileLayer.
     * @returns {VectorTileLayer} - The VectorTileLayer for displaying the upper border.
     */
    function createGadmUpperBorderVectorTileLayer (gadmLayer) {
      return new VectorTileLayer({
        renderMode: 'hybrid',
        source: gadmLayer.getSource(), // Source inherited from the original layer
        style: upperGadmBorderStyle
      })
    }

    const gadmSelectedStyle = new Style({
      stroke: new Stroke({
        color: 'white',
        width: 2
      })
    })

    // Define layers for probability
    const gadm0 = createGadmVectorTileLayer(
      jsonProperties.gadm1.minZoom, // Minimum zoom level for the layer
      0, // Z-index
      'map_gadm:ADM_0', // Name of the TMS layer
      'COUNTRY', // Name of the ID property (MVT)
      undefined, // CSV index (undefined in this case)
      false // Disable spinner triggering
    )
    gadm0.setBackground('#aad3df')
    baseMap.value = gadm0

    // GADM1
    const gadm1 = createGadmVectorTileLayer(
      jsonProperties.gadm1.minZoom, // Minimum zoom level for the layer
      1, // Z-index
      'map_gadm:ADM_1', // Name of the TMS layer
      'GID_1', // Name of the ID property (MVT)
      '1' // CSV index
    )
    const gadm1selection = createGadmSelectionVectorTileLayer(gadm1)

    // GADM2
    const gadm2 = createGadmVectorTileLayer(
      jsonProperties.gadm2.minZoom, // Minimum zoom level for the layer
      2, // Z-index
      'map_gadm:ADM_2', // Name of the TMS layer
      'GID_2', // Name of the ID property (MVT)
      '2' // CSV index
    )
    const gadm2selection = createGadmSelectionVectorTileLayer(gadm2)

    // GADM3
    const gadm3 = createGadmVectorTileLayer(
      jsonProperties.gadm3.minZoom, // Minimum zoom level for the layer
      3, // Z-index
      'map_gadm:ADM_3', // Name of the TMS layer
      'GID_3', // Name of the ID property (MVT)
      '3' // CSV index
    )
    const gadm3selection = createGadmSelectionVectorTileLayer(gadm3)

    // GADM4
    const gadm4 = createGadmVectorTileLayer(
      jsonProperties.gadm4.minZoom, // Minimum zoom level for the layer
      4, // Z-index
      'map_gadm:ADM_4', // Name of the TMS layer
      'GID_4', // Name of the ID property (MVT)
      '4' // CSV index
    )
    const gadm4selection = createGadmSelectionVectorTileLayer(gadm4)

    // Setting up border
    const gadm0border = createGadmUpperBorderVectorTileLayer(gadm0)
    gadm0border.setMinZoom(gadm1.getMinZoom())
    gadm0border.setMaxZoom(gadm2.getMinZoom())
    gadm0border.setZIndex(gadm1.getZIndex())

    const gadm1border = createGadmUpperBorderVectorTileLayer(gadm1)
    gadm1border.setMinZoom(gadm2.getMinZoom())
    gadm1border.setMaxZoom(gadm3.getMinZoom())
    gadm1border.setZIndex(gadm2.getZIndex())

    const gadm2border = createGadmUpperBorderVectorTileLayer(gadm2)
    gadm2border.setMinZoom(gadm3.getMinZoom())
    gadm2border.setMaxZoom(gadm4.getMinZoom())
    gadm2border.setZIndex(gadm3.getZIndex())

    const gadm3border = createGadmUpperBorderVectorTileLayer(gadm3)
    gadm3border.setMinZoom(gadm4.getMinZoom())
    gadm3border.setZIndex(gadm4.getZIndex())

    // Define arrays to hold base GADM layers, selectable GADM layers, and upper border GADM layers
    const baseGadmLayers = [gadm1, gadm2, gadm3, gadm4]
    const selectableGadmLayers = [gadm1selection, gadm2selection, gadm3selection, gadm4selection]
    const upperBorderGadmLayers = [gadm0border, gadm1border, gadm2border, gadm3border]

    // Group previous layers as a single map layer
    const modelsLayerGroup = new LayerGroup({
      layers: [...baseGadmLayers, ...upperBorderGadmLayers, ...selectableGadmLayers],
      visible: false // Set the layer group initially invisible
    })

    /**
     * Create a VectorLayer for displaying SE model data.
     * @param {VectorTileLayer} gadmLayer - The GADM VectorTileLayer.
     * @param {string} wfsLayername - The name of the WFS layer.
     * @param {string} idPropertyname - The name of the property to use as the ID.
     * @param {number} csvIndex - Index of the CSV data.
     * @returns {VectorLayer} - The created VectorLayer for SE model data.
     */
    function createSeModelLayer (gadmLayer, wfsLayername, idPropertyname, csvIndex) {
      // Get the map server URL from the store
      const mapserverUrl = $store.getters['app/getmapserverUrl']

      // Create a VectorSource for SE model data only requesting for the featuring in the visible extent (bbox).
      const seSource = new VectorSource({
        format: new GeoJSON(),
        loader: function (extent, resolution, projection, success, failure) {
          const proj = projection.getCode()
          const url = mapserverUrl + '/wfs?service=WFS&' +
            'version=1.1.0&request=GetFeature&typeName=' + wfsLayername + '&' +
            'outputFormat=application/json&srsname=' + proj + '&' +
            'bbox=' + extent.join(',') + ',' + proj
          const xhr = new XMLHttpRequest()
          xhr.open('GET', url)
          const onError = function () {
            seSource.removeLoadedExtent(extent)
            failure()
          }
          xhr.onerror = onError
          xhr.onload = function () {
            if (xhr.status === 200) {
              const features = seSource.getFormat().readFeatures(xhr.responseText)
              seSource.addFeatures(features)
              success(features)
            } else {
              onError()
            }
          }
          xhr.send()
        },
        strategy: bbox // Set the loading strategy to bbox
      })

      // Create and return a VectorLayer for SE model data
      return new VectorLayer({
        minZoom: gadmLayer.getMinZoom(),
        maxZoom: gadmLayer.getMaxZoom(),
        zIndex: gadmLayer.getZIndex(),
        source: seSource,
        style: function (feature, resolution) {
          const seColor = $store.getters['app/getUncertaintyColor']
          const id = feature.get(idPropertyname)

          // Get data from CSV if provided, otherwise return null
          const dataObj = csvIndex !== undefined ? CSVS[csvIndex] : {}
          if (dataObj === undefined || dataObj[id] === undefined) {
            return null
          }
          const value = dataObj[id].se

          // Return a style based on the SE value
          return new Style({
            image: new CircleStyle({
              // Adjust radius based on SE value
              // There are 4 value for Uncertainty.
              radius: 4 * (Math.floor(value * 4) + 1),
              fill: new Fill({
                color: seColor
              }),
              stroke: new Stroke({
                color: 'white',
                width: 1
              })
            })
          })
        }
      })
    }

    const seModelLayer1 = createSeModelLayer(gadm1, 'map_gadm:ADM_1_CENTROID', 'GID_1', '1')
    const seModelLayer2 = createSeModelLayer(gadm2, 'map_gadm:ADM_2_CENTROID', 'GID_2', '2')
    const seModelLayer3 = createSeModelLayer(gadm3, 'map_gadm:ADM_3_CENTROID', 'GID_3', '3')
    const seModelLayer4 = createSeModelLayer(gadm4, 'map_gadm:ADM_4_CENTROID', 'GID_4', '4')

    // Group previous layers as a single map layer
    const seModelsLayerGroup = new LayerGroup({
      layers: [seModelLayer1, seModelLayer2, seModelLayer3, seModelLayer4],
      visible: false
    })

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

    // Change estimation visibility
    const estimationVisibility = function (state) {
      $store.commit('app/setModelEstimation', state)
      modelsLayerGroup.setVisible(state)
      if (estModelLayer) {
        estModelLayer.layer.setVisible(state)
      }
    }

    // Change uncertainty visibility
    const uncertaintyVisibility = function (state) {
      $store.commit('app/setModelUncertainty', state)
      if (seModelsLayerGroup) {
        seModelsLayerGroup.setVisible(state)
      }
      if (seModelLayer) {
        seModelLayer.layer.setVisible(state)
      }
    }

    // Change estimation opacity
    const estimationOpacity = function (opacity) {
      modelsLayerGroup.setOpacity(opacity)
      if (estModelLayer) {
        estModelLayer.layer.setOpacity(opacity)
      }
    }

    // Change uncertainty opacity
    const uncertaintyOpacity = function (opacity) {
      if (seModelsLayerGroup) {
        seModelsLayerGroup.setOpacity(opacity)
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

      // Notify each GADM layer that it has changed, triggering a redraw.
      modelsLayerGroup.getLayers().forEach(function (layer) {
        layer.changed()
      })
    }

    // Redraw uncertainty. Get colors from store
    const uncertaintyRefresh = function () {
      const seColor = $store.getters['app/getUncertaintyColor']

      // Notify each centroid layer that it has changed, triggering a redraw.
      seModelsLayerGroup.getLayers().forEach(function (layer) {
        layer.changed()
      })

      if (seModelLayer) {
        map.value.map.removeLayer(seModelLayer.layer)
      }

      if (gadm4MaxZoom === jsonProperties.gadm4.maxZoom) {
        seModelLayer = new GridModelLayer(ol, dataGridGeojson.se, {
          zIndex: 16,
          color: seColor,
          minZoom: jsonProperties.grid.minZoom,
          maxZoom: jsonProperties.grid.maxZoom
        })
        seModelLayer.addLayer()
      }

      uncertaintyOpacity(1 - ($store.getters['app/getModelDefaults'].uncertaintyTransparency / 100))
    }

    const hideSpinner = function () {
      spinner(false)
    }
    return {
      trans,
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
      clearModel,
      progress
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
.progress-bar-absolute{
    // On top of map
    position:absolute;
    top:0;
    margin: auto;
    z-index:1;
    // Vertically centered
    // margin: auto;
    // position: absolute;
    // top: 0;
    // left: 0;
    // bottom: 0;
    // right: 0;
    // z-index: 1;
    // width: 90%;
}
</style>
