<template>
  <div id='mapa' class='bg-white'>
    <q-btn :icon="leftDrawerIcon" class="drawer-handler" @click="toogleLeftDrawer" />
    <ol-map ref='map'
            :loadTilesWhileAnimating='true'
            :loadTilesWhileInteracting='true'
            @moveend='updateMap'
            style='height:100%'>

        <ol-zoom-control :duration='600' />
        <ol-view ref='view'
            maxZoom="19"
            :center='center'
            :zoom='zoom'
            :constrainResolution='true' />

        <div class="ol-attribution">
          © <a href="https://www.openstreetmap.org/copyright/" target="_blank">OpenStreetMap</a> contributors
          | © <a href="https://mapbox.com" target="_blank">Mapbox</a>
          | <a href="https://openlayers.org" target="_blank">OpenLayers</a>
        </div>
        <!-- base map -->
        <ol-tile-layer ref='baseMap' title='mapbox' zIndex="0">
          <ol-source-osm />
            <!-- <ol-source-xyz
              crossOrigin='anonymous'
              url='https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwZXNiYXNlc2lndGUiLCJhIjoiY2wxbHRmZXliMDlkeDNrcG40dm14OWZmNiJ9.UFRSz8T_c4riZkH3CyGgBQ' /> -->
        </ol-tile-layer>

        <!-- SAMPLING EFFORT -->
        <ol-tile-layer ref='samplingEffortLayer' name="samplingEffortLayer">
        </ol-tile-layer>

        <!-- ADMINISTRATIVE LIMITS LAYER -->
        <!-- <ol-vector-layer ref='locationLayer' name="locationLayer" zIndex="5">
          <ol-source-vector :features="locationFeatures" :format='geoJson'>
            <ol-style>
              <ol-style-fill :color="fillLocationColor"></ol-style-fill>
              <ol-style-stroke :color="strokeLocationColor" width="2"></ol-style-stroke>
            </ol-style>
          </ol-source-vector>
        </ol-vector-layer> -->

        <!-- CLUSTERS geojson layer -->
        <ol-vector-layer ref='observationsLayer' name="observationsLayer" zIndex="10">
          <ol-source-vector :features='features' :format='geoJson' ref='observationsSource'>
            <ol-style :overrideStyleFunction="overrideStyleFunction">
            </ol-style>

          </ol-source-vector>
        </ol-vector-layer>

        <!-- SPIDERFIED MARKERS -->
        <ol-vector-layer ref='spiralLayer' name="spiralLayer" zIndex="10">
          <ol-source-vector :format='geoJson' ref='spiralSource'>
            <ol-style :overrideStyleFunction="overrideStyleFunction">
            </ol-style>

          </ol-source-vector>
        </ol-vector-layer>

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
import moment from 'moment'
import 'vue3-openlayers/dist/vue3-openlayers.css'
import { Circle, Fill, Stroke, Icon, Text } from 'ol/style'
import spiderfyPoints from '../js/Spiral'
import UserfixesLayer from '../js/UserfixesLayer'
import AdministrativeLayer from '../js/AdministrativeLayer'
// import VectorTileSource from 'ol/source/VectorTile'
// import GeoJSON from 'ol/format/GeoJSON'
// import Projection from 'ol/proj/Projection'
// import { fromExtent } from 'ol/geom/Polygon'
// import Polygon from 'ol/geom/Polygon'
// import GeojsonVT from '../js/geojson-vt'
// import VectorTileLayer from 'ol/layer/VectorTile'

export default defineComponent({
  components: { ObservationPopup },
  name: 'TheMap',
  emits: ['toogleLeftDrawer', 'workerFinishedIndexing', 'loadingSamplingEffort'],
  props: {},
  setup (props, context) {
    let administrativeLayer
    let userfixesLayer
    let userfixesUrl
    let spiderfyCluster
    let spiderfiedCluster
    let clickOnSpiral = false
    const leftDrawerIcon = ref('null')
    const baseMap = ref('null')
    let simplifyTolerance = null
    const fillLocationColor = ref('null')
    const spiralSource = ref()
    const strokeLocationColor = ref('null')
    const selectedId = ref('null')
    const selectedFeat = ref('null')
    const $store = useStore()
    const selectedIcon = ref('null')
    const features = ref([])
    const locationLayer = ref('null')
    let ready = false
    const map = ref('null')
    const observationsSource = ref()
    const view = ref('null')
    const format = inject('ol-format')
    const geoJson = new format.GeoJSON()
    const worker = new Worker('TheMapWorker.js')
    let selectedFeatures = []
    let spiderfiedIds = []
    let currZoom
    let startDate
    let endDate
    const mapFilters = {
      mode: 'resetFilter',
      observations: [],
      locations: [],
      hashtags: [],
      date: [],
      report_id: []
    }

    const toogleLeftDrawer = function () {
      context.emit('toogleLeftDrawer', {})
      leftDrawerIcon.value = (leftDrawerIcon.value === 'keyboard_arrow_right') ? 'keyboard_arrow_left' : 'keyboard_arrow_right'
    }

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
            const poliLength = lineString.transform('EPSG:4326', 'EPSG:3857').getLength()
            if (poliLength > maxLength) {
              maxLength = poliLength
            }
          })
        } else {
          lineString = new LineString(
            Feat.getGeometry().getLinearRing(0).getCoordinates()
          )
          maxLength = lineString.transform('EPSG:4326', 'EPSG:3857').getLength()
        }

        // simplify tolerance of 5% of perimeter
        simplifyTolerance = (maxLength * 0.001)
        if (simplifyTolerance > 500) {
          simplifyTolerance = 200
        }

        // transform geometry to MERCATOR
        Feat.setGeometry(Feat.getGeometry().transform('EPSG:4326', 'EPSG:3857'))
        Feat.setGeometry(Feat.getGeometry().simplify(simplifyTolerance))
        // for the moment do not add boundary feature to map
        locationFeatures.value = [Feat]
      }
    }

    const autoPanPopup = function () {
      const ol = map.value.map
      const resolution = ol.getView().getResolution()
      const coords = [...selectedFeat.value.values_.geometry.flatCoordinates]
      setTimeout(() => {
        // Disable map update while opening popup
        const overlay = document.querySelector('.parentContainer')
        if (overlay) coords[1] += overlay.clientHeight / 2 * resolution
        flyTo(coords, ol.getView().getZoom())
      }, 100)
    }

    function closePopup () {
      if (selectedId.value) {
        selectedId.value = null
        $store.commit('map/selectFeature', {})
        redrawMap()
      }
    }

    function redrawMap () {
      const olmap = map.value.map
      const bounds = olmap.getView().calculateExtent(olmap.getSize())
      const southWest = transform([bounds[0], bounds[1]], 'EPSG:3857', 'EPSG:4326')
      const northEast = transform([bounds[2], bounds[3]], 'EPSG:3857', 'EPSG:4326')
      worker.postMessage({
        bbox: southWest.concat(northEast),
        zoom: olmap.getView().getZoom()
      })
    }

    const popupContent = computed(() => {
      return $store.getters['map/getSelectedFeature']
    })

    const maxZoom = computed(() => {
      return $store.getters['map/getMaxZoom']
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
          if (event.data.datesInterval) {
            $store.commit('timeseries/setCompleteDatesRange', event.data.datesInterval)
          }
          const defaults = JSON.parse(JSON.stringify($store.getters['app/getDefaults']))
          const initialLayers = defaults.LAYERS
          const initialHashtags = defaults.HASHTAGS
          if (defaults.DATES) {
            const initialDate = expandDate(defaults.DATES)
            mapFilters.date = [initialDate]
          }
          if (defaults.HASHTAGS) {
            mapFilters.hashtags = initialHashtags
          }
          initialLayers.forEach(layerFilter => {
            mapFilters.observations.push({ type: layerFilter.type, code: layerFilter.code })
            $store.commit('map/addActiveLayer', layerFilter.type + '-' + layerFilter.code)
          })
          // mapFilters are ready, now call worker
          const workerData = {}
          workerData.layers = JSON.parse(JSON.stringify($store.getters['app/layers']))
          workerData.filters = mapFilters
          worker.postMessage(workerData)
        } else {
          context.emit('workerFinishedIndexing', { mapFilters })
          startDate = event.data.datesInterval.from
          endDate = event.data.datesInterval.to
          updateMap()
        }
        ready = true
      } else if (event.data.spiderfyCluster) {
        if (event.data.center) {
          const center = transform(event.data.center, 'EPSG:4326', 'EPSG:3857')
          spiderfy(center, event.data.spiderfyFeatures)
        }
        features.value = []
        for (let a = 0; a < event.data.map.length; a++) {
          const f = event.data.map[a]
          const feat = new Feature({
            geometry: new Point(transform(f.geometry.coordinates, 'EPSG:4326', 'EPSG:3857')),
            properties: f.properties,
            id: a
          })
          // Avoid adding the cluster that is being spiderfied
          if (spiderfiedCluster && spiderfiedCluster.values_.properties.cluster_id === f.id) {
            continue
          }
          features.value.push(feat)
        }
        // removeCluster(spiderfiedCluster)
      } else if (event.data.expansionZoom) {
        // User has clicked on a cluster
        const center = transform(event.data.center, 'EPSG:4326', 'EPSG:3857')
        flyTo(center, event.data.expansionZoom)
      } else {
        // The view has changed
        const data = []
        for (let a = 0; a < event.data.map.length; a++) {
          const f = event.data.map[a]
          // Exclude spiral features if there are any because they appear in another layer
          if (spiderfiedIds.includes(f.properties.id)) continue
          const feat = new Feature({
            geometry: new Point(transform(f.geometry.coordinates, 'EPSG:4326', 'EPSG:3857')),
            properties: f.properties,
            id: a
          })
          data.push(feat)
        }
        features.value = data
        const graphDates = event.data.timeseries.dates
        const sDate = graphDates[0]
        const eDate = graphDates[graphDates.length - 1]
        const daysInRange = moment(eDate).diff(moment(sDate), 'days')
        $store.commit('timeseries/updateXUnits', daysInRange)
        $store.dispatch('timeseries/updateData', event.data.timeseries)
      }
    }

    function updateMap () {
      const olmap = map.value.map
      const newZoom = olmap.getView().getZoom()
      if (parseInt(currZoom) !== parseInt(newZoom)) {
        currZoom = newZoom
        spiderfiedIds = []
        spiralSource.value.source.clear()
        closePopup()
      }
      if (!ready) {
        return
      }
      // todo load sampling effor layer
      // Get map starting and endding data dates
      if (clickOnSpiral) return
      // Load observations layers
      const bounds = olmap.getView().calculateExtent(olmap.getSize())
      const southWest = transform([bounds[0], bounds[1]], 'EPSG:3857', 'EPSG:4326')
      const northEast = transform([bounds[2], bounds[3]], 'EPSG:3857', 'EPSG:4326')
      // Add spiderfyCluster in case cluster is spiderfiied
      worker.postMessage({
        bbox: southWest.concat(northEast),
        zoom: parseInt(olmap.getView().getZoom()),
        spiderfyCluster: spiderfyCluster
      })
    }

    function spiderfy (center, clusterFeatures) {
      // update spiderfiedIds to exclude from worker feedback
      const features = []
      clusterFeatures.forEach((feature, index) => {
        spiderfiedIds.push(feature.properties.id)
        const feat = new Feature({
          geometry: new Point(transform(feature.geometry.coordinates, 'EPSG:4326', 'EPSG:3857')),
          properties: feature.properties,
          id: index
        })
        feat.set('originalCoords', transform(feature.geometry.coordinates, 'EPSG:4326', 'EPSG:3857'))
        features.push(feat)
      })

      // In case another spiral is open
      spiralSource.value.source.clear()
      const ol = map.value.map
      const resolution = ol.getView().getResolution()
      const inc = resolution * 40
      const spiderfied = spiderfyPoints(center, features, inc, inc)
      spiralSource.value.source.addFeatures(spiderfied.points)
      spiralSource.value.source.addFeatures(spiderfied.lines)
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

    // function removeFeature (uid) {
    //   features.value = features.value.filter(function (e, i) {
    //     if (e.ol_uid === uid) return false
    //     else return true
    //   })
    // }

    onMounted(function () {
      const defaults = JSON.parse(JSON.stringify($store.getters['app/getDefaults']))
      fillLocationColor.value = defaults.fillLocationColor
      strokeLocationColor.value = defaults.strokeLocationColor
      const ol = map.value.map
      leftDrawerIcon.value = 'keyboard_arrow_left'
      currZoom = ol.getView().getZoom()
      const legend = $store.getters['app/getLayers'].sampling_effort.legend
      const ZIndex = parseInt(baseMap.value.tileLayer.values_.zIndex) + 1
      userfixesUrl = $store.getters['app/getBackend'] + 'api/userfixes/'
      userfixesLayer = new UserfixesLayer(ol, userfixesUrl, legend, ZIndex)
      administrativeLayer = new AdministrativeLayer(ol, fillLocationColor, strokeLocationColor, (ZIndex + 1))

      ol.on('click', function (event) {
        clickOnSpiral = false
        spiderfyCluster = false
        selectedFeatures = []
        let layerName = ''
        let featureOnSpiral
        ol.getView().calculateExtent(ol.getSize())
        const bounds = ol.getView().calculateExtent(ol.getSize())
        const southWest = transform([bounds[0], bounds[1]], 'EPSG:3857', 'EPSG:4326')
        const northEast = transform([bounds[2], bounds[3]], 'EPSG:3857', 'EPSG:4326')

        map.value.map.forEachFeatureAtPixel(event.pixel, function (feature, layer) {
          // Get layer of first feature, in case there is only one
          layerName = layer.values_.name
          // Check if one element is in spiral layer
          if (layerName === 'spiralLayer') {
            clickOnSpiral = true
            featureOnSpiral = feature
          }
          if (['spiralLayer', 'observationsLayer'].includes(layer.values_.name)) {
            // spider lines has no properties
            if (!feature.values_.properties) return

            // Check if click on cluster
            if ('cluster_id' in feature.values_.properties) {
              // check first for zoom level
              if (parseInt(currZoom) >= parseInt(maxZoom.value)) {
                if (spiderfiedCluster) {
                  if (spiderfiedCluster.values_.properties.cluster_id !== feature.values_.properties.cluster_id) {
                    features.value.push(spiderfiedCluster)
                  }
                }

                spiderfyCluster = true
                spiderfiedCluster = feature
                worker.postMessage({
                  bbox: southWest.concat(northEast),
                  zoom: parseInt(ol.getView().getZoom()),
                  spiderfyCluster: spiderfyCluster,
                  getClusterExpansionZoom: feature.values_.properties.cluster_id,
                  center: transform(
                    feature.values_.geometry.flatCoordinates,
                    'EPSG:3857', 'EPSG:4326'
                  )
                })
                return true
              } else {
                worker.postMessage({
                  getClusterExpansionZoom: feature.values_.properties.cluster_id,
                  center: transform(
                    feature.values_.geometry.flatCoordinates,
                    'EPSG:3857', 'EPSG:4326'
                  )
                })
                return true
              }
            } else {
              // Click on just a feature
              feature.set('originalCoords', feature.getGeometry().getCoordinates())
              selectedFeatures.push(feature)
            }
          }
        })

        if (!spiderfyCluster) {
          if (!clickOnSpiral && spiderfiedCluster) {
            features.value.push(spiderfiedCluster)
          }
          spiderfiedCluster = null
        }
        if (clickOnSpiral) {
          selectedFeatures = [featureOnSpiral]
        }
        // Check first for a click outside spiralLayer
        if (layerName !== 'spiralLayer' && !clickOnSpiral) {
          spiralSource.value.source.clear()
          spiderfiedIds = []
        }
        if (selectedFeatures.length === 1) {
          // if feature has no properties or is LineStringdo nothing
          const feature = selectedFeatures[0]
          if (!feature.values_.properties) return
          if (feature.values_.properties.type && feature.values_.properties.type.toLowerCase() === 'linestring') return
          const center = selectedFeatures[0].getGeometry().getCoordinates()
          flyTo(center, ol.getView().getZoom())
          selectedFeat.value = feature
          selectedId.value = feature.values_.properties.id
          selectedIcon.value = $store.getters['app/selectedIcons'][feature.values_.properties.c]
          $store.dispatch('map/selectFeature', feature.values_)
        } else {
          if (selectedFeatures.length > 1) {
            // update spiderfiedIds to exclude from worker feedback
            selectedFeatures.forEach(feature => {
              spiderfiedIds.push(feature.values_.properties.id)
            })
            // In case another spiral is open
            spiralSource.value.source.clear()

            const resolution = ol.getView().getResolution()
            const inc = resolution * 40
            const center = selectedFeatures[0].getGeometry().getCoordinates()
            flyTo(center, ol.getView().getZoom())
            // Move spiral features to spiralLayer and remove them from observationsLayer
            selectedFeatures.forEach(function (ele) {
              removeFeature(ele.ol_uid)
            })
            spiderfyCluster = true
            const spiderfied = spiderfyPoints(center, selectedFeatures, inc, inc)
            spiralSource.value.source.addFeatures(spiderfied.lines)
            spiralSource.value.source.addFeatures(spiderfied.points)
          } else {
            // close popup and refresh features (woker)
            closePopup()
          }
        }
      })

      ol.on('pointermove', function (event) {
        const hit = this.forEachFeatureAtPixel(event.pixel, function (feature, layer) {
          return true
        }, { hitTolerance: 10 })
        if (hit) this.getTargetElement().style.cursor = 'pointer'
        else this.getTargetElement().style.cursor = ''
      })
    })

    function removeFeature (uid) {
      features.value = features.value.filter(function (e, i) {
        if (e.ol_uid === uid) return false
        else return true
      })
    }

    const overrideStyleFunction = (feature, style) => {
      if (feature.getGeometry().getType() === 'LineString') {
        const stroke = new Stroke({
          color: 'rgb(255, 0, 0, 0.5)',
          // color: '#EFA501',
          // lineDash: [2, 8],
          width: 2
        })
        style.setStroke(stroke)
        return true
      }
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
      // Just in case a Spiral is open
      spiderfyCluster = false
      spiderfiedCluster = null
      spiderfiedIds = []
      spiralSource.value.source.clear()
      closePopup()

      // toggle selected layer
      const filterIndex = mapFilters.observations.findIndex(element => {
        return element.type === observation.type && element.code === observation.code
      })

      if (filterIndex > -1) {
        mapFilters.observations.splice(filterIndex, 1)
        mapFilters.mode = 'increaseFilter'
        $store.commit('map/removeActiveLayer', observation.type + '-' + observation.code)
      } else {
        mapFilters.observations.push({ type: observation.type, code: observation.code })
        mapFilters.mode = 'resetFilter'
        $store.commit('map/addActiveLayer', observation.type + '-' + observation.code)
      }
      const workerData = {}
      workerData.layers = JSON.parse(JSON.stringify($store.getters['app/layers']))
      workerData.filters = mapFilters
      worker.postMessage(workerData)
    }

    const clearAdministrativeFeatures = function () {
      locationFeatures.value = []
      spiderfyCluster = false
      spiderfiedCluster = null
      const workerData = {}
      mapFilters.locations = []
      workerData.filters = mapFilters
      mapFilters.mode = 'resetFilter'
      workerData.layers = JSON.parse(JSON.stringify($store.getters['app/layers']))
      worker.postMessage(workerData)
    }

    function filterLocations (location) {
      // Just in case a Spiral is open
      spiralSource.value.source.clear()
      spiderfyCluster = false
      spiderfiedCluster = null
      closePopup()
      const workerData = {}
      if (location) {
        mapFilters.locations = [JSON.stringify(location)]
        mapFilters.tolerance = simplifyTolerance
        mapFilters.mode = 'increaseFilter'
      } else {
        mapFilters.locations = []
        mapFilters.mode = 'resetFilter'
      }

      workerData.filters = mapFilters
      workerData.layers = JSON.parse(JSON.stringify($store.getters['app/layers']))
      worker.postMessage(workerData)
    }

    function filterDate (date) {
      // Just in case a Spiral is open
      spiralSource.value.source.clear()
      spiderfyCluster = false
      spiderfiedCluster = null
      closePopup()
      const workerData = {}
      if (!mapFilters.date.length) {
        mapFilters.mode = 'increaseFilter'
      } else {
        mapFilters.mode = 'resetFilter'
      }
      if (date !== null) {
        const expandedDate = expandDate(date)
        mapFilters.date = [JSON.parse(JSON.stringify(expandedDate))]
      } else {
        mapFilters.date = []
      }

      workerData.filters = mapFilters
      workerData.layers = JSON.parse(JSON.stringify($store.getters['app/layers']))
      worker.postMessage(workerData)
    }

    function filterTags (obj) {
      // Just in case a Spiral is open
      spiderfyCluster = false
      spiderfiedCluster = null
      spiralSource.value.source.clear()
      const tags = obj.tags
      const tag = obj.tag
      const workerData = {}
      workerData.layers = JSON.parse(JSON.stringify($store.getters['app/layers']))
      closePopup()
      // Check if tags contain report_id starting with ':'
      if (tag.startsWith(':')) {
        mapFilters.report_id = []
        if (obj.mode === 'addedTag') {
          mapFilters.mode = 'increaseFilter'
          // Fetch observation with report_id, but first remove starting :
          $store.commit('app/setFilteringTag', { value: true })
          const url = $store.getters['app/getBackend'] + 'api/get_reports/' + tags[0].substring(1)
          const controller = new AbortController()
          const { signal } = controller
          fetch(`${url}`, { signal })
            .then(res => res.json())
            .then(res => {
              mapFilters.report_id = [res]
              workerData.filters = mapFilters
              worker.postMessage(workerData)
              $store.commit('app/setFilteringTag', { value: false })
            })
            .catch(e => {
              $store.commit('app/setFilteringTag', { value: false })
            })
        } else {
          mapFilters.hashtags = JSON.parse(JSON.stringify(tags))
          workerData.filters = mapFilters
          mapFilters.mode = 'resetFilter'
          worker.postMessage(workerData)
        }
      } else {
        // Update mapFilters.tags only if tag is not a report_id (':')
        if (obj.mode === 'addedTag') {
          mapFilters.mode = 'increaseFilter'
        } else {
          mapFilters.mode = 'resetFilter'
        }
        mapFilters.hashtags = JSON.parse(JSON.stringify(tags))
        workerData.filters = mapFilters
        worker.postMessage(workerData)
      }
    }

    function expandDate (date) {
      let expandedDate = null
      if (!date) return
      if (typeof date === 'string') {
        const preDate = moment(date).subtract(1, 'd')
        const postDate = moment(date).add(1, 'd')
        expandedDate = { from: preDate.format('YYYY/MM/DD'), to: postDate.format('YYYY/MM/DD') }
      } else {
        const preDate = moment(date.from).subtract(1, 'd')
        const postDate = moment(date.to).add(1, 'd')
        expandedDate = { from: preDate.format('YYYY/MM/DD'), to: postDate.format('YYYY/MM/DD') }
      }
      return expandedDate
    }

    function refreshUserfixesUrl () {
      const sDate = mapFilters.date[0].from.replaceAll('/', '-')
      const eDate = mapFilters.date[0].to.replaceAll('/', '-')
      userfixesLayer.url = userfixesUrl + sDate + '/' + eDate
    }

    function resetUserfixesTileIndex () {
      userfixesLayer.tileIndex = null
    }

    function checkSamplingEffort (status) {
      if (!status) {
        map.value.map.removeLayer(userfixesLayer.layer)
        return
      }
      let sDate, eDate
      if (!mapFilters.date[0]) {
        sDate = startDate
        eDate = endDate
      } else {
        sDate = mapFilters.date[0].from.replaceAll('/', '-')
        eDate = mapFilters.date[0].to.replaceAll('/', '-')
      }

      userfixesLayer.url = userfixesUrl + sDate + '/' + eDate
      $store.commit('map/setSamplingEffortLoading', { loading: true })
      userfixesLayer.refreshLayer()
    }

    return {
      baseMap,
      mapFilters,
      toogleLeftDrawer,
      checkSamplingEffort,
      refreshUserfixesUrl,
      resetUserfixesTileIndex,
      leftDrawerIcon,
      fillLocationColor,
      strokeLocationColor,
      fitFeature,
      clearAdministrativeFeatures,
      autoPanPopup,
      center,
      filterObservations,
      filterLocations,
      filterDate,
      filterTags,
      zoom,
      map,
      observationsSource,
      locationLayer,
      locationFeatures,
      overrideStyleFunction,
      geoJson,
      features,
      spiralSource,
      updateMap,
      popupContent,
      attributioncontrol: true,
      view,
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
    line-height: 40px;
    margin-bottom: 6px;
    border-radius: 10px;
    font-size: 2em;
    font-weight: normal;
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
    background: #33333342;
    font-size: 10px;
    color: white;
    padding: 4px 20px;
    border-radius: 10px;
    height: 20px;
    line-height: 13px;
  }
  // :deep(.ol-attribution) {
  //   color: white;
  // }

  :deep(.ol-control:hover) {
    background-color: unset;
  }
  :deep(.ol-attribution a) {
    color: #3498DB;
    text-decoration:none;
    &:hover{
      text-decoration:underline;
    }
  }
  .drawer-handler{
    background-color: $primary-color;
    color: white;
    position: fixed;
    top: $header-height;
    z-index: 1100;
    padding: 20px 5px;
    cursor: pointer;
    border-radius: 0 10px 10px 0;
  }
</style>
