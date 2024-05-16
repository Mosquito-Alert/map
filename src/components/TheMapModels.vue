<!--
  MAP COMPONENT FOR MODELS TAB
-->

<template>
  <div id='mapa'>
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
      @moveend="positionChange"
      style='height:100%'>
        <ol-zoom-control :duration='600' />
        <ol-scaleline-control />
        <ol-view ref='view'
          :center="center"
          :maxZoom=12
          :multiWorld=false
          :zoom="zoom"
          :projection="projection"
          :constrainResolution='true'
          />

        <div
          class="ol-attribution"
          :class="mobile?(!attrVisible?'mobile collapsed':'mobile'):''"
        >
          <div v-if="!mobile || attrVisible">
            © <a href="https://www.openstreetmap.org/copyright/" target="_blank">OpenStreetMap</a> contributors
            | <a href="https://gadm.org/" target="_blank">© GADM</a>
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
        <ol-tile-layer ref='baseMap' :zIndex=0>
          <ol-source-osm />
        </ol-tile-layer>
    </ol-map>
  </div>
</template>

<script>
import 'vue3-openlayers/dist/vue3-openlayers.css'
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { toLonLat, fromLonLat } from 'ol/proj.js'
import MVT from 'ol/format/MVT'
import VectorTileLayer from 'ol/layer/VectorTile'
import VectorTileSource from 'ol/source/VectorTile'
import { Style, Fill, Stroke } from 'ol/style'
import { Group as LayerGroup } from 'ol/layer'
import Feature from 'ol/Feature'
import Tooltip from 'ol-ext/overlay/Tooltip'
import Hover from 'ol-ext/interaction/Hover'

import axios from 'axios'

export default defineComponent({
  name: 'TheMapModels',
  emits: [
    'toggleLeftDrawer',
    'move'
  ],
  props: ['speciesCode', 'date', 'opacity', 'visible', 'displayChoropleth', 'palette', 'filters', 'lat', 'lon', 'zoom'],
  setup (props, context) {
    const $store = useStore()

    const map = ref('null')
    const leftDrawerIcon = ref('null')

    const progress = ref(0)
    const attrVisible = ref(false)
    const foldingIcon = ref('<')

    const projection = ref('EPSG:3857')

    let CSVS = {}

    const hoverSelectedFeatureId = ref()
    watch(hoverSelectedFeatureId, (newValue, oldValue) => {
      selectableGadmLayers.forEach(function (layer) {
        layer.changed()
      })
    })

    // Watcher for props
    watch(() => [props.speciesCode, props.date], ([newSpeciesCode, newDate]) => {
      if ([newSpeciesCode, newDate].every(item => item !== undefined)) {
        loadLayer(newSpeciesCode, newDate)
      }
    })

    watch(() => props.displayChoropleth, (newValue, oldValue) => {
      modelsLayerGroup.setVisible(newValue && props.visible)
    })

    watch(() => props.opacity, (newValue, oldValue) => {
      modelsLayerGroup.setOpacity(newValue)
      gadm0.setOpacity(newValue)

      // Disable hover if opacity is less than 25%
      baseGadmHoverInteraction.setActive(newValue >= 0.25)
    })

    watch(() => props.visible, (newValue, oldValue) => {
      modelsLayerGroup.setVisible(newValue)
      gadm0.setVisible(newValue)
    })

    watch(() => props.filters, () => {
      refresh()
    }, { deep: true })

    const mapStyleColor = ref({
      lowLevelStroke: '#C9C9C9',
      highLevelStroke: '#B9B9B9',
      background: '#aad3df', // Sea color
      unknown: '#E1E1E1'
    })

    // Map general configuration
    const center = computed(() => {
      return fromLonLat([props.lon, props.lat], projection.value)
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
      leftDrawerIcon.value = 'keyboard_arrow_left'

      // Adding base layer (gadm0)
      map.value.map.addLayer(gadm0)

      // Adding gadm probability model layers.
      map.value.map.addLayer(modelsLayerGroup)

      addTooltip(map.value.map)

      // This should be in <ol-map>, but current vue3-openlayers version
      // does not support these events.
      map.value.map.on('rendercomplete', () => {
        spinner(false)
      })

      if ([props.speciesCode, props.date].every(item => item !== undefined)) {
        loadLayer(props.speciesCode, props.date)
      }
    })

    const addTooltip = (map) => {
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
      map.addOverlay(tooltip)

      // Add hover interaction
      map.addInteraction(baseGadmHoverInteraction)

      baseGadmHoverInteraction.on('change:active', function (e) {
        // hide tooltip on hover disabled.
        if (e.target.get(e.key) === false) {
          tooltip.hide()
          tooltip.removeFeature()
        }
      })

      baseGadmHoverInteraction.on('hover', function (e) {
        tooltip.setFeature(e.feature)

        const featureHasChanged = (e.feature.getId() !== hoverSelectedFeatureId.value)

        if (featureHasChanged) {
          // Replace hoverSelectedFeatureId
          hoverSelectedFeatureId.value = e.feature.getId()
        }
      })

      baseGadmHoverInteraction.on('leave', function (e) {
        // Hide tooltip if no feature is hovered
        tooltip.removeFeature()
        tooltip.hide()

        // Reset hoverSelectedFeatureId
        hoverSelectedFeatureId.value = undefined
      })
    }

    const trans = function (text) {
      return $store.getters['app/getText'](text)
    }

    function positionChange () {
      context.emit(
        'move',
        {
          center: toLonLat(
            map.value.map.getView().getCenter(),
            projection.value
          ),
          zoom: map.value.map.getView().getZoom()
        }
      )
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
          // Converting uncertainty to certainty
          const se = 1 - currentLine[indexSe]
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

    // Get all data necessary to load a model and add layers to  map
    const loadLayer = async function (speciesCode, date) {
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')

      const serverModels = $store.getters['app/getModelsUrl']
      const urls = [
        serverModels + `gadm1/${speciesCode}/${year}/${month}/` + 'gadm1_monthly.csv',
        serverModels + `gadm2/${speciesCode}/${year}/${month}/` + 'gadm2_monthly.csv',
        serverModels + `gadm3/${speciesCode}/${year}/${month}/` + 'gadm3_monthly.csv',
        serverModels + `gadm4/${speciesCode}/${year}/${month}/` + 'gadm4_monthly.csv'
      ]

      spinner(true)
      const requests = urls.map((url) => {
        return axios.get(url, {
          // withCredentials: true,
          signal: AbortSignal.timeout(20000), // Aborts request after 5 seconds
          onDownloadProgress: (progressEvent) => {
            progress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          }
        })
      })

      // GET CSV DATA FILES
      // Clear CSVS object
      CSVS = {}
      const process = { status: 'ok', data: {} }
      await axios.all(requests).then((responses) => {
        responses.forEach((resp) => {
          const decoded = resp.data
          if (!('1' in CSVS)) {
            CSVS['1'] = csvJSON(decoded, 'gadm1')
          } else if (!('2' in CSVS)) {
            CSVS['2'] = csvJSON(decoded, 'gadm2')
          } else if (!('3' in CSVS)) {
            CSVS['3'] = csvJSON(decoded, 'gadm3')
          } else if (!('4' in CSVS)) {
            CSVS['4'] = csvJSON(decoded, 'gadm4')
          }
        })
      }).catch(function (err) {
        process.status = 'error'
        process.data = err
        let errMsg = ''
        if (err.response?.status === 404) {
          errMsg = 'Model not found on Server'
        } else {
          errMsg = err.message
        }
        spinner(false)
        $store.commit('app/setModal', { id: 'error', content: { visibility: true, msg: errMsg } })
        return false
      })
      refresh()
    }

    function getFeatureColor (feature, csvIndex) {
      const defaultColor = mapStyleColor.value.unknown // Default color

      // Get the data from CSV if provided and determine color based on probability
      const dataObj = csvIndex !== undefined ? CSVS[csvIndex] : {}
      const id = feature.getId()
      if (!dataObj || dataObj[id] === undefined) {
        // id not found in dataObj
        return defaultColor
      }

      // Apply filters
      if (props.filters) {
        if (props.filters.certaintyRange) {
          const { min, max } = props.filters.certaintyRange
          const certainty = dataObj[id].se
          if (certainty < min || certainty > max) {
            // Certainty outside the filter range
            return defaultColor
          }
        }
      }

      const palette = props.palette
      const index = Math.min(
        Math.floor(dataObj[id].prob * palette.length),
        palette.length - 1
      )

      return palette[index]
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
          return new Style({
            fill: new Fill({
              color: getFeatureColor(feature, csvIndex)
            }),
            stroke: new Stroke({
              color: mapStyleColor.value.lowLevelStroke,
              width: 0.4
            })
          })
        }
      })

      // Attach spinner trigger events if specified
      if (triggersSpinner) {
        layer.on(['change', 'prerender'], function (e) {
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
          if (feature.getId() === hoverSelectedFeatureId.value) {
            // If yes, return the selected style
            return gadmSelectedStyle
          }
          // If not, no style is applied (feature remains unchanged)
        }
      })
    }

    const upperGadmBorderStyle = new Style({
      stroke: new Stroke({
        color: mapStyleColor.value.highLevelStroke,
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
    gadm0.setPreload(Infinity)
    gadm0.setBackground(mapStyleColor.value.background)

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
      visible: props.displayChoropleth // Set the layer group initially invisible
    })

    // Creating hover interaction only for the baseGadmLayers
    const baseGadmHoverInteraction = new Hover({
      layers: baseGadmLayers
    })

    // Redraw. Get colors from store
    const refresh = async function () {
      // Notify each GADM layer that it has changed, triggering a redraw.
      modelsLayerGroup.getLayers().forEach(function (layer) {
        layer.changed()
      })
    }

    return {
      trans,
      projection,
      refresh,
      positionChange,
      center,
      mobile,
      toggleLeftDrawer,
      attrVisible,
      foldingIcon,
      unfoldAttribution,
      leftDrawerIcon,
      map,
      loadLayer,
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
    color: white;
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
