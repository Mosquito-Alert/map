<!--
  MAP COMPONENT FOR MODELS TAB
-->

<template>
  <div id='mapa' class='bg-white'>
    <!-- <q-linear-progress :value="progress" color="orange" class="progress-bar-absolute"  v-if="progress>0 && progress<100"/> -->
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
      @moveend='positionChange'
      style='height:100%'>
        <ol-zoom-control :duration='600' />
        <ol-scaleline-control />
        <ol-view ref='view'
          :center="center"
          :maxZoom=19
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
        <ol-tile-layer title='mapbox' :zIndex=0 :preload="Infinity">
          <ol-source-osm />
        </ol-tile-layer>

    </ol-map>
      <!-- DOWNLOAD BUTTON -->
      <cust-control
        ref="downloadControl"
        icon="fa-solid fa-download"
        class="ol-download ol-unselectable ol-control"
        title="Geopackage"
        style="bottom:180px"
        :disabled="!speciesCode"
        @clicked="downloadGeopackage"
      >
      </cust-control>
      <!-- DOWNLOAD SCREENSHOT BUTTON -->
      <cust-control
        ref="screenshotControl"
        icon="fa-solid fa-camera-viewfinder"
        class="ol-download ol-unselectable ol-control"
        title="Screenshot"
        :disabled="!speciesCode"
        @clicked="exportPNG"
      >
      </cust-control>
  </div>
</template>

<script>
import 'vue3-openlayers/dist/vue3-openlayers.css'
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'

import CustControl from './CustControl'

import { toLonLat, fromLonLat } from 'ol/proj.js'
import { Group as LayerGroup } from 'ol/layer'
import VectorTileLayer from 'ol/layer/VectorTile'
import VectorTileSource from 'ol/source/VectorTile'
import MVT from 'ol/format/MVT'
import Feature from 'ol/Feature'
import { Style, Fill, Stroke, RegularShape, Text } from 'ol/style'

import Legend from 'ol-ext/legend/Legend'
import LegendControl from 'ol-ext/control/Legend'
import Tooltip from 'ol-ext/overlay/Tooltip'
import Hover from 'ol-ext/interaction/Hover'

export default defineComponent({
  name: 'TheMapEarlyWarning',
  components: { CustControl },
  emits: [
    'toggleLeftDrawer',
    'move'
  ],
  props: ['speciesCode', 'opacity', 'visible', 'lat', 'lon', 'zoom'],
  setup (props, context) {
    const $store = useStore()

    const map = ref('null')
    const leftDrawerIcon = ref('null')

    const attrVisible = ref(false)
    const foldingIcon = ref('<')

    const projection = ref('EPSG:3857')

    // Watcher for props
    watch(() => props.opacity, (newValue, oldValue) => {
      statusLayerGroup.setOpacity(newValue)
    })

    watch(() => props.speciesCode, (newValue, oldValue) => {
      loadLayer(newValue)
    })

    watch(() => props.visible, (newValue, oldValue) => {
      statusLayerGroup.setVisible(newValue)
    })

    const hoverSelectedFeatureId = ref()
    watch(hoverSelectedFeatureId, (newValue, oldValue) => {
      statusSelectedLayer.changed()
    })

    // Get the tiles URL from the store
    const tilesUrl = $store.getters['app/getTilesUrl']

    const mapStyleColor = ref({
      lowLevelStroke: '#919191',
      highLevelStroke: '#A8A8A8',
      background: '#aad3df', // Sea color
      unknown: '#E1E1E1'
    })

    const choroplethData = computed(() => {
      // Keys are the possible value of the geometry specie column.
      return {
        mosquito_alert: {
          label: trans('Mosquito Alert discoveries'),
          color: '#e34a33'
        },
        official: {
          label: trans('Official data'),
          color: '#fef0d9'
        }
      }
    })

    const center = computed(() => {
      return fromLonLat([props.lon, props.lat], projection.value)
    })

    const mobile = computed(() => {
      return $store.getters['app/getIsMobile']
    })

    const toggleLeftDrawer = function () {
      context.emit('toggleLeftDrawer', {})
      leftDrawerIcon.value = (leftDrawerIcon.value === 'keyboard_arrow_right') ? 'keyboard_arrow_left' : 'keyboard_arrow_right'
    }

    function unfoldAttribution () {
      // attrVisible.value = !attrVisible.value
      // if (attrVisible.value) {
      //   foldingIcon.value = '>'
      // } else {
      //   foldingIcon.value = '<'
      // }
    }

    onMounted(function () {
      // Set initial value for left drawer icon
      leftDrawerIcon.value = 'keyboard_arrow_left'

      // Add status layer group to the map
      map.value.map.addLayer(statusLayerGroup)

      addLegend(map.value.map)
      addTooltip(map.value.map)

      if (props.speciesCode) {
        loadLayer(props.speciesCode)
      }
    })

    const addLegend = (map) => {
      // Create legend for the status layer group
      const legend = new Legend({
        title: 'Legend',
        size: [14, 14],
        layer: statusLayerGroup,
        textStyle: new Text({
          font: '14px Roboto'
        }),
        titleStyle: new Text({
          font: '16px Roboto',
          textAlign: 'center',
          justify: 'center'
        })
      })

      // Add legend items based on choropleth data
      Object.entries(choroplethData.value).forEach(([colorKey, { label, color }]) => {
        legend.addItem({
          title: label,
          typeGeom: 'Point',
          style: new Style({
            image: new RegularShape({
              points: 4, // Rectangle
              radius: 14,
              angle: Math.PI / 4,
              stroke: new Stroke({
                color: 'gray',
                width: 1.5
              }),
              fill: new Fill({
                color: color
              })
            })
          })
        })
      })

      // Create legend control and add it to the map
      const legendControl = new LegendControl({
        legend: legend,
        target: 'legend'
      })
      map.addControl(legendControl)
    }

    const addTooltip = (map) => {
      // Create tooltip for displaying feature information
      const tooltip = new Tooltip({
        getHTML: function (feature, info) {
          if (feature !== undefined) {
            return feature.get('locName').trim()
          }
        },
        positioning: 'center-center',
        offsetBox: [0, -15]
      })

      // Add tooltip overlay to the map
      map.addOverlay(tooltip)

      // Add hover interaction to the status layer
      map.addInteraction(statusLayerHoverInteraction)

      // Event handler for toggling tooltip visibility
      statusLayerHoverInteraction.on('change:active', function (e) {
        // Hide tooltip when hover interaction is disabled
        if (e.target.get(e.key) === false) {
          tooltip.hide()
          tooltip.removeFeature()
        }
      })

      // Event handler for handling hover over features
      statusLayerHoverInteraction.on('hover', function (e) {
        // Set feature for tooltip display
        tooltip.setFeature(e.feature)

        // Check if the hovered feature has changed
        const featureHasChanged = (e.feature !== hoverSelectedFeatureId.value)

        // Update selected feature ID and trigger layer change
        if (featureHasChanged) {
          hoverSelectedFeatureId.value = e.feature.getId()
        }
      })

      // Event handler for leaving feature hover
      statusLayerHoverInteraction.on('leave', function (e) {
        // Remove and hide tooltip, reset selected feature ID, trigger layer change
        tooltip.removeFeature()
        tooltip.hide()
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

    const statusLayer = new VectorTileLayer({
      zIndex: 1,
      source: new VectorTileSource({
        maxZoom: 9,
        format: new MVT({
          featureClass: Feature,
          idProperty: 'locCode'
        }),
        url: tilesUrl + $store.getters['app/getEarlyWarningLayername'] + '@EPSG:900913@pbf/{z}/{x}/{-y}.pbf'
      }),
      style: null,
      properties: {
        statusProperty: undefined,
        getFeatureStatus: function (feature) {
          return feature.get(this.statusProperty)
        }
      }
    })

    const selectedStyle = new Style({
      stroke: new Stroke({
        color: 'white',
        width: 2
      })
    })

    const statusSelectedLayer = new VectorTileLayer({
      renderMode: 'vector',
      minZoom: statusLayer.getMinZoom(),
      maxZoom: statusLayer.getMaxZoom(),
      zIndex: statusLayer.getZIndex() + 1,
      source: statusLayer.getSource(),
      style: function (feature, resolution) {
        // Check if the feature's ID exists in the gadmHoverSelect object
        if (feature.getId() === hoverSelectedFeatureId.value) {
          // If yes, return the selected style
          return selectedStyle
        }
        // If not, no style is applied (feature remains unchanged)
      }
    })

    const upperBorderStyle = new Style({
      stroke: new Stroke({
        color: mapStyleColor.value.highLevelStroke,
        width: 0.5
      })
    })

    const upperBorderLayer = new VectorTileLayer({
      renderMode: 'hybrid',
      source: statusLayer.getSource(), // Source inherited from the original layer
      style: function (feature, resolution) {
        if (feature.get('leave') !== 1) {
          return upperBorderStyle
        }
      },
      maxZoom: 6,
      zIndex: statusLayer.getZIndex()
    })

    // Create the VectorTileLayer
    const gadm0 = new VectorTileLayer({
      zIndex: 0,
      preload: Infinity,
      source: new VectorTileSource({
        minZoom: 2,
        maxZoom: 7,
        format: new MVT({
          idProperty: 'COUNTRY'
        }),
        url: tilesUrl + 'map_gadm:ADM_0' + '@EPSG:900913@pbf/{z}/{x}/{-y}.pbf'
      }),
      style: new Style({
        fill: new Fill({
          color: mapStyleColor.value.unknown
        }),
        stroke: new Stroke({
          color: mapStyleColor.value.highLevelStroke,
          width: 0.5
        })
      })
    })
    gadm0.setBackground(mapStyleColor.value.background)

    const statusLayerGroup = new LayerGroup({
      layers: [gadm0, statusLayer, upperBorderLayer, statusSelectedLayer]
    })

    const statusLayerHoverInteraction = new Hover({
      layers: [statusLayer]
    })

    statusLayerGroup.on('change:opacity', function (e) {
      statusLayerHoverInteraction.setActive(e.target.get(e.key) >= 0.25)
    })

    const loadLayer = function (specieCode) {
      statusLayer.setProperties(
        {
          // This is for setting the MVT column to look at
          statusProperty: specieCode
        }
      )
      statusLayer.setStyle(function (feature, resolution) {
        if (feature.get('leave') === 1) {
          // Setting to unknown if undefined.
          const statusValue = statusLayer.getProperties().getFeatureStatus(feature)
          const fillColor = statusValue ? choroplethData.value[statusValue].color : mapStyleColor.value.unknown

          let stroke
          const zoomLevel = map.value.map.getView().getZoom()
          const codeLevel = feature.get('codeLevel')
          if ((zoomLevel >= 6 && codeLevel > 4) || codeLevel <= 4) {
            stroke = new Stroke({
              color: mapStyleColor.value.lowLevelStroke,
              width: 0.25
            })
          } else {
            // Polygons are not perfect and there are holes between them.
            // Filling with the same color in order to prevent showing the
            // base map color between the polygons.
            stroke = new Stroke({
              color: fillColor,
              width: 1
            })
          }

          return new Style({
            fill: new Fill({
              color: fillColor
            }),
            stroke: stroke
          })
        }
      })
    }

    const exportPNG = function () {
      // See: https://openlayers.org/en/latest/examples/export-map.html
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

        const link = document.createElement('a')
        link.href = mapCanvas.toDataURL()
        link.download = 'ma_early_warning_' + props.speciesCode + '.png'
        link.addEventListener('click', () => {
          link.remove() // Remove the link element after it's clicked
        })
        link.click()
        URL.revokeObjectURL(link.href)
      })
      map.value.map.renderSync()
    }

    const downloadGeopackage = () => {
      // See: https://gis.stackexchange.com/questions/331984/create-sql-view-in-geopackage-in-geoserver
      const url = new URL('wfs', $store.getters['app/getmapserverUrl'])

      // Define the list of properties to include in the download
      const propertyNames = ['geom', 'cntryCode', 'cntryName', 'codeLevel', 'locCode', 'locName', props.speciesCode]

      // Parameters for the request
      const params = new URLSearchParams({
        service: 'wfs',
        version: '2.0.0',
        request: 'GetFeature',
        typeNames: $store.getters['app/getEarlyWarningLayername'],
        outputFormat: 'geopkg',
        propertyName: propertyNames.join(','),
        CQL_FILTER: 'leave=1'
      })

      url.search = params.toString()

      const link = document.createElement('a')
      link.href = url.toString()
      link.download = 'ma_early_warning_' + props.speciesCode + '.gpkg'
      link.addEventListener('click', () => {
        link.remove() // Remove the link element after it's clicked
      })
      link.click()
      URL.revokeObjectURL(link.href)
    }

    return {
      projection,
      trans,
      loadLayer,
      exportPNG,
      downloadGeopackage,
      positionChange,
      center,
      mobile,
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
.ol-download{
  bottom: 130px;
  background: transparent;
}

.ol-download.ol-control button i{
  font-size: 0.8em;
}

.ol-download.ol-control button {
  // background: $primary-button-background;
  color: white
}
</style>
