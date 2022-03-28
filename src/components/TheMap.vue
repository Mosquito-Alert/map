<template>
  <div id='mapa' class='bg-white'>
    <div class="drawer-handler" @click="$emit('toogleLeftDrawer')">
      x
    </div>
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
            <ol-source-xyz
              crossOrigin='anonymous'
              url='https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwZXNiYXNlc2lndGUiLCJhIjoiY2s2Y2F4YnB5MDk4ZjNvb21rcWEzMHZ4NCJ9.oVtnggRtmtUL7GBav8Kstg' />
        </ol-tile-layer>

        <!-- ADMINISTRATIVE LIMITS LAYER -->
        <ol-vector-layer ref='locationLayer' name="locationLayer">
          <ol-source-vector :features="locationFeatures" :format='geoJson'>
          </ol-source-vector>
        </ol-vector-layer>

        <!-- CLUSTERS geojson layer -->
        <ol-vector-layer ref='observationsLayer' name="observationsLayer">
          <ol-source-vector :features='features' :format='geoJson' ref='observationsSource'>
            <ol-style :overrideStyleFunction="overrideStyleFunction">
            </ol-style>

          </ol-source-vector>
        </ol-vector-layer>

        <ol-interaction-select @select="featureSelected"
          :condition="selectCondition"
          :filter="selectInteactionFilter">
            <ol-style>
                <ol-style-icon :src="selectedIcon" :anchor="[0.5, 1]"></ol-style-icon>
            </ol-style>
        </ol-interaction-select>

        <observation-popup @popupimageloaded="autoPanPopup" :selectedFeature="popupContent"></observation-popup>

    </ol-map>
  </div>
</template>

<script>
import { defineComponent, computed, ref, onMounted, inject } from 'vue'
import { useStore } from 'vuex'
import { transform, transformExtent } from 'ol/proj.js'
import ObservationPopup from './ObservationPopup.vue'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Polygon, MultiPolygon, LineString } from 'ol/geom'
import { fromExtent } from 'ol/geom/Polygon'
// import Polygon from 'ol/geom/Polygon'
import { Circle, Fill, Stroke, Icon, Text } from 'ol/style'

export default defineComponent({
  components: { ObservationPopup },
  name: 'TheMap',
  emits: ['toogleLeftDrawer'],
  props: {},
  setup (props, context) {
    const selectedId = ref('null')
    const selectedFeat = ref('null')
    const $store = useStore()
    const selectConditions = inject('ol-selectconditions')
    const selectCondition = selectConditions.singleClick
    const selectedIcon = ref('null')
    const features = ref([])
    const locationLayer = ref('null')
    const locationFeatures = ref([])
    let ready = false
    const map = ref('null')
    const observationsSource = ref('null')
    const view = ref('null')
    const format = inject('ol-format')
    const geoJson = new format.GeoJSON()
    // const worker = $store.getters['app/getWorker']
    const worker = new Worker('TheMapWorker.js')
    const mapFilters = { observations: [], locations: [], hastags: [], date: [] }

    const fitFeature = function (location) {
      const extent = location.features[0].properties.boundingBox.map(parseFloat)
      map.value.map.getView().fit(
        transformExtent(extent, 'EPSG:4326', 'EPSG:3857'),
        { minResolution: 50, nearest: true }
      )
      let Feat = null
      if (location.features[0].geometry.type.toLowerCase() === 'polygon') {
        Feat = new Feature({
          geometry: new Polygon(location.features[0].geometry.coordinates)
        })
      } else if (location.features[0].geometry.type.toLowerCase() === 'multipolygon') {
        Feat = new Feature({
          geometry: new MultiPolygon(location.features[0].geometry.coordinates)
        })
      }

      if (Feat) {
        let lineString = null
        let maxLength = 0
        if (Feat.getGeometry().getType() === 'MultiPolygon') {
          const polis = Feat.getGeometry().getPolygons()
          polis.forEach(function (poli, i, a) {
            lineString = new LineString(
              poli.getLinearRing(0).getCoordinates()
            )
            const poliLength = lineString.getLength()
            if (poliLength > maxLength) {
              maxLength = poliLength
            }
          })
        } else {
          lineString = new LineString(
            Feat.getGeometry().getLinearRing(0).getCoordinates()
          )
          maxLength = lineString.getLength()
        }

        // simplify tolerance of 5% of perimeter
        let tolerance = (maxLength * 0.005)
        if (tolerance > 1000) {
          tolerance = 1000
        }

        Feat = new Feature({
          geometry: fromExtent(extent)
        })

        // transform geometry to MERCATOR
        // Feat.setGeometry(Feat.getGeometry().transform('EPSG:4326', 'EPSG:3857'))
        // Feat.setGeometry(Feat.getGeometry().simplify(1))
        // for the moment do not add boundary feature to map
        // locationFeatures.value = [Feat]
      }
    }

    const autoPanPopup = function () {
      const ol = map.value.map
      const resolution = ol.getView().getResolution()
      const coords = [...selectedFeat.value.values_.geometry.flatCoordinates]
      setTimeout(() => {
        const overlay = document.querySelector('.parentContainer')
        if (overlay) coords[1] += overlay.clientHeight / 2 * resolution
        flyTo(coords, ol.getView().getZoom())
      }, 100)
    }

    const selectInteactionFilter = (feature, layer) => {
      if (layer.values_.name !== 'observationsLayer') {
        return false
      }
      if ('cluster_id' in feature.values_.properties) {
        worker.postMessage({
          getClusterExpansionZoom: feature.values_.properties.cluster_id,
          center: transform(
            feature.values_.geometry.flatCoordinates,
            'EPSG:3857', 'EPSG:4326'
          )
        })
      } else {
        return !('cluster_id' in feature.values_.properties)
      }
    }

    const featureSelected = function (event) {
      if (event.selected[0]) {
        const feature = event.selected[0]
        selectedFeat.value = feature
        // check if click on cluster
        if (feature.values_.properties.cluster_id) {
          worker.postMessage({
            getClusterExpansionZoom: feature.values_.properties.cluster_id,
            center: transform(
              feature.values_.geometry.flatCoordinates,
              'EPSG:3857', 'EPSG:4326'
            )
          })
        }
        autoPanPopup()
      }

      // otherwise
      if (event.selected.length) {
        selectedId.value = event.selected[0].values_.properties.id
        selectedIcon.value = $store.getters['app/selectedIcons'][event.selected[0].values_.properties.c]
        $store.dispatch('map/selectFeature', event.selected[0].values_)
      } else {
        // if not selected then call worker to refresh features
        selectedId.value = null
        $store.commit('map/selectFeature', {})
        const olmap = map.value.map
        const bounds = olmap.getView().calculateExtent(olmap.getSize())
        const southWest = transform([bounds[0], bounds[1]], 'EPSG:3857', 'EPSG:4326')
        const northEast = transform([bounds[2], bounds[3]], 'EPSG:3857', 'EPSG:4326')
        worker.postMessage({
          bbox: southWest.concat(northEast),
          zoom: olmap.getView().getZoom()
        })
      }
    }

    const popupContent = computed(() => {
      return $store.getters['map/getSelectedFeature']
    })
    // Map general configuration
    const zoom = computed(() => {
      return $store.getters['map/getDefault'].ZOOM
    })
    const center = computed(() => {
      const center = $store.getters['map/getDefault'].CENTER
      return transform(center, 'EPSG:4326', 'EPSG:3857')
    })

    worker.onmessage = function (event) {
      if (event.data.ready) {
        // Map data initialization
        if (!ready) {
          const defaults = JSON.parse(JSON.stringify($store.getters['app/getDefaults']))
          const initialLayers = defaults.LAYERS
          if (defaults.DATES) {
            mapFilters.date = [defaults.DATES]
          }
          initialLayers.forEach(layerFilter => {
            filterObservations(layerFilter)
          })
          // const initial = JSON.parse(JSON.stringify($store.getters['app/getDefaults']))
          // initial.LAYERS.forEach(layerFilter => {
          //   filterObservations({
          //     type: 'layer',
          //     data: layerFilter
          //   })
          // })
          // if ('DATES' in initial) {
          //   filterObservations({
          //     type: 'date',
          //     data: initial.DATES
          //   })
          // }
        } else updateMap()
        ready = true
      } else if (event.data.expansionZoom) {
        // User has clicked on a cluster
        const center = transform(event.data.center, 'EPSG:4326', 'EPSG:3857')
        flyTo(center, event.data.expansionZoom)
      } else {
        // The view has changed
        const data = event.data.map.map(f => {
          const feat = new Feature({
            geometry: new Point(transform(f.geometry.coordinates, 'EPSG:4326', 'EPSG:3857')),
            properties: f.properties
          })
          return feat
        })
        features.value = data
        $store.dispatch('timeseries/updateData', event.data.timeseries)
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

      ol.on('pointermove', function (event) {
        const hit = this.forEachFeatureAtPixel(event.pixel, function (feature, layer) {
          return true
        }, { hitTolerance: 10 })
        if (hit) this.getTargetElement().style.cursor = 'pointer'
        else this.getTargetElement().style.cursor = ''
      })
    })

    const overrideStyleFunction = (feature, style) => {
      if ('point_count' in feature.values_.properties && feature.values_.properties.point_count > 1) {
        const size = feature.values_.properties.point_count
        let radius = 0
        if (size < 100) radius = 20
        if (size >= 100) radius = 25
        if (size >= 1000) radius = 35
        if (size >= 10000) radius = 50

        const circle = new Circle({
          fill: new Fill({
            color: 'rgb(127, 153, 136, 1)'
          }),
          stroke: new Stroke({
            color: 'rgb(127, 153, 136, 0.5)',
            width: 15
          }),
          radius: radius
        })
        const text = new Text({
          font: 'bold 14px Roboto',
          text: size.toLocaleString(),
          fill: new Fill({
            color: 'white'
          })
        })
        style.setImage(circle)
        style.setText(text)
      } else {
        // This is no cluster, just an Icon
        if (feature.values_.properties.id === selectedId.value) {
          const selectedIcon = new Icon({
            src: $store.getters['app/selectedIcons'][feature.values_.properties.c],
            anchor: [0.5, 1]
          })
          style.setImage(selectedIcon)
          style.setText('')
        } else {
          // Search inside observations layers
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
    }

    function filterObservations (observation) {
      $store.commit('map/selectFeature', {})
      // toggle selected layer
      const filterIndex = mapFilters.observations.findIndex(element => {
        return element.type === observation.type && element.code === observation.code
      })

      if (filterIndex > -1) {
        mapFilters.observations.splice(filterIndex, 1)
      } else {
        mapFilters.observations.push({ type: observation.type, code: observation.code })
      }
      const workerData = {}
      workerData.layers = JSON.parse(JSON.stringify($store.getters['app/layers']))
      workerData.filters = mapFilters
      worker.postMessage(workerData)
    }

    function filterLocations (location) {
      const workerData = {}
      mapFilters.locations = [JSON.stringify(location)]
      workerData.filters = mapFilters
      workerData.layers = JSON.parse(JSON.stringify($store.getters['app/layers']))
      worker.postMessage(workerData)
    }

    function filterDate (date) {
      const workerData = {}
      console.log(date)
      mapFilters.date = [JSON.parse(JSON.stringify(date))]
      console.log(mapFilters)
      workerData.filters = mapFilters
      workerData.layers = JSON.parse(JSON.stringify($store.getters['app/layers']))
      worker.postMessage(workerData)
    }

    return {
      fitFeature,
      autoPanPopup,
      center,
      filterObservations,
      filterLocations,
      filterDate,
      zoom,
      map,
      observationsSource,
      locationLayer,
      locationFeatures,
      overrideStyleFunction,
      geoJson,
      features,
      updateMap,
      popupContent,
      attributioncontrol: true,
      view,
      featureSelected,
      selectCondition,
      selectInteactionFilter,
      selectedIcon
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
    right:15px;
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
    box-shadow: $box-shadow;
    // box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
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
    background: #33333390;
    font-size: 10px;
    color: black;
    padding: 4px 20px;
    border-radius: 10px;
    height: 20px;
    line-height: 13px;
  }
  :deep(.ol-attribution) {
    color: white;
  }
  .drawer-handler{
    background-color: $primary-color;
    color: white;
    position: fixed;
    top: $header-height;
    z-index: 1100;
    padding: 20px 10px;
    cursor: pointer;
    border-radius: 0 10px 10px 0;
  }
</style>
