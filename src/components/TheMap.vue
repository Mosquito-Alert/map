<!--
  MAP COMPONENT FOR OBSERVATIONS TAB
  ON EACH MAP MOVEEND, GETS NEW OBSERVATION DATA AND GRAPH DATA FROM WORKER
  APPLIES ALL FILTERS AND CALLS WORKER TO RE-INDEX  DATA
  FIRES DIFERENT EVENTS TO SHOW MODAL WINDOWS (DOWNLOAD DATA, REPORTS, ETC.)
-->

-<template>
  <div id='mapa'
    class='bg-white'
    :class="mobile && graphVisible?'mobile small-size':'full-size'"
  >
    <q-btn v-if="mobile"
      class="drawer-handler-mobile"
      @click="toggleLeftDrawer"
    >
      <q-icon name="menu" />
    </q-btn>
    <q-btn v-else :icon="leftDrawerIcon" class="drawer-handler" @click="toggleLeftDrawer" />

    <!-- SHOW SELECTED DATES ON MAP -->
    <map-dates-filter
      :dateFrom="mapDates.from"
      :dateTo="mapDates.to"
      @calendarClicked="calendarClicked"
    />

    <!-- SHOW OBSERVATIONS COUNTER -->
    <observation-map-counter
      :nPoints="nPoints"
    />

    <!-- MAIN MAP -->
    <ol-map ref='map'
            :loadTilesWhileAnimating='true'
            :loadTilesWhileInteracting='true'
            @moveend='updateMap'
            style='height:100%'>

        <ol-zoom-control :duration='600' />
        <ol-view ref='view'
            maxResolution="39135.75848201024"
            constrainResolution='true'
            multiWorld="true"
            maxZoom="19"
            :center='center'
            :zoom='zoom' />

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
        </ol-tile-layer>

        <!-- SAMPLING EFFORT -->
        <ol-tile-layer ref='samplingEffortLayer' name="samplingEffortLayer">
        </ol-tile-layer>

        <!-- ADMINISTRATIVE LIMITS LAYER -->
        <ol-vector-layer ref='locationLayer' name="locationLayer" zIndex="5">
          <ol-source-vector :features="locationFeatures" :format='geoJson'>
            <ol-style>
              <ol-style-fill :color="fillLocationColor"></ol-style-fill>
              <ol-style-stroke :color="strokeLocationColor" width="2"></ol-style-stroke>
            </ol-style>
          </ol-source-vector>
        </ol-vector-layer>

        <!-- CLUSTERS GEOJSON LAYER FOR ALL OBSERVATIONS-->
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

        <!-- OBSERVATION POPUP -->
        <observation-popup
          @closePopupButton="closePopup"
          @popupimageloaded="autoPanPopup"
          :selectedFeature="popupContent"
        ></observation-popup>
    </ol-map>

        <!-- DOWNLOAD BUTTON -->
        <cust-control
          ref="donwnloadControl"
          icon="fa-solid fa-download"
          class="ol-download ol-unselectable ol-control"
          title="Download"
          @clicked="openDownloadModal"
        >
        </cust-control>

        <!-- REPORTS BUTTON -->
        <cust-control
          ref="reportControl"
          icon="fa-solid fa-file-lines"
          class="ol-reports ol-unselectable ol-control"
          title="Reports"
          @clicked="openReportsModal"
        >
        </cust-control>
  </div>
</template>

<script>
import CustControl from './CustControl'
import { defineComponent, computed, ref, onMounted, inject, watch } from 'vue'
import { useStore } from 'vuex'
import { transform, transformExtent } from 'ol/proj.js'
import ObservationPopup from './ObservationPopup.vue'
import ObservationMapCounter from './ObservationMapCounter.vue'
import MapDatesFilter from './MapDatesFilter.vue'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Polygon, MultiPolygon } from 'ol/geom'
import moment from 'moment'
import 'vue3-openlayers/dist/vue3-openlayers.css'
import { Circle, Fill, Stroke, Icon, Text } from 'ol/style'
import spiderfyPoints from '../js/Spiral'
import UserfixesLayer from '../js/UserfixesLayer'
import ShareMapView from '../js/ShareMapView'
import ReportView from '../js/ReportView'
import MSession from '../js/session.js'

export default defineComponent({
  components: { CustControl, ObservationPopup, ObservationMapCounter, MapDatesFilter },
  name: 'TheMap',
  emits: [
    'toggleLeftDrawer',
    'workerStartedIndexing',
    'workerFinishedIndexing',
    'loadingSamplingEffort',
    'endShareView',
    'timeSeriesChanged',
    'tagsChanged',
    'locationChanged',
    'loadUserFixes',
    'calendarClicked'
  ],
  props: ['sharedView'],
  setup (props, context) {
    let mySession
    let redrawRequired = false
    let privateView = false
    let spiderfyId = ''
    let locationName = ''
    let storeLayers
    let userfixesLayer
    let spiderfyCluster
    let spiderfiedCluster
    let disableUpdateMap = false
    let clickOnSpiral = false
    const leftDrawerIcon = ref('null')
    const nPoints = ref(0)
    const baseMap = ref('null')
    const spiralSource = ref(null)
    const selectedId = ref(null)
    const selectedFeat = ref(null)
    const closedPopupDisable = ref(false)
    const $store = useStore()
    const selectedIcon = ref('null')
    const features = ref([])
    const locationLayer = ref('null')
    const map = ref('null')
    const observationsSource = ref()
    const locationFeatures = ref()
    const view = ref('null')
    const format = inject('ol-format')
    const geoJson = new format.GeoJSON()
    const worker = new Worker('TheMapWorker.js')
    let selectedFeatures = []
    let spiderfiedIds = []
    let currZoom
    const attrVisible = ref(false)
    const foldingIcon = ref('<')
    const defaults = JSON.parse(JSON.stringify($store.getters['app/getDefaults']))
    const fillLocationColor = ref(defaults.fillLocationColor)
    const strokeLocationColor = ref(defaults.strokeLocationColor)
    const YEARS = []
    let dataset = []
    const initialYear = 2014
    const currentYear = new Date().getFullYear()
    let firstDate = new Date()
    let lastDate = new Date()
    let viewCode = null
    // const { cookies } = useCookies()

    for (let a = initialYear; a <= currentYear; a++) {
      YEARS.push({ year: a, data: {} })
    }

    function preLoadView (code) {
      viewCode = code
      const csrfToken = $store.getters['app/getCsrfToken']
      mySession = new MSession(backendUrl, csrfToken)
      mySession.getSession(loadView)
    }

    function loadView () {
      const ol = map.value.map
      $store.commit('app/setCsrfToken', mySession.csrfToken)
      const newView = new ShareMapView(ol, {
        url: loadViewUrl + viewCode + '/',
        csrfToken: $store.getters['app/getCsrfToken']
      })
      newView.load(handleLoadView)
    }

    function unfoldAttribution () {
      attrVisible.value = !attrVisible.value
      if (attrVisible.value) {
        foldingIcon.value = '>'
      } else {
        foldingIcon.value = '<'
      }
    }

    // Map filters for the worker
    const mapFilters = {
      mode: 'resetFilter',
      lastFilterApplied: '',
      observations: [],
      locations: [],
      hashtags: [],
      dates: [],
      featuresSet: [],
      report_id: []
    }

    const graphVisible = computed(() => {
      return $store.getters['timeseries/getGraphIsVisible']
    })

    const mapDates = computed(() => {
      return $store.getters['map/getMapDates']
    })

    const mobile = computed(() => {
      return $store.getters['app/getIsMobile']
    })

    // Watch feaures change to update map counter
    watch(features, (currentF, oldF) => {
      nPoints.value = 0
      currentF.forEach(f => {
        nPoints.value += (f.values_.properties.point_count) ? f.values_.properties.point_count : 1
      })

      nPoints.value += (spiralSource.value.source.getFeatures().length) / 2
    })

    // Initialize some URLS
    const backendUrl = $store.getters['app/getBackend']
    const userfixesUrl = backendUrl + 'api/userfixes/'
    const downloadUrl = backendUrl + 'api/downloads/'
    const shareViewUrl = backendUrl + 'api/view/save/'
    const reportViewUrl = backendUrl + 'api/report/save/'
    const loadViewUrl = backendUrl + 'api/view/load/'
    const curYear = moment().year()
    const initUrl = backendUrl + 'api/get/data/' + curYear + '/'
    const index = YEARS.findIndex(element => {
      return element.year === curYear
    })
    const firstCall = async function () {
      if ($store.getters['map/getFirstViewMap']) {
        await fetch(initUrl, {
          credentials: 'include'
        })
          .then(function (response) {
            return response.json()
          })
          .then(function (geojson) {
            dataset = geojson.features
            YEARS[index].data = JSON.parse(JSON.stringify(dataset))
            context.emit('workerStartedIndexing')
            worker.postMessage({
              initData: true,
              year: moment().year(),
              data: geojson
            })
          })
      } else {
        const dates = cloneJson($store.getters['app/getDefaults'].dates)
        const missing = getMissingYears(dates)

        if (missing.length) {
          await getDataset(missing)
          initMap()
        }
      }
    }

    const toggleLeftDrawer = function () {
      context.emit('toggleLeftDrawer', {})
      leftDrawerIcon.value = (leftDrawerIcon.value === 'keyboard_arrow_right') ? 'keyboard_arrow_left' : 'keyboard_arrow_right'
    }

    const setPendingView = function (extent) {
      map.value.map.getView().fit(extent, { minResolution: 50, nearest: false })
    }

    // Get selected administrative boundary and set locationFeatures to show on map
    const fitFeature = function (location, simplify = true) {
      locationName = location.features[0].properties.displayName
      const extent = location.features[0].properties.boundingBox.map(parseFloat)
      if (mobile.value) {
        $store.commit('app/setPendingView', { extent: transformExtent(extent, 'EPSG:4326', 'EPSG:3857') })
      }
      map.value.map.getView().fit(
        transformExtent(extent, 'EPSG:4326', 'EPSG:3857'),
        { minResolution: 50, nearest: false }
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
        // transform geometry to MERCATOR
        Feat.setGeometry(Feat.getGeometry().transform('EPSG:4326', 'EPSG:3857'))
        locationFeatures.value = [Feat]
      }
    }

    // Adjunst map view to show popup
    const autoPanPopup = function () {
      // When popup is on mobile, don't autopan
      if (mobile.value) {
        return
      }
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
        disableUpdateMap = false
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
      return mobile.value ? $store.getters['map/getDefault'].MOBILEZOOM : $store.getters['map/getDefault'].ZOOM
    })

    const center = computed(() => {
      const center = $store.getters['map/getDefault'].CENTER
      return transform(center, 'EPSG:4326', 'EPSG:3857')
    })

    /*
     GET DATA FROM WORKER
     SEVERAL MODES APPLY BASED ON event.data properties
     */
    worker.onmessage = function (event) {
      if (event.data.dataset) {
        dataset = event.data.dataset
      }
      if (event.data.initData) {
        // initData is true only first time
        $store.commit('map/setFirstViewMap', false)
        initMap()
      }
      if (redrawRequired) {
        redrawRequired = false
        spiderfyCluster = false
        redrawMap()
      }
      // if grap data is included then manage and exit
      if (event.data.timeseries) {
        manageTimeSeries(event.data.timeseries)
        return
      }

      // Get min and max dates from worker and update store
      if (event.data.minMaxDates) {
        if (event.data.getAllDates) {
          $store.commit('map/setMinMaxDates', {
            min: event.data.minMaxDates.min,
            max: event.data.minMaxDates.max
          })
          $store.commit('app/setCalendarSubtitle', (
            moment(event.data.minMaxDates.min).format('DD/MM/YYYY') +
            ' - ' + moment(event.data.minMaxDates.max).format('DD/MM/YYYY')
          ))
          $store.commit('map/setMapDates', {
            from: '',
            to: ''
          })
        }
      }

      // Check if new index is been done by worker
      if (event.data.ready) {
        if (mapFilters.lastFilterApplied === event.data.indexing) {
          context.emit('workerFinishedIndexing', { mapFilters })
        }
        updateMap()
      } else if (event.data.spiderfyCluster) {
        // If no index check if cluster is spiderfied
        if (event.data.center) {
          spiderfyId = false
          const center = transform(event.data.center, 'EPSG:4326', 'EPSG:3857')
          spiderfy(center, event.data.spiderfyFeatures)
          if (event.data.openPopupId) {
            const fId = event.data.openPopupId
            const sFeature = getSpiralFeature(fId)
            $store.dispatch('map/selectFeature', sFeature.values_)
          }
        }
        features.value = []
        // Get spiderfied features ready
        for (let a = 0; a < event.data.map.length; a++) {
          const f = event.data.map[a]
          const feat = new Feature({
            geometry: new Point(transform(f.geometry.coordinates, 'EPSG:4326', 'EPSG:3857')),
            properties: f.properties,
            id: a
          })
          // Skip cluster that is spiderfied in shared view
          if (event.data.clusterId && event.data.clusterId === f.id) {
            spiderfiedCluster = feat
            continue
          }
          // Skip cluster that is spiderfied by clicking
          if (spiderfiedCluster && spiderfiedCluster.values_.properties.cluster_id === f.id) {
            continue
          }
          features.value.push(feat)
        }
        spinner(false)
        // removeCluster(spiderfiedCluster)
      } else if (event.data.expansionZoom) {
        // User has clicked on a cluster
        const tExtent = transformExtent(event.data.clusterExtent, 'EPSG:4326', 'EPSG:3857')
        const expandFactor = map.value.map.getView().getResolution()
        // Make extent bigger to show cluster elments. Otherwise elements could just not been drawn
        tExtent[0] = tExtent[0] - expandFactor
        tExtent[1] = tExtent[1] - expandFactor
        tExtent[2] = tExtent[2] + expandFactor
        tExtent[3] = tExtent[3] + expandFactor
        map.value.map.getView().fit(
          tExtent,
          { duration: 600, nearest: false }
        )
        // const center = transform(event.data.center, 'EPSG:4326', 'EPSG:3857')
        // flyTo(center, event.data.expansionZoom)
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
        if (!$store.getters['timeseries/getGraphIsVisible']) {
          spinner(false)
        }
      }
    }

    function cloneJson (j) {
      return JSON.parse(JSON.stringify(j))
    }

    // Get observatins from spiral layer
    function getSpiralFeature (id) {
      const fs = spiralSource.value.source.getFeatures()
      const f = fs.find(f => {
        if (f.getProperties().properties) {
          return (f.getProperties().properties.id === id)
        }
        return false
      })
      return f
    }

    function getCurrentYearDates () {
      return {
        from: moment().startOf('year').format('YYYY-MM-DD'),
        to: moment().format('YYYY-MM-DD')
      }
    }

    // Prepare firt view map
    function initMap () {
      const appLayers = JSON.parse(JSON.stringify($store.getters['app/layers']))
      // Load default values
      // Check if not loading shared view
      // Set default dates, otherwise current year data only
      const mapDefaults = JSON.parse(JSON.stringify($store.getters['map/getDefault']))
      const appDefaults = JSON.parse(JSON.stringify($store.getters['app/getDefaults']))

      const initialObservations = appDefaults.observations

      if (appDefaults.dates.length) {
        mapFilters.dates = [appDefaults.dates[0]]
        $store.commit('map/setMapDates', appDefaults.dates[0])
      } else {
        const currentDates = getCurrentYearDates()
        mapFilters.dates = [currentDates]
        $store.commit('map/setMapDates', currentDates)
      }
      if (appDefaults.hashtags.length) {
        mapFilters.hashtags = appDefaults.hashtags
      }
      if (appDefaults.locations.length) {
        mapFilters.locations = appDefaults.locations
      }

      mapFilters.observations = getObservationsToLoadOnMap(initialObservations, privateView)
      mapFilters.observations.forEach(layerFilter => {
        $store.commit('map/addActiveLayer', {
          type: layerFilter.type,
          code: layerFilter.code
        })
        $store.commit('app/activateLayerIcon', {
          type: layerFilter.type,
          code: layerFilter.code
        })
      })

      // Hashtag filter or report_id, not both at the same time
      if (appDefaults.hashtags.length) {
        context.emit('tagsChanged', appDefaults.hashtags)
      } else {
        if (appDefaults.report_id.length) {
          // add 'semicolon to all report_ids'
          const reports = appDefaults.report_id.map(e => {
            return ':' + e
          })
          context.emit('tagsChanged', reports)
        }
      }

      // Check for sampling effort
      context.emit('loadUserFixes', {
        status: appDefaults.sampling_effort,
        dates: mapFilters.dates
      })

      const workerData = {}
      workerData.layers = appLayers
      workerData.filters = mapFilters
      workerData.dataset = dataset
      workerData.bbox = cloneJson($store.getters['map/getViewbox'])
      workerData.zoom = mapDefaults.ZOOM
      if (spiderfyCluster) {
        workerData.spiderfyId = spiderfyId
        workerData.spiderfyCluster = true
      }
      context.emit('workerStartedIndexing')
      $store.commit('map/setFirstViewMap', false)
      worker.postMessage(workerData)
    }

    // Handle loaded view. Set UI accordingly
    async function handleLoadView (view) {
      if (view.status === 'error') {
        $store.commit('app/setModal', {
          id: 'error',
          content: {
            visibility: true,
            msg: view.msg,
            redirection: false
          }
        })
        initMap()
        return
      }
      const v = JSON.parse(view.view[0].view)
      privateView = v.privateView
      $store.commit('map/setDefaults', {
        zoom: v.zoom,
        center: transform(v.center, 'EPSG:3857', 'EPSG:4326')
      })
      let d
      if (v.filters.dates.length) {
        d = v.filters.dates
        d = d[0]
        $store.commit('app/setDefaultDates', [d])
        $store.commit('map/setMapDates', { d })
        mapFilters.dates = [d]
      } else {
        d = $store.getters['map/getDatesRange']
        $store.commit('app/setDefaultDates', d)
        $store.commit('map/setMapDates', d)
      }

      const viewObservations = cloneJson(v.filters.observations)
      mapFilters.observations = getObservationsToLoadOnMap(viewObservations, privateView)

      $store.commit('app/setDefaults', {
        observations: mapFilters.observations,
        dates: [d],
        hashtags: v.filters.hashtags
      })
      context.emit('timeSeriesChanged', [d])

      // Hashtag filter or report_id, not both at the same time
      if (v.filters.hashtags.length) {
        context.emit('tagsChanged', v.filters.hashtags)
      } else {
        if (v.filters.report_id.length) {
          // add 'semicolon to all report_ids'
          const reports = v.filters.report_id.map(e => {
            return ':' + e
          })
          context.emit('tagsChanged', reports)
        }
      }
      // Mode must be always 'resetFilter'
      mapFilters.mode = v.filters.mode

      if (v.filters.locations.length) {
        const jsonLocation = JSON.parse(v.filters.locations)
        if ('type' in jsonLocation) {
          // Geometry is already been simplified
          context.emit('locationChanged', v.locationName)
          fitFeature(jsonLocation, false)
        }
      }

      if (v.samplingEffort) {
        $store.commit('map/addActiveLayer', { type: 'sampling-effort' })
        context.emit('loadUserFixes', {
          status: true,
          dates: v.filters.dates
        })
      }

      if (v.popup) {
        // Disable closepopup to prevent reseting selectedId.value
        closedPopupDisable.value = true
        selectedId.value = v.popup
        const f = v.feature
        const feature = new Feature({
          geometry: new Point(f.geometry),
          properties: f.properties,
          id: f.id
        })
        disableUpdateMap = false
        spiderfyId = ''
        spiderfyCluster = false
        selectedFeat.value = feature
        selectedIcon.value = $store.getters['app/selectedIcons'][feature.values_.properties.c]
        if (v.spiderfyId) {
          disableUpdateMap = true
          spiderfyId = v.spiderfyId
          spiderfyCluster = true
          // redraw required to get grahdata
          redrawRequired = true
        } else {
          $store.dispatch('map/selectFeature', feature.values_)
        }
      }

      mapFilters.locations = v.filters.locations
      mapFilters.report_id = JSON.parse(JSON.stringify(v.filters.report_id))
      mapFilters.featuresSet = JSON.parse(JSON.stringify(v.filters.featuresSet))
      const missing = getMissingYears(mapFilters.dates)
      if (missing.length) {
        await getDataset(missing)
        initMap()
      }
    }

    function getObservationsToLoadOnMap (viewObservations, privateView) {
      const possibles = $store.getters['app/getPossibleCategories']
      const observations = []
      const codes = []
      const appLayers = JSON.parse(JSON.stringify($store.getters['app/layers']))
      viewObservations.forEach(layerFilter => {
        // If user authorized add all _probable layers, otherwise remove _probable layers
        if ($store.getters['app/getAuthorized']) {
          if (!privateView && possibles.includes(layerFilter.code)) {
            if (appLayers.observations[layerFilter.code].categories.indexOf('_probable') === -1) {
              const possibleCode = layerFilter.code + '_probable'
              if (!codes.includes(possibleCode)) {
                codes.push(possibleCode)
                observations.push({
                  type: layerFilter.type,
                  code: possibleCode,
                  categories: appLayers[layerFilter.type][possibleCode].categories
                })
              }
            }
          }
        } else {
          if (!(layerFilter.code in appLayers.observations)) {
            if (layerFilter.code.toLowerCase().indexOf('_probable') > -1) {
              layerFilter.code = layerFilter.code.replace('_probable', '')
            }
          }
        }

        if (!codes.includes(layerFilter.code)) {
          if (layerFilter.code in appLayers[layerFilter.type]) {
            codes.push(layerFilter.code)
            observations.push({
              type: layerFilter.type,
              code: layerFilter.code,
              categories: appLayers[layerFilter.type][layerFilter.code].categories
            })
          }
        }
      })
      return observations
    }

    // Init share view. Save data to database
    function shareView () {
      const samplingEffort = $store.getters['map/getActiveLayers'].some(layer => {
        return layer.type === 'sampling-effort'
      })

      let obj = {}
      if (selectedId.value !== null) {
        // Pass selected feature as json, so when loading view will be possible to create selected feature
        const feature = selectedFeat.value.clone()
        obj = {
          geometry: feature.getGeometry().getCoordinates(),
          properties: feature.getProperties().properties,
          id: feature.get('id')
        }
      }

      const ol = map.value.map
      const newView = new ShareMapView(ol, {
        viewType: 'layers',
        privateView: $store.getters['app/getAuthorized'],
        filters: mapFilters,
        dates: $store.getters['map/getDatesRange'],
        locationName: locationName,
        popup: (selectedId.value === null) ? '' : selectedId.value,
        feature: obj,
        samplingEffort: samplingEffort,
        url: shareViewUrl,
        callback: handleShareView,
        spiderfyId: (clickOnSpiral) ? selectedId.value : '',
        csrfToken: $store.getters['app/getCsrfToken']
      })
      newView.save()
    }

    // After saviing view emit event to show its URL in modal window
    function handleShareView (status) {
      let content
      if (status.status === 'error') {
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

    // Each time map moves, call worker to get observations for the new view
    function updateMap () {
      if ($store.getters['timeseries/getToggling'] || $store.getters['map/getLeftMenuToggling']) {
        return
      }

      const olmap = map.value.map
      const newZoom = olmap.getView().getZoom()
      $store.commit('map/setCurrents', {
        zoom: newZoom,
        center: transform(
          olmap.getView().getCenter(),
          'EPSG:3857', 'EPSG:4326'
        )
      })
      if (parseInt(currZoom) !== parseInt(newZoom)) {
        currZoom = newZoom
        spiderfiedIds = []
        spiralSource.value.source.clear()
        // Prevent closing popup when loading shared view
        if (closedPopupDisable.value) {
          closedPopupDisable.value = false
        } else {
          closePopup()
        }
      }
      const bounds = olmap.getView().calculateExtent(olmap.getSize())
      const southWest = transform([bounds[0], bounds[1]], 'EPSG:3857', 'EPSG:4326')
      const northEast = transform([bounds[2], bounds[3]], 'EPSG:3857', 'EPSG:4326')
      const viewBox = southWest.concat(northEast).map((e) => {
        return e.toFixed(4)
      })

      // Get map starting and endding data dates
      if (clickOnSpiral) return

      $store.commit('map/setViewbox', viewBox)

      if (disableUpdateMap) {
        return
      }

      if (!mobile.value || $store.getters['timeseries/getGraphIsVisible']) {
        // Do not show spinner if cluster is spiderfied
        if (!spiderfiedCluster) {
          spinner(true)
        }
      }

      // If spider open an no selected feature,spider closes on pan
      if (!Object.keys(popupContent.value).length) {
        disableUpdateMap = false
        spiderfiedCluster = false
        spiderfyId = false
        spiralSource.value.source.clear()
      }
      // Add spiderfyCluster in case cluster is spiderfied
      worker.postMessage({
        bbox: southWest.concat(northEast),
        zoom: parseInt(olmap.getView().getZoom()),
        spiderfyCluster: spiderfyCluster,
        spiderfyId: spiderfyId
      })
    }

    // When a new report is demanded, save data in database and then handle report
    function newReport () {
      const ol = map.value.map
      if (mapFilters.dates[0].from === '') {
        mapFilters.dates[0] = $store.getters['map/getMapDates']
      }
      const newView = new ReportView(ol, {
        privateView: $store.getters['app/getAuthorized'],
        filters: mapFilters,
        locationName: locationName,
        url: reportViewUrl,
        callback: handleReportView,
        lang: $store.getters['app/getLang'],
        csrfToken: $store.getters['app/getCsrfToken']
      })
      newView.save()
    }

    // Open new window and show report
    function handleReportView (report) {
      if (report.status === 'ok') {
        const frontend = $store.getters['app/getFrontendUrl']
        window.open(frontend + report.code, '_bank')
      }
    }

    // Spiderfy observations and add then to spiralLayer
    function spiderfy (center, clusterFeatures) {
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

    // Animation to move map to coordinates
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

    function openDownloadModal () {
      $store.commit('app/setModal', {
        id: 'download',
        content: {
          visibility: true,
          n: features.value.length
        }
      })
    }

    function openReportsModal () {
      $store.commit('app/setModal', {
        id: 'report',
        content: {
          visibility: true,
          n: nPoints.value
        }
      })
    }

    function getDataFromFilters () {
      const ol = map.value.map
      ol.getView().calculateExtent(ol.getSize())
      // Preparing params in Backend format
      const bounds = ol.getView().calculateExtent(ol.getSize())
      const southWest = transform([bounds[0], bounds[1]], 'EPSG:3857', 'EPSG:4326')
      const northEast = transform([bounds[2], bounds[3]], 'EPSG:3857', 'EPSG:4326')
      const viewLayers = []
      storeLayers = $store.getters['app/getLayers']
      storeLayers = $store.getters['app/getLayers']
      mapFilters.observations.forEach(o => {
        const categories = storeLayers[o.type][o.code].categories
        categories.forEach(c => {
          viewLayers.push(c)
        })
      })

      const data = {
        bbox: southWest.concat(northEast),
        observations: viewLayers
      }

      if (mapFilters.dates.length) {
        data.date = mapFilters.dates
      }

      if (mapFilters.report_id.length) {
        data.report_id = mapFilters.report_id
      }

      if (mapFilters.hashtags.length) {
        data.hashtags = JSON.stringify(mapFilters.hashtags)
      }

      if (mapFilters.locations.length) {
        data.location = JSON.stringify(JSON.parse(mapFilters.locations[0]).features[0].geometry)
        data.locationBbox = JSON.stringify(JSON.parse(mapFilters.locations[0]).features[0].properties.boundingBox)
      }
      return data
    }

    // Get observations from backend. Format is xls or gpkg
    function handleDownload (format) {
      const data = getDataFromFilters()

      const url = downloadUrl + format.format + '/'
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/force-download',
          'X-CSRFToken': $store.getters['app/getCsrfToken']
        },
        credentials: 'include',
        body: JSON.stringify(data)
      })
        .then((transfer) => {
          return transfer.blob()
        })
        .then((bytes) => {
          const elm = document.createElement('a')
          elm.href = URL.createObjectURL(bytes)
          elm.setAttribute('download', 'observations.zip')
          elm.click()
        }).catch((error) => {
          console.log(error)
        })
    }

    onMounted(function () {
      const vh = window.innerHeight * 0.01
      // Then we set the value in the --vh custom property to the root of the document
      document.documentElement.style.setProperty('--vh', `${vh}px`)

      const ol = map.value.map

      leftDrawerIcon.value = 'keyboard_arrow_left'
      currZoom = ol.getView().getZoom()

      const legend = $store.getters['app/getLayers'].sampling_effort.legend
      const ZIndex = parseInt(baseMap.value.tileLayer.values_.zIndex) + 1
      userfixesLayer = new UserfixesLayer(ol, userfixesUrl, legend, ZIndex)

      // Detect click events on map to select feature or expand cluster
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
              event.stopPropagation()
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
          // Only move map if is not a mobile
          if (!mobile.value) {
            flyTo(center, ol.getView().getZoom())
          }
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

      // Detect move event to change cursor style when mouse is over feature
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

    // Function to style all observations and clusters
    const overrideStyleFunction = (feature, style) => {
      if (feature.getGeometry().getType() === 'LineString') {
        const stroke = new Stroke({
          color: 'rgb(255, 0, 0, 0.5)',
          width: 2
        })
        style.setStroke(stroke)
        return true
      }
      if ('point_count' in feature.values_.properties && feature.values_.properties.point_count > 1) {
        const size = feature.values_.properties.point_count
        let radius = 0
        if (size < 100) radius = 12
        if (size >= 100) radius = 25
        if (size >= 1000) radius = 35
        if (size >= 10000) radius = 50

        const circle = new Circle({
          fill: new Fill({
            color: 'rgba(127, 153, 136, 1)'
          }),
          stroke: new Stroke({
            color: 'rgba(127, 153, 136, 0.5)',
            width: 15
          }),
          radius: radius
        })
        const text = new Text({
          font: 'bold 1.7px Roboto',
          scale: 9,
          text: size.toLocaleString(),
          stroke: new Stroke({
            color: 'black',
            width: 0.018
          }),
          fill: new Fill({
            color: 'white'
          })
        })
        style.setImage(circle)
        style.setText(text)
      } else {
        // This is no cluster, just an Icon
        // When loading from shared view and popup must open, then selectedFeacture is required
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
            if (feature.values_.properties.c.toLowerCase() === 'albopictus_cretinus') {
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

    // Called when user activates/deactivates any observations from TOC
    function filterObservations (observation) {
      spinner()
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
        $store.commit('map/removeActiveLayer', {
          type: observation.type,
          code: observation.code
        })
      } else {
        mapFilters.observations.push({
          type: observation.type,
          code: observation.code,
          categories: observation.categories
        })
        mapFilters.mode = 'resetFilter'
        mapFilters.lastFilterApplied = 'observations'
        $store.commit('map/addActiveLayer', {
          type: observation.type,
          code: observation.code,
          categories: observation.categories
        })
      }
      $store.commit('app/setDefaultObservations', mapFilters.observations)
      const workerData = {}
      workerData.layers = JSON.parse(JSON.stringify($store.getters['app/layers']))
      workerData.filters = mapFilters
      context.emit('workerStartedIndexing')
      worker.postMessage(workerData)
    }

    const clearAdministrativeFeatures = function () {
      spinner()
      locationName = ''
      locationFeatures.value = []
      spiderfyCluster = false
      spiderfiedCluster = null
      const workerData = {}
      mapFilters.locations = []
      workerData.filters = mapFilters
      mapFilters.mode = 'resetFilter'
      workerData.layers = JSON.parse(JSON.stringify($store.getters['app/layers']))
      context.emit('workerStartedIndexing')
      worker.postMessage(workerData)
    }

    // Called when administrative boundary filter is requested
    function filterLocations (location) {
      spinner()
      spiralSource.value.source.clear()
      spiderfyCluster = false
      spiderfiedCluster = null
      closePopup()
      const workerData = {}
      if (location) {
        mapFilters.locations = [JSON.stringify(location)]
        mapFilters.lastFilterApplied = 'location'
        // mapFilters.tolerance = simplifyTolerance
        mapFilters.mode = 'increaseFilter'
      } else {
        mapFilters.locations = []
        mapFilters.mode = 'resetFilter'
      }

      workerData.filters = mapFilters
      workerData.layers = JSON.parse(JSON.stringify($store.getters['app/layers']))
      context.emit('workerStartedIndexing')
      worker.postMessage(workerData)
    }

    // Called when date filter is requested
    async function filterDate (date) {
      // Just in case a Spiral is open
      spinner()

      spiralSource.value.source.clear()
      spiderfyCluster = false
      spiderfiedCluster = null
      closePopup()
      const workerData = {}
      if (!mapFilters.dates.length) {
        mapFilters.mode = 'increaseFilter'
      } else {
        mapFilters.mode = 'resetFilter'
      }
      mapFilters.lastFilterApplied = 'dates'
      if (date !== null) {
        mapFilters.dates = [date.data]
      } else {
        mapFilters.dates = []
      }
      $store.commit('app/setDefaultDates', mapFilters.dates)
      workerData.filters = mapFilters
      workerData.layers = JSON.parse(JSON.stringify($store.getters['app/layers']))

      const missing = getMissingYears(mapFilters.dates)
      if (missing.length) {
        await getDataset(missing)
        workerData.dataset = dataset
      }
      context.emit('workerStartedIndexing')
      worker.postMessage(workerData)
    }

    async function getDataset (missing) {
      mapFilters.mode = 'resetFilter'
      await Promise.all(missing.map(m =>
        fetch(backendUrl + 'api/get/data/' + m.year + '/', {
          credentials: 'include'
        }).then(resp => resp.json())
      )).then(jsons => {
        // Check for errors
        jsons.forEach(j => {
          if ('status' in j) {
            console.log(j.msg)
          } else {
            const y = j.year
            const index = YEARS.findIndex(element => {
              return element.year === y
            })
            // Check if there are any features for current year
            if (j.features.length) {
              // Get first feature date,
              if (j.features[0].properties.d < firstDate) {
                firstDate = j.features[0].properties.d
              }
              // Get last feature date
              if (j.features[j.features.length - 1].properties.d > lastDate) {
                lastDate = j.features[j.features.length - 1].properties.d
              }
              YEARS[index].data = JSON.parse(JSON.stringify(j.features))
              dataset = dataset.concat(j.features)
            }
          }
        })
      }).catch((error) => {
        dataset = []
        console.log(error)
      })
    }

    function getMissingYears (date) {
      let sYear, eYear
      const d = date[0]
      if (d.from === '') {
        // getAllDates = true
        sYear = YEARS[0].year
        eYear = YEARS[YEARS.length - 1].year
      } else {
        sYear = parseInt(d.from.substring(0, 4))
        eYear = parseInt(d.to.substring(0, 4))
      }

      const missing = YEARS.filter(set => {
        if ((set.year < sYear) || (set.year > eYear)) {
          return false
        } else {
          return Object.keys(set.data).length === 0
        }
      })
      return missing
    }

    // Called when hashrag filter is requested
    function filterTags (obj) {
      spinner()
      spiderfyCluster = false
      spiderfiedCluster = null
      spiralSource.value.source.clear()
      const tags = obj.tags
      const tag = obj.tag
      const workerData = {}
      workerData.layers = JSON.parse(JSON.stringify($store.getters['app/layers']))
      closePopup()
      // Check if tags start with ':'
      if (tag.startsWith(':')) {
        // This are not generic tags
        mapFilters.lastFilterApplied = 'reports'
        mapFilters.hashtags = []

        if (obj.mode === 'addedTag') {
          mapFilters.report_id = tags.map(t => {
            return t.substring(1)
          })

          mapFilters.mode = 'resetFilter'
          $store.commit('app/setFilteringTag', { value: true })

          const url = $store.getters['app/getBackend'] + 'api/get_reports/'
          const controller = new AbortController()
          const { signal } = controller
          fetch(`${url}`, {
            credentials: 'include',
            signal: signal,
            method: 'POST', // or 'PUT'
            body: JSON.stringify({ reports: mapFilters.report_id.join(',') })
          })
            .then(res => res.json())
            .then(res => {
              // Only one report. So no push into array
              mapFilters.featuresSet = [res]
              workerData.filters = mapFilters
              context.emit('workerStartedIndexing')
              worker.postMessage(workerData)
              $store.commit('app/setFilteringTag', { value: false })
            })
            .catch(e => {
              $store.commit('app/setFilteringTag', { value: false })
            })
        } else {
          mapFilters.report_id = tags.map(t => {
            return t.substring(1)
          })
          // If there are no more tags then reset filter, otherwise increse it
          if (tags.length) {
            mapFilters.mode = 'increaseFilter'
          } else {
            mapFilters.mode = 'resetFilter'
            mapFilters.featuresSet = []
          }
          workerData.filters = mapFilters
          context.emit('workerStartedIndexing')
          worker.postMessage(workerData)
        }
      } else {
        // IF NO TAGS SELECTED RESET SOME FILTERS
        if (!tags.length) {
          mapFilters.mode = 'resetFilter'
          mapFilters.featuresSet = []
          mapFilters.hashtags = []
          workerData.filters = mapFilters
          context.emit('workerStartedIndexing')
          worker.postMessage(workerData)
        } else {
          $store.commit('app/setFilteringTag', { value: true })

          const url = $store.getters['app/getBackend'] + 'api/get_hashtags/'
          const controller = new AbortController()
          const { signal } = controller
          const normalizeTags = tags.map(t => {
            return t.startsWith('#') ? t.slice(1) : t
          })
          mapFilters.hashtags = JSON.parse(JSON.stringify(normalizeTags))
          mapFilters.report_id = []
          mapFilters.lastFilterApplied = 'hashtags'
          fetch(`${url}`, {
            credentials: 'include',
            signal: signal,
            method: 'POST', // or 'PUT'
            body: JSON.stringify({ hashtags: mapFilters.hashtags.join(',') })
          })
            .then(res => res.json())
            .then(res => {
              // Only one report. So no push into array
              mapFilters.featuresSet = [res]
              mapFilters.mode = 'resetFilter'
              workerData.filters = mapFilters
              context.emit('workerStartedIndexing')
              worker.postMessage(workerData)
              $store.commit('app/setFilteringTag', { value: false })
            })
            .catch(e => {
              $store.commit('app/setFilteringTag', { value: false })
            })
        }
      }
    }

    // Get new url for sampling effort layer based on new map dates
    function refreshUserfixesUrl () {
      const sDate = mapFilters.dates[0].from.replaceAll('/', '-')
      const eDate = mapFilters.dates[0].to.replaceAll('/', '-')
      userfixesLayer.url = userfixesUrl + sDate + '/' + eDate
    }

    function resetUserfixesTileIndex () {
      userfixesLayer.tileIndex = null
    }

    // Update samplingeffort layer and redraw it
    function checkSamplingEffort (payload) {
      if (!payload.status) {
        $store.commit('app/setDefaultSamplingEffort', false)
        map.value.map.removeLayer(userfixesLayer.layer)
        return
      }
      $store.commit('app/setDefaultSamplingEffort', payload.status)
      let sDate, eDate
      if (payload.dates[0].from !== '') {
        sDate = moment(payload.dates[0].from).format('YYYY-MM-DD')
        eDate = moment(payload.dates[0].to).format('YYYY-MM-DD')
        userfixesLayer.url = userfixesUrl + sDate + '/' + eDate
      } else {
        userfixesLayer.url = userfixesUrl
      }

      $store.commit('map/setSamplingEffortLoading', { loading: true })
      userfixesLayer.refreshLayer()
    }

    const calendarClicked = function () {
      context.emit('calendarClicked', {})
    }

    function spinner (status = true) {
      $store.commit('app/setModal', {
        id: 'wait',
        content: {
          visibility: status,
          seamless: false
        }
      })
    }

    // Update chart data on store so it's ready when necessary
    function manageTimeSeries (data) {
      if ($store.getters['timeseries/getToggling'] || $store.getters['map/getLeftMenuToggling']) {
        // if graph is toggling, do not process graph
        return
      }
      if (data.dates) {
        const graphDates = data.dates
        const sDate = graphDates[0]
        const eDate = graphDates[graphDates.length - 1]
        const daysInRange = moment(eDate).diff(moment(sDate), 'days')
        $store.commit('timeseries/updateXUnits', daysInRange)
        if ($store.getters['timeseries/getGraphIsVisible']) {
          $store.commit('timeseries/updateDData', {
            data: data.data,
            dates: data.dates
          })
        } else {
          $store.commit('timeseries/updateCache', {
            data: data.data,
            dates: data.dates
          })
        }
      }
    }

    return {
      mobile,
      spinner,
      openDownloadModal,
      openReportsModal,
      calendarClicked,
      baseMap,
      handleDownload,
      shareView,
      newReport,
      mapFilters,
      toggleLeftDrawer,
      checkSamplingEffort,
      refreshUserfixesUrl,
      resetUserfixesTileIndex,
      leftDrawerIcon,
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
      selectedIcon,
      nPoints,
      mapDates,
      closePopup,
      foldingIcon,
      attrVisible,
      unfoldAttribution,
      setPendingView,
      graphVisible,
      fillLocationColor,
      strokeLocationColor,
      firstCall,
      preLoadView,
      initMap
    }
  }
})
</script>

<style scoped lang='scss'>

  #mapa {
    flex: 1;
    flex-shrink:1;
    flex-grow: 1;
    position: relative;
  }

  #mapa.mobile.small-size{
    // flex-grow:0;
    // flex:unset;
    // transition: all 1s;
  }
  :deep(.ol-reports.ol-control.ol-disabled),
  :deep(.ol-download.ol-control.ol-disabled) {
    opacity: 1;
    cursor: not-allowed;
  }

  :deep(.ol-reports.ol-control.ol-disabled) button,
  :deep(.ol-download.ol-control.ol-disabled) button {
    color: #7b7272;
    background: white;
    cursor:inherit;
  }
  :deep(.ol-reports) button i,
  :deep(.ol-download) button i {
    cursor:pointer;
  }
  :deep(.ol-reports){
    bottom: 130px;
  }
  :deep(.ol-download){
    bottom: 180px;
  }
  :deep(.ol-zoom) {
    bottom: 25px;
  }

  :deep(.ol-reports),
  :deep(.ol-download),
  :deep(.ol-zoom) {
    position: absolute;
    top: auto;
    right: 0.5em;
    left: auto;
    display: flex;
    flex-direction: column;
    background: none;
    z-index:20;
  }

  :deep(.ol-zoom) button,
  :deep(.ol-reports.ol-control) button,
  :deep(.ol-download.ol-control) button {
    font-weight: bold;
    background: $primary-button-background;
    color: white;
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

  :deep(.ol-reports.ol-control) button i,
  :deep(.ol-download.ol-control) button i{
    font-size: 0.8em;
  }

  :deep(.ol-reports) button:hover,
  :deep(.ol-download) button:hover,
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
    padding: 4px 10px;
    border-radius: 10px;
    height: 20px;
    line-height: 13px;
    display:inline-block;
  }

  :deep(.ol-attribution div){
    display:inline;
  }

  :deep(.ol-attribution.mobile.collapsed) .attr-folder{
    padding: 2px 4px;
  }

  :deep(.ol-attribution.mobile) .attr-folder{
    padding: 2px 4px 2px 10px;
  }

  :deep(.ol-attribution.mobile){
    background: #333333aa;
    z-index:900;
  }

  :deep(.ol-attribution.mobile.collapsed){
    padding: 4px 6px;
  }

  .unfold-attribution{
    cursor: pointer;
  }

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
    position: absolute;
    top: $header-height;
    z-index: 100;
    padding: 20px 5px;
    cursor: pointer;
    border-radius: 0 10px 10px 0;
  }
  .drawer-handler-mobile{
    background-color: $primary-color;
    color: white;
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 100;
    padding: 10px;
    cursor: pointer;
    border-radius: 50%;
  }
  .drawer-handler:hover,
  .drawer-handler-mobile:hover{
    background: $primary-button-background-hover;
    color: $primary-button-text-hover;
    box-shadow: 0 7px 14px rgba(0,0,0,0.25), 0 5px 5px rgba(0,0,0,0.22);
    transition: all .6s cubic-bezier(.25,.8,.25,1);
  }
</style>
