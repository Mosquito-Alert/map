<template>
<ol-map
  ref='map'
  class="ol-map"
  :loadTilesWhileAnimating="true"
  :loadTilesWhileInteracting="true"
  style="height:100%"
>

    <ol-view
      ref="view"
      :center="center"
      :zoom="zoom"
    />
    <ol-attribution v-if="openPopup"/>
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
    ></observation-popup>

</ol-map>
</template>

<script>
import { watch, ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import 'vue3-openlayers/dist/vue3-openlayers.css'
import { transform } from 'ol/proj.js'
import ObservationPopup from './ObservationPopup.vue'
import OlAttribution from './OlAttribution.vue'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Icon } from 'ol/style'

export default {
  props: ['popup'],
  components: { ObservationPopup, OlAttribution },
  setup (props, context) {
    const $store = useStore()
    const route = useRoute()
    const map = ref('null')
    const view = ref('null')
    let feature
    const observationSource = ref('null')
    const observationId = (route.params) ? ((route.params.code) ? route.params.code : '') : ''

    const openPopup = computed(() => {
      return (props.popup === 'true')
    })

    // Check if popup is required
    if (openPopup.value) {
      $store.dispatch('map/selectOneFeatureMap', observationId)
    } else {
      const url = $store.getters['app/getBackend'] + 'api/get_observation/' + observationId
      fetch(url)
        .then(response => response.json())
        .then(json => {
          $store.commit('map/setDefaults', { zoom: 16, center: [json.lon, json.lat] })
          const fCoords = transform(
            [json.lon, json.lat],
            'EPSG:4326', 'EPSG:3857'
          )
          // styleFunction layer uses c attribute for private_webmap_layer value
          json.c = json.private_webmap_layer
          feature = new Feature({
            geometry: new Point(fCoords),
            properties: json
          })
          console.log(feature.getProperties())
          observationSource.value.source.addFeature(feature)
        })
    }

    const popupContent = computed(() => {
      return $store.getters['map/getSelectedFeature']
    })

    const zoom = computed(() => {
      return $store.getters['map/getDefault'].ZOOM
    })

    const center = computed(() => {
      const center = $store.getters['map/getDefault'].CENTER
      return transform(center, 'EPSG:4326', 'EPSG:3857')
    })

    watch(popupContent, (currentValue, oldValue) => {
      const fCoords = transform(
        [currentValue.lon, currentValue.lat],
        'EPSG:4326', 'EPSG:3857'
      )
      feature = new Feature({
        geometry: new Point(fCoords),
        properties: {
          c: popupContent.value.private_webmap_layer
        }
      })
      $store.commit('map/setDefaults', { zoom: 16, center: [currentValue.lon, currentValue.lat] })
      observationSource.value.source.addFeature(feature)
    })

    const styleFunction = (feature, style) => {
      if (openPopup.value) {
        const selectedIcon = new Icon({
          src: $store.getters['app/selectedIcons'][feature.values_.properties.c],
          anchor: [0.5, 1]
        })
        style.setImage(selectedIcon)
        style.setText('')
      } else {
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
        if (featureKey) {
          let iconUrl = observations[featureKey].icon
          if (feature.values_.properties.c.toLowerCase() === 'japonicus_koreicus') {
            iconUrl = observations[featureKey].iconConflict
          }
          const tiger = new Icon({
            src: iconUrl,
            anchor: [0.5, 1]
          })
          style.setImage(tiger)
          style.setText('')
        }
      }
    }

    function flyTo (location, zoom, done) {
      const duration = 2000
      let parts = 2
      let called = false
      function callback (complete) {
        --parts
        if (called) return
        if ((parts === 0 || !complete) && done) {
          called = true
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

    return {
      map,
      openPopup,
      view,
      center,
      zoom,
      feature,
      styleFunction,
      observationSource,
      popupContent,
      autoPanPopup
    }
  }
}
</script>

<style slang='scss'>
  .ol-mapa {
    height: 100%;
  }
</style>