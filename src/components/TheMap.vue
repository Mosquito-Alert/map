<template>
  <div id='mapa' class='bg-white'>
    <ol-map ref='map'
            :loadTilesWhileAnimating='true'
            :loadTilesWhileInteracting='true'
            @moveend='updateMap'
            style='height:100%'>
        <ol-zoom-control :duration='600' />
        <ol-view ref='view'
            :center='center'
            :zoom='zoom'
            :constrainResolution='true' />

        <div class="ol-attribution">
          © <a href="https://www.openstreetmap.org/copyright/" target="_blank">OpenStreetMap</a> contributors
          | © <a href="https://mapbox.com" target="_blank">Mapbox</a>
          | <a href="https://openlayers.org" target="_blank">OpenLayers</a>
        </div>
        <!-- base map -->
        <ol-tile-layer ref='baseMap' title='mapbox'>
            <ol-source-xyz crossOrigin='anonymous' url='https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwZXNiYXNlc2lndGUiLCJhIjoiY2s2Y2F4YnB5MDk4ZjNvb21rcWEzMHZ4NCJ9.oVtnggRtmtUL7GBav8Kstg' />
        </ol-tile-layer>

        <!-- geojson layer -->
        <ol-vector-layer ref='observationsLayer'>
          <ol-source-vector :features='features' :format='geoJson' ref='observationsSource'>
            <ol-style :overrideStyleFunction='overrideStyleFunction'>

              <ol-style-circle>
                  <ol-style-fill color='indigo'></ol-style-fill>
                  <ol-style-stroke color='grey' :width='20'></ol-style-stroke>
              </ol-style-circle>

              <ol-style-text>
                  <ol-style-fill color="#fff"></ol-style-fill>
                  <ol-style-stroke color="rgb(0, 0, 0, 0.7)"></ol-style-stroke>
              </ol-style-text>
            </ol-style>
          </ol-source-vector>
        </ol-vector-layer>

    </ol-map>
  </div>
</template>

<script>
import { defineComponent, computed, ref, onMounted, inject } from 'vue'
import { useStore } from 'vuex'
import { transform } from 'ol/proj.js'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
// import { Circle, Style, Text, Icon, Fill, Stroke } from 'ol/style'
// import { asString } from 'ol/color'

export default defineComponent({
  name: 'TheMap',
  props: {},
  setup (props, context) {
    let ready = false
    const worker = new Worker('TheMapWorker.js')
    const $store = useStore()
    const map = ref('null')
    const view = ref('null')
    // const observationsLayer = ref(null)
    // const observationsSource = ref(null)
    const format = inject('ol-format')
    const geoJson = new format.GeoJSON()
    // const projection = ref('EPSG:4326')
    // Map general configuration
    const zoom = computed(() => {
      return $store.getters['map/getDefault'].ZOOM
    })
    const center = computed(() => {
      const center = $store.getters['map/getDefault'].CENTER
      return transform(center, 'EPSG:4326', 'EPSG:3857')
    })
    const features = ref([])

    // const features = computed(() => {
    //   console.log($store)
    //   const features = $store.getters['map/features']
    //   console.log(features)
    //   return ref($store.getters['map/features'])
    // })

    worker.onmessage = function (event) {
      // const source = observations_source.value.source
      if (event.data.ready) {
        // Map data initialization
        if (!ready) {
          const initialLayers = JSON.parse(JSON.stringify($store.getters['app/initialLayers']))
          initialLayers.forEach(layerFilter => {
            filter(layerFilter)
          })
        } else updateMap()
        ready = true
      } else if (event.data.expansionZoom) {
        // User has clicked on a cluster
        const center = transform(event.data.center, 'EPSG:4326', 'EPSG:3857')
        flyTo(center, event.data.expansionZoom)
      } else {
        // The view has changed
        // source.clear()
        // $store.commit('map/updateFeatures', [])
        const data = event.data.map(f => {
          const feat = new Feature({
            geometry: new Point(transform(f.geometry.coordinates, 'EPSG:4326', 'EPSG:3857')),
            properties: f.properties
          })
          return feat
        })
        // source.addFeatures(data)
        // $store.commit('map/updateFeatures', data)
        features.value = data
        // observations_layer.value.vectorLayer.changed()
      }
    }
    function updateMap () {
      const olmap = map.value.map
      if (!ready) return
      const bounds = olmap.getView().calculateExtent(olmap.getSize())
      const southWest = transform([bounds[0], bounds[1]], 'EPSG:3857', 'EPSG:4326')
      const northEast = transform([bounds[2], bounds[3]], 'EPSG:3857', 'EPSG:4326')
      worker.postMessage({
        bbox: southWest.concat(northEast),
        zoom: olmap.getView().getZoom()
      })
    }
    function flyTo (location, zoom, done) {
      const duration = 600
      // const zoom = view.value.view.getZoom();
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
    onMounted(function () {
      const ol = map.value.map
      ol.on('click', function (event) {
        this.forEachFeatureAtPixel(event.pixel, function (feature, layer) {
          if (feature.values_.properties.cluster_id) {
            worker.postMessage({
              getClusterExpansionZoom: feature.values_.properties.cluster_id,
              center: transform(
                feature.values_.geometry.flatCoordinates,
                'EPSG:3857', 'EPSG:4326'
              )
            })
          }
          return feature
        })
      })
      ol.on('pointermove', function (event) {
        const hit = this.forEachFeatureAtPixel(event.pixel, function (feature, layer) {
          return true
        }, { hitTolerance: 10 })
        if (hit) this.getTargetElement().style.cursor = 'pointer'
        else this.getTargetElement().style.cursor = ''
      })
    })
    const overrideStyleFunction = (feature, style) => {
      const stroke = style.getImage().getStroke()
      style.getText().setFont('bold 14px Roboto')
      // style.getImage().getFill().setColor('#efa501')
      style.getImage().getFill().setColor('rgb(255, 221, 25)')
      style.getText().setText('')
      style.getImage().setRadius(10)
      stroke.setWidth(1)
      stroke.setColor('white')

      if ('point_count' in feature.values_.properties && feature.values_.properties.point_count > 1) {
        const size = feature.values_.properties.point_count
        style.getImage().getFill().setColor('rgba(187, 208, 189, 0.7)')
        style.getText().setText(size.toLocaleString())
        stroke.setWidth(15)
        // stroke.setOpacity(.1);
        // stroke.setColor('rgba(255,255,0,0.5)')
        stroke.setColor('rgba(201, 217, 204, 0.5)')
        if (size < 100) style.getImage().setRadius(16)
        if (size >= 100) style.getImage().setRadius(20)
        if (size >= 1000) style.getImage().setRadius(30)
        if (size >= 10000) style.getImage().setRadius(45)
      } else {
        style.getText().setText('')
        style.getImage().setRadius(10)
        stroke.setWidth(1)
        stroke.setColor('#fff')
      }
    }
    function filter (data) {
      data.layers = JSON.parse(JSON.stringify($store.getters['app/layers']))
      worker.postMessage(data)
    }
    return {
      center,
      filter,
      zoom,
      map,
      // observationsLayer,
      // observationsSource,
      overrideStyleFunction,
      geoJson,
      features,
      updateMap,
      attributioncontrol: true,
      view
    }
  }
})
</script>

<style scoped lang='scss'>
  #mapa {
    flex: 1;
    position: relative;
  }
  :deep(.ol-zoom) {
    position: absolute;
    top: auto;
    bottom: 2.5em;
    right: 0.5em;
    left: auto;
    display: flex;
    flex-direction: column;
    background: none;
  }
  :deep(.ol-zoom) button {
    background: $primary-button-background;
    color: $primary-button-text;
    border: none;
    width: 40px;
    height: 40px;
    margin-bottom: 6px;
    border-radius: 10px;
    font-size: 2em;
    cursor: pointer;
    padding: 0 0 20px 0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
  }
  :deep(.ol-zoom) button:hover {
    background: $primary-button-background-hover;
    color: $primary-button-text-hover;
    box-shadow: 0 7px 14px rgba(0,0,0,0.25), 0 5px 5px rgba(0,0,0,0.22);
    transition: all .6s cubic-bezier(.25,.8,.25,1);
  }
  //move the tooltips to the left of the zoom controls
  :deep(.ol-zoom) .ol-has-tooltip:hover [role=tooltip] {
     left: -5.5em;
     border-radius: 4px 0 0 4px;
  }
  :deep(.ol-zoom) .ol-zoom-out.ol-has-tooltip:hover [role=tooltip]{
     left: -6.2em;
  }
  :deep(.ol-attribution) {
    position: absolute;
    top: auto;
    left: auto;
    bottom: 4px;
    right: 10px;
    z-index: 9;
    background: #8c929290;
    font-size: 10px;
    color: black;
    padding: 4px 20px;
    border-radius: 10px;
    height: 20px;
    line-height: 13px;
  }
  :deep(.ol-attribution) a {
    color: black;
  }
</style>
