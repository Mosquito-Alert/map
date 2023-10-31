<template>
  <div v-if="observationId" class="ma-logo" :title="trans('Mosquito Alert')">
    <a href="//webserver.mosquitoalert.com/">
      <img src="~assets/img/logo_mosquito_alert.png">
    </a>
  </div>
    <ol-map
      ref='map'
      class="report-fit"
      :loadTilesWhileAnimating="true"
      :loadTilesWhileInteracting="true"
      :style="style"
    >
      <q-linear-progress :value="progress" color="orange" class="progress-bar-absolute" v-if="progress>0 && progress<100"/>
      <ol-view
        ref="view"
        :center="center"
        :zoom="zoom"
      />
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
      <!-- BASE LAYER -->
      <ol-tile-layer>
          <ol-source-osm />
      </ol-tile-layer>

      <!-- OBSERVATION LAYER -->
      <ol-vector-layer ref='observationLayer' name="observationLayer" zIndex="20">
        <ol-source-vector ref='observationSource' :features="feature">
          <ol-style :overrideStyleFunction="styleFunction">
          </ol-style>
        </ol-source-vector>
      </ol-vector-layer>

      <observation-popup
        @popupimageloaded="autoPanPopup"
        :selectedFeature="popupContent"
        @closePopupButton="closePopup"
      ></observation-popup>

  </ol-map>
</template>

<script>
import { watch, ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import 'vue3-openlayers/dist/vue3-openlayers.css'
import { transform } from 'ol/proj.js'
import ObservationPopup from './ObservationPopup.vue'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import MapToCanvas from '../js/MapToCanvas'
import { Icon } from 'ol/style'
import { StatusCodes as STATUS_CODES } from 'http-status-codes'
import axios from 'axios'
import FormatObservation from '../js/FormatObservation'

export default {
  props: ['popup', 'featContent', 'height', 'width', 'toCanvas', 'mapId', 'clickable'],
  components: { ObservationPopup },
  setup (props, context) {
    const progress = ref()
    const $store = useStore()
    const route = useRoute()
    const map = ref('null')
    const view = ref('null')
    const center = ref(null)
    const zoom = ref(16)
    let feature
    let selectedFeatures = []
    const observationSource = ref()
    const observationId = (route.params) ? ((route.params.code) ? route.params.code : '') : ''
    const identifier = (props.mapId) ? props.mapId : 'map'

    const attrVisible = ref(true)
    const foldingIcon = ref('<')

    function unfoldAttribution () {
      attrVisible.value = !attrVisible.value
      if (attrVisible.value) {
        foldingIcon.value = '>'
      } else {
        foldingIcon.value = '<'
      }
    }

    async function selectFeature (feature) {
      const root = $store.getters['app/getBackend']
      const url = root + 'get_observation/' + feature.properties.id + '/'
      const titles = $store.getters['map/getTitles']
      const latinNames = $store.getters['map/getLatinNames']

      // If there is no id then all info is already in feature
      if (!feature.properties.id) {
        const formated = new FormatObservation(feature.properties, titles, latinNames).format()
        formated.coordinates = feature.geometry.flatCoordinates
        $store.commit('map/selectFeature', formated)
        return
      }
      progress.value = 0
      await axios(url, {
        withCredentials: true,
        onDownloadProgress: (progressEvent) => {
          progress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        }
      }).then(resp => {
        resp.data.coordinates = feature.geometry.flatCoordinates
        const formated = new FormatObservation(resp.data, titles, latinNames).format()
        $store.commit('map/selectFeature', formated)
      })
    }

    const listenClick = computed(() => {
      return props.clickable
    })

    const doCanvas = computed(() => {
      return (props.toCanvas === 'true')
    })

    const style = computed(() => {
      if (props.height) {
        return 'height:' + props.height + ';width:' + props.width
      }
      return 'height: 100%'
    })

    const openPopup = computed(() => {
      return (props.popup === 'true')
    })

    const mobile = computed(() => {
      return $store.getters['app/getIsMobile']
    })

    const closePopup = function () {
      $store.commit('map/selectFeature', {})
    }

    // Check if popup is required
    onMounted(function () {
      // This hides the address bar:
      const vh = window.innerHeight * 0.01
      // Then we set the value in the --vh custom property to the root of the document
      document.documentElement.style.setProperty('--vh', `${vh}px`)

      if (listenClick.value) {
        map.value.map.on('pointermove', function (event) {
          const hit = this.forEachFeatureAtPixel(event.pixel, function (feature, layer) {
            return true
          }, { hitTolerance: 10 })
          if (hit) this.getTargetElement().style.cursor = 'pointer'
          else this.getTargetElement().style.cursor = ''
        })

        map.value.map.on('click', function (event) {
          selectedFeatures = []
          map.value.map.forEachFeatureAtPixel(event.pixel, function (feature, layer) {
            selectedFeatures.push(feature)
          })
          if (selectedFeatures.length === 1) {
            // if feature has no properties or is LineStringdo nothing
            const feature = selectedFeatures[0]
            if (!feature.values_.properties) return
            if (feature.values_.properties.type && feature.values_.properties.type.toLowerCase() === 'linestring') return

            // Only move map if is not a mobile
            // $store.dispatch('map/selectFeature', feature.values_)
            selectFeature(feature.values_)
          } else {
            // Close popup if any
            selectedFeatures = []
            $store.commit('map/selectFeature', {})
          }
        })
      }
      if (observationId) {
        doMapById()
      } else {
        // Here doing list of observations (reports)
        doMapByFeature(props.featContent)
        if (doCanvas.value) {
          const mCanvas = new MapToCanvas({ map: map.value.map })
          map.value.map.on('rendercomplete', function (e) {
            document.querySelector('img#' + identifier).src = mCanvas.doCanvas()
            if (document.querySelector('div#' + identifier)) {
              document.querySelector('div#' + identifier).style.display = 'none'
            }
          })
        }
      }
    })

    const popupContent = computed(() => {
      return $store.getters['map/getSelectedFeature']
    })

    watch(popupContent, (currentValue, oldValue) => {
      const fCoords = transform(
        [currentValue.lon, currentValue.lat],
        'EPSG:4326', 'EPSG:3857'
      )
      const json = JSON.parse(JSON.stringify(popupContent.value))
      json.c = json.private_webmap_layer
      feature = new Feature({
        geometry: new Point(fCoords),
        properties: json
      })
      // Only one feature allowed
      if (!observationSource.value.source.getFeatures().length) {
        observationSource.value.source.addFeature(feature)
        autoPanPopup()
      }
    })

    const styleFunction = (feature, style) => {
      // if (openPopup.value) {
      //   const selectedIcon = new Icon({
      //     src: $store.getters['app/selectedIcons'][feature.values_.properties.c],
      //     anchor: [0.5, 1]
      //   })
      //   style.setImage(selectedIcon)
      //   style.setText('')
      // } else {
      let observations = $store.getters['app/layers'].observations
      let observationsKeys = Object.keys(observations)
      let featureKey = observationsKeys.find(function (e) {
        return observations[e].categories.includes(feature.values_.properties.c)
      })

      // If not found check on Bites
      if (!featureKey) {
        observations = $store.getters['app/layers'].bites
        observationsKeys = Object.keys(observations)
        featureKey = observationsKeys.find(function (e) {
          return observations[e].categories.includes(feature.values_.properties.c)
        })
      }

      // If not found check on breeding sites
      if (!featureKey) {
        observations = $store.getters['app/layers'].breeding
        observationsKeys = Object.keys(observations)
        featureKey = observationsKeys.find(function (e) {
          return observations[e].categories.includes(feature.values_.properties.c)
        })
      }

      // If not found check on otherObservations
      if (!featureKey) {
        observations = $store.getters['app/layers'].otherObservations
        observationsKeys = Object.keys(observations)
        featureKey = observationsKeys.find(function (e) {
          return observations[e].categories.includes(feature.values_.properties.c)
        })
      }
      // if no layer selected then featurekey is null
      let iconUrl
      if (featureKey) {
        iconUrl = observations[featureKey].icon
        if (feature.values_.properties.c.toLowerCase() === 'japonicus_koreicus') {
          iconUrl = observations[featureKey].iconConflict
        }
      } else {
        observations = $store.getters['app/layers'].other
        iconUrl = observations.conflict.icon
      }
      const icon = new Icon({
        src: iconUrl,
        anchor: [0.5, 1]
      })
      style.setImage(icon)
      style.setText('')
      // }
    }

    function flyTo (location, zoom, done) {
      const duration = 500
      let parts = 2
      let called = false
      function callback (complete) {
        --parts
        if (called) return
        if ((parts === 0 || !complete) && done) {
          called = true
          center.value = location
          done(complete)
        }
      }
      view.value.view.animate({ center: location, duration: duration },
        callback
      )
      view.value.view.animate({ zoom: zoom, duration: duration },
        callback
      )
    }

    const autoPanPopup = function () {
      if (mobile.value) {
        return
      }
      const ol = map.value.map
      const resolution = ol.getView().getResolution()
      const coords = feature.values_.geometry.flatCoordinates
      setTimeout(() => {
        // Disable map update while opening popup
        const overlay = document.querySelector('.parentContainer')
        if (overlay) {
          const x = coords[0]
          const y = coords[1] + (overlay.clientHeight / 2 * resolution)
          flyTo([x, y], ol.getView().getZoom())
        }
      }, 100)
    }

    function doMapByFeature (feat) {
      const json = JSON.parse(JSON.stringify(feat))
      const fCoords = transform(
        [json.lon, json.lat],
        'EPSG:4326', 'EPSG:3857'
      )
      center.value = fCoords
      json.c = json.private_webmap_layer
      feature = new Feature({
        geometry: new Point(fCoords),
        properties: json
      })
      observationSource.value.source.addFeature(feature)
    }

    function doMapById () {
      if (openPopup.value) {
        $store.dispatch('map/selectOneFeatureMap', observationId)
      } else {
        const url = $store.getters['app/getBackend'] + 'get_observation/' + observationId + '/'
        axios.get(url, {
          withCredentials: true
        })
          .then(resp => {
            console.log(resp)
            if (resp.status !== STATUS_CODES.OK) {
              $store.commit('app/setModal', {
                id: 'error',
                content: {
                  visibility: true,
                  msg: resp.data.error
                }
              })
            } else {
              const fCoords = transform(
                [resp.data.lon, resp.data.lat],
                'EPSG:4326', 'EPSG:3857'
              )
              center.value = fCoords
              // styleFunction layer uses c attribute for private_webmap_layer value
              resp.data.c = resp.data.private_webmap_layer
              feature = new Feature({
                geometry: new Point(fCoords),
                properties: resp.data
              })
              observationSource.value.source.addFeature(feature)
            }
          })
      }
    }

    const trans = function (text) {
      return $store.getters['app/getText'](text)
    }

    return {
      trans,
      observationId,
      mobile,
      attrVisible,
      foldingIcon,
      unfoldAttribution,
      style,
      closePopup,
      identifier,
      doCanvas,
      map,
      openPopup,
      view,
      center,
      zoom,
      feature,
      styleFunction,
      observationSource,
      popupContent,
      autoPanPopup,
      progress
    }
  }
}
</script>

<style slang='scss'>
  .ol-mapa{
    height: 100%;
  }
  img{
    height: auto;
  }
  .ma-logo{
    position: absolute;
    top:5px;
    left: 5px;
    z-index:100;
    transform: scale(0.8);
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

  .report-fit{
    height: 100%;
  }
  .progress-bar-absolute{
    position:absolute;
    top:0;
    z-index:1;
  }
</style>
