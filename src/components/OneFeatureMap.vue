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

    <div class="ol-attribution">
      © <a href="https://www.openstreetmap.org/copyright/" target="_blank">OpenStreetMap</a> contributors
      | © <a href="https://mapbox.com" target="_blank">Mapbox</a>
      | <a href="https://openlayers.org" target="_blank">OpenLayers</a>
    </div>

    <!-- BASE LAYER -->
    <ol-tile-layer>
        <ol-source-osm />
    </ol-tile-layer>

    <!-- OBSERVATION LAYER -->
    <ol-vector-layer ref='observationLayer' name="observationLayer">
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
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Icon } from 'ol/style'

export default {
  components: { ObservationPopup },
  setup (props, context) {
    const $store = useStore()
    const route = useRoute()
    const map = ref('null')
    const view = ref('null')
    let feature
    const observationSource = ref('null')

    const observationId = (route.params) ? ((route.params.code) ? route.params.code : '') : ''
    // const anim = (route.params) ? ((route.params.anim) ? route.params.anim.length > 0 : route.params.anim.length) : 0

    $store.dispatch('map/selectOneFeatureMap', observationId)

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

      observationSource.value.source.addFeature(feature)
    })

    const styleFunction = (feature, style) => {
      const selectedIcon = new Icon({
        src: $store.getters['app/selectedIcons'][feature.values_.properties.c],
        anchor: [0.5, 1]
      })
      style.setImage(selectedIcon)
      style.setText('')
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

  .ol-attribution:not(.ol-collapsed){
    background: #33333342;
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
    padding: 4px 20px;
    border-radius: 10px;
    height: 20px;
    line-height: 13px;
  }

  .ol-attribution a:hover {
    text-decoration:underline;
  }

  .ol-attribution a {
    color: #3498DB;
    text-decoration:none;
  }
</style>
