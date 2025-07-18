<!--
  MAP COMPONENT FOR REPORTS
-->

<template>
  <q-layout>
    <q-page-container>
      <!-- REFERENCE MAP -->
      <div class="reference-map row">
        <div class="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-md-1"></div>
        <div class="col-xl-5 col-lg-5 col-md-5 col-xs-12 col-sm-5 col-md-6">
          <h5 class="title"> {{ trans('List of observations') }} </h5>
          <img style="width:100%" id="c-mapa" />
          <div id='mapa' class='bg-white'>
            <ol-map ref='map'
                    :loadTilesWhileAnimating='true'
                    :loadTilesWhileInteracting='true'
                    style="position: relative; height: 300px; display: width:100%">

                <ol-view ref='view'
                    :maxZoom=19
                    :maxResolution=39135.75848201024
                    :constrainResolution=true />

                <div class="ol-attribution">
                  © <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap </a> contributors, © <a href='https://carto.com/about-carto'>Carto</a>
                  | <a href="https://openlayers.org" target="_blank">OpenLayers</a>
                </div>
                <!-- base map -->
                <ol-tile-layer ref='baseMap' title='mapbox' :zIndex=0>
                  <ol-source-xyz url='https://basemaps.cartocdn.com/rastertiles/voyager_no_buildings/{z}/{x}/{y}.png' :preload="Infinity"/>
                </ol-tile-layer>

                <!-- CLUSTERS geojson layer -->
                <ol-vector-layer ref='observationsLayer' name="observationsLayer" :zIndex=10>
                  <ol-source-vector :features='features' :format='geoJson' ref='observationsSource'>
                    <ol-style :overrideStyleFunction="styleFunction">
                    </ol-style>
                  </ol-source-vector>
                </ol-vector-layer>

            </ol-map>
          </div>
        </div>

        <div class="report-filters col-3 col-md-4 col-xs-12 col-sm-5">
          <h6> {{ trans('Selected observations') }} </h6>
          <div class="observations">
            <ul class="ul-filters">
              <li v-html="trans(name)" v-for="name, index in observationNames" :key="index">
              </li>
            </ul>
          </div>

          <h6 v-if="anyFilters"> {{ trans('Filters applied') }} </h6>
          <div class="filters">
            <div>
              <span v-if="dateFrom" v-html="dateRange"></span>
              <span v-else v-html="trans('All years and all months')"></span>
            </div>

            <div class="dates" v-if="locationName">
              <span>{{ locationName }}</span>
            </div>

            <div class="hashtags" v-if="filters.hashtags">
              <span v-html="tag" v-for="tag, index in filters.hashtags" :key="index">
              </span>
            </div>

            <div class="report-tag" v-if="filters.report_id">
              <span v-html="tag" v-for="tag, index in filters.report_id" :key="index">
              </span>
            </div>
          </div>
        </div>
        <div class="col-2 col-sm-1 col-md-1"></div>
      </div>

      <!-- OBSERVATIONS LIST -->
      <div class="row" v-for="feature, index in featuresGeoJson" :key="index">
        <div class="col-xl-2 col-lg-2 col-md-2 col-sm-12 col-xs-12"></div>
        <div class="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-xs-12">
         <div
          class="row observation-box"
          :class="mobile?'mobile':''"
         >
            <!-- FIRST ROW. IMAGES -->
            <div class="q-px-lg q-col-xl-2 col-lg-2 col-md-2 col-sm-1 col-xm-12"></div>
            <div class="observation-map-container q-mb-md col-xl-4 col-lg-4 col-md-4 col-sm-5 col-xs-12">
              <div class="observation-map">
                <img :id="'mapa_' + index" />
              </div>
              <div :id="'mapa_' + index" class="map-container">
                <one-feature-map
                  :mapId="'mapa_' + index"
                  toCanvas='true'
                  height="250px"
                  width="90%"
                  :featContent="feature">
                </one-feature-map>
              </div>
            </div>

            <div class="observation-img q-col-xl-4 col-lg-4 col-md-4 col-sm-5 col-xm-12">
              <div v-if="feature.photo_url">
                <img
                  class="photo"
                  :src="feature.photo_url"
                  @load="imageLoaded"
                  @error="errorLoading"
                >
              </div>
              <div v-if="!errorLoadingImage && feature.photo_url" class="credits">
                {{ trans('Anonymous')}},
                <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank">CC BY-SA 4.0</a> Mosquito Alert
              </div>
            </div>
            <div class="q-col-xl-2 col-lg-2 col-md-2 col-sm-1 col-xm-12"></div>

            <!-- SECOND ROW -->
            <div class="second-row q-px-xl col-xl-12 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <div class="q-pb-lg flex">
                  <span class="counter">{{ index + 1 }}</span>
                  <div class="report-names q-pt-sm">
                    <span class="common-name" v-html="trans(feature.title)"></span>
                    <span class="latin-name" v-html="trans(feature.latinName)"></span>
                  </div>
              </div>
              <div :class="mobile?'q-mx-lg':'q-ml-xl'">
                <div class="report-id-wrapper" v-if="feature.reportId">
                    <div><i class="fa-solid fa-hashtag"></i></div>
                    <div><span class="reportId">Id</span>:
                      {{ feature.reportId }}
                    </div>
                </div>
                <!-- THIS ATTRIBUTE IS JUST FOR BITES -->
                <div class="description-wrapper" v-if="feature.howMany">
                    <div><i class="fa-solid fa-child-reaching"></i></div>
                    <div><span class="how-many-bites">{{ trans('How many bites') }}</span>:
                      {{ trans(feature.howMany) }}
                    </div>
                </div>
                <div class="description-wrapper" v-if="feature.location">
                    <div><i class="fa-solid fa-location-dot"></i></div>
                    <div><span class="bite-location">{{ trans('Bite location') }}</span>:
                      {{ trans(feature.location) }}
                    </div>
                </div>
                <div class="date-wrapper">
                    <div><i class="fa-solid fa-calendar-days"></i></div>
                    <div>
                        <span class="date">{{ trans('Date') }}</span>:
                        {{ formatData(feature) }}
                      <span class="bite-time" v-if="feature.biteTime">
                        | {{ trans(feature.biteTime) }}
                      </span>
                    </div>
                </div>
                <!--IF SITES, THEN SHOW OTHER ATTRIBUTES -->
                <div class="description-wrapper" v-if="feature.withWater">
                    <div><i class="fa-solid fa-droplet"></i></div>
                    <div><span class="water-status">{{ trans('Breeding site with water') }}</span>
                      {{ trans(feature.withWater) }}
                    </div>
                </div>
                <div class="description-wrapper" v-if="feature.withLarva">
                    <div><i class="fa-solid fa-worm"></i></div>
                    <div><span class="with-larva">{{ trans('Breeding site with larva') }}</span>
                      {{ trans(feature.withLarva) }}
                    </div>
                </div>
                <div class="date-wrapper" v-if="feature.note">
                    <div><i class="fa-regular fa-message"></i></div>
                    <div>
                      <span class="date">{{ trans('Citizen note') }}</span>:
                      {{ feature.note }}
                    </div>
                </div>
                <!-- THIS ATTRIBUTE ONLY FOR ADULTS -->
                <div class="description-wrapper" v-if="feature.edited_user_notes && feature.type=='adult'">
                    <div><i class="fa-solid fa-message-check"></i></div>
                    <div><span class="description">{{ trans('Expert note') }}</span>:
                      {{ feature.edited_user_notes }}
                    </div>
                </div>
                <div class="description-wrapper" v-if="feature.lat && feature.lon">
                    <div><i class="fa-solid fa-location-check"></i></div>
                    <div><span class="description">{{ trans('Coordinates (latitud, longitud)') }}</span>:
                      {{ feature.lat.toFixed(6) }}, {{ feature.lon.toFixed(6) }}
                    </div>
                </div>
                <div class="description-wrapper" v-if="feature.version_uuid">
                    <div><i class="fa-solid fa-eye"></i></div>
                    <div><span class="description">{{ trans('Observation code') }}</span>:
                      {{ feature.version_uuid }}
                    </div>
                </div>
                <!-- only adults have validation  -->
                <div class="q-py-xl validation-box" v-if="feature.type === 'adult'">
                  <div class="logo" :class="getValidationClass(feature)">
                    <i :class="getValidationIcon(feature)"></i>
                  </div>
                  <div class="text validation-string">
                    <div>{{ getValidationTypeTitle(feature) }}</div>
                    <span
                      v-if="feature.validation_type==='human' &&
                            feature.validation"
                    >
                      {{ trans(feature.validation) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-2 col-lg-2 col-md-2 col-sm-12 col-xs-12"></div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script>
import OneFeatureMap from 'components/OneFeatureMap.vue'
import 'vue3-openlayers/dist/vue3-openlayers.css'
import { computed, ref, onMounted, inject } from 'vue'
import { transform, transformExtent } from 'ol/proj.js'
import AdministrativeLayer from '../js/AdministrativeLayer'
import FormatObservation from '../js/FormatObservation'
import { useStore } from 'vuex'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { Polygon, MultiPolygon } from 'ol/geom'
import moment from 'moment'
import { Circle, Fill, Stroke, Icon, Text } from 'ol/style'
import ReportView from '../js/ReportView'
import MapToCanvas from '../js/MapToCanvas'
import { useQuasar } from 'quasar'
import MSession from '../js/session.js'
import { observations as privateLayers } from '../store/app/privateTOC'
import { StatusCodes as STATUS_CODES } from 'http-status-codes'
import axios from 'axios'

export default {
  name: 'TheMapReport',
  props: ['report', 'reportLang'],
  components: { OneFeatureMap },
  setup (props, context) {
    let mySession
    let privateReport
    const $store = useStore()
    const map = ref()
    const center = ref()
    const zoom = ref()
    const baseMap = ref()
    const filters = ref({})
    const dateFrom = ref()
    const dateRange = ref()
    const errorLoadingImage = ref(false)
    const locationName = ref()
    const hashtags = ref()
    const filterId = ref()
    const features = ref([])
    const featuresGeoJson = ref([])
    const observationNames = ref([])
    const format = inject('ol-format')
    const geoJson = new format.GeoJSON()
    const worker = new Worker('TheReportWorker.js')
    let administrativeLayer

    const anyFilters = ref(false)
    const $q = useQuasar()
    const backendUrl = $store.getters['app/getBackend']

    const reportId = computed(() => {
      return (props.report)
    })

    const reportLang = computed(() => {
      return (props.reportLang)
    })

    const setLanguage = (lang) => {
      $store.dispatch('app/setInitData', lang)
      // NASTY
      let qLang = lang
      if (lang === 'en') qLang = 'en-US'
      import('quasar/lang/' + qLang).then(({ default: messages }) => {
        $q.lang.set(messages)
      })
    }

    function initLanguage (lang) {
      setLanguage(lang)
    }

    function loadReport () {
      $store.commit('app/setCsrfToken', mySession.csrfToken)
      const ol = map.value.map
      const loadViewUrl = backendUrl + 'report/load/'
      const newView = new ReportView(ol, {
        url: loadViewUrl + reportId.value + '/',
        csrfToken: mySession.csrfToken
      })

      newView.load(handleReportView)
    }
    onMounted(function () {
      // Get report view data
      const mCanvas = new MapToCanvas({ map: map.value.map })
      map.value.map.on('rendercomplete', function (e) {
        document.getElementById('c-mapa').src = mCanvas.doCanvas()
        if (document.getElementById('mapa')) {
          document.getElementById('mapa').remove()
        }
      })
      const csrfToken = $store.getters['app/getCsrfToken']
      mySession = new MSession(backendUrl, csrfToken)
      mySession.getSession(loadReport)
    })

    function getObservationsToLoadOnMap (viewObservations, privateReport) {
      const possibles = $store.getters['app/getPossibleCategories']
      const observations = []
      const codes = []
      const appLayers = JSON.parse(JSON.stringify($store.getters['app/getLayers']))
      viewObservations.forEach(layerFilter => {
        // If user authorized add all _probable layers, otherwise remove _probable layers
        if ($store.getters['app/getAuthorized']) {
          if (!privateReport && possibles.includes(layerFilter.code)) {
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

    function cloneJson (j) {
      return JSON.parse(JSON.stringify(j))
    }

    function handleReportView (report) {
      if (report.status !== STATUS_CODES.OK) {
        $store.commit('app/setModal', {
          id: 'error',
          content: {
            visibility: true,
            msg: report.msg,
            redirection: true
          }
        })
      } else {
        if ($store.getters['app/getAuthorized']) {
          $store.commit('app/setLayers', privateLayers)
        }
        anyFilters.value = false
        privateReport = report.privateReport
        const view = JSON.parse(report.view[0].view)
        let lang
        if (reportLang.value) {
          lang = reportLang.value.toLowerCase()
        } else {
          lang = view.lang ? view.lang : $store.getters['app/getLang']
        }
        initLanguage(lang)
        center.value = view.center
        zoom.value = view.zoom
        filters.value = JSON.parse(JSON.stringify(view.filters))

        const reportObservations = cloneJson(view.filters.observations)

        view.filters.observations = getObservationsToLoadOnMap(reportObservations, privateReport)
        const layers = $store.getters['app/getLayers']
        // Get names from filter.observations
        observationNames.value = view.filters.observations.map(o => {
          return layers[o.type][o.code].common_name
        })

        // Format dates to display
        if (view.filters.dates.length) {
          anyFilters.value = true
          const d = view.filters.dates[0]
          if (d.from === '') {
            dateRange.value = ''
          } else {
            dateFrom.value = moment(d.from).format('DD/MM/YYYY')
            dateRange.value = moment(d.from).format('DD-MM-YYYY')
            dateRange.value += ' - ' + moment(d.to).format('DD/MM/YYYY')
          }
        }

        if ('locationName' in view) {
          anyFilters.value = true
          locationName.value = ('locationName' in view) ? view.locationName : ''
        }
        if (view.filters.hashtags.length) {
          anyFilters.value = true
          hashtags.value = view.filters.hastags
        }
        if (view.filters.report_id.length) {
          anyFilters.value = true
          filterId.value = view.filters.filter_id
        }
        map.value.map.getView().fit(
          view.extent, { nearest: true }
        )

        // Get features as geoJson
        const reportFilters = formatParams(view)
        const url = backendUrl + 'downloads/features/'

        axios(url, {
          withCredentials: true,
          method: 'POST', // or 'PUT'
          data: JSON.stringify(reportFilters),
          headers: {
            'X-CSRFToken': mySession.csrfToken
          }
        })
          .then(resp => {
            if (resp.status !== STATUS_CODES.OK) {
              console.log(resp.status)
              return
            }
            const titles = $store.getters['map/getTitles']
            const latinNames = $store.getters['map/getLatinNames']
            const formated = resp.data.map(e => {
              return new FormatObservation(e, titles, latinNames).format()
            })

            featuresGeoJson.value = formated
            const bounds = view.extent
            // Check if administrative layer is on
            if (view.filters.locations.length) {
              let Feat = null
              const f = JSON.parse(view.filters.locations[0])
              const geomType = f.features[0].geometry.type
              if (geomType.toLowerCase() === 'polygon') {
                Feat = new Feature({
                  geometry: new Polygon(f.features[0].geometry.coordinates)
                })
              } else if (geomType.toLowerCase() === 'multipolygon') {
                Feat = new Feature({
                  geometry: new MultiPolygon(f.features[0].geometry.coordinates)
                })
              }
              Feat.setGeometry(Feat.getGeometry().transform('EPSG:4326', 'EPSG:3857'))
              const defaults = JSON.parse(JSON.stringify($store.getters['app/getDefaults']))
              const ZIndex = parseInt(baseMap.value.tileLayer.values_.zIndex) + 1
              const fillLocationColor = defaults.fillLocationColor
              const strokeLocationColor = defaults.strokeLocationColor
              administrativeLayer = new AdministrativeLayer(map.value.map, fillLocationColor, strokeLocationColor, (ZIndex + 1))
              const writer = new format.GeoJSON()
              const json = JSON.parse(writer.writeFeatures([Feat], {
                dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'
              }))
              administrativeLayer.refreshLayer(json)
            }
            const southWest = transform([bounds[0], bounds[1]], 'EPSG:3857', 'EPSG:4326')
            const northEast = transform([bounds[2], bounds[3]], 'EPSG:3857', 'EPSG:4326')

            worker.postMessage({
              bbox: southWest.concat(northEast),
              zoom: map.value.map.getView().getZoom(),
              features: resp.data
            })
          })
      }
    }

    worker.onmessage = function (data) {
      const mapFeatures = data.data.map.map(f => {
        return new Feature({
          geometry: new Point(transform(f.geometry.coordinates, 'EPSG:4326', 'EPSG:3857')),
          properties: f.properties,
          id: f.id
        })
      })
      features.value = mapFeatures
    }

    // Function to style all clusters and observations
    const styleFunction = (feature, style) => {
      if ('point_count' in feature.values_.properties && feature.values_.properties.point_count > 1) {
        const size = feature.values_.properties.point_count
        let radius = 0
        if (size < 100) radius = 12
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

    function formatParams (view) {
      const params = {
        bbox: transformExtent(view.extent, 'EPSG:3857', 'EPSG:4326'),
        date: view.filters.dates
      }

      const viewLayers = []
      const storeLayers = $store.getters['app/getLayers']

      view.filters.observations.forEach(o => {
        const categories = storeLayers[o.type][o.code].categories
        categories.forEach(c => {
          viewLayers.push(c)
        })
      })

      params.observations = viewLayers

      if (view.filters.dates.length) {
        params.date = view.filters.dates
      }

      if (view.filters.report_id.length) {
        params.report_id = view.filters.report_id
      }

      if (view.filters.hashtags.length) {
        params.hashtags = JSON.stringify(view.filters.hashtags)
      }

      if (view.filters.locations.length) {
        params.location = JSON.stringify(JSON.parse(view.filters.locations[0]).features[0].geometry)
      }

      return params
    }

    const trans = function (text) {
      return $store.getters['app/getText'](text)
    }

    const formatData = function (feature) {
      // Some locales add '.' after month, so we remove it
      if (feature.biteTime) {
        return moment(feature.observation_date).format('lll')
      } else {
        return moment(feature.observation_date).format('DD/MM/YYYY').replace('.', '')
      }
    }

    const errorLoading = function () {
      errorLoadingImage.value = true
    }

    const getValidationIcon = function (feature) {
      if (feature.validation_type === 'human') return 'fa-light fa-users'
      if (feature.validation_type === 'ai') return 'fa-light fa-robot'
      return ''
    }

    const getValidationClass = feature => {
      if (feature.validation_type === 'ai') return 'validation ai'
      if (feature.validation === 'Confirmed') return 'validation confirmed'
      else return 'validation probable'
    }

    const getValidationTypeTitle = function (feature) {
      if (feature.validation_type === 'human') return trans('Expert validation')
      if (feature.validation_type === 'ai') return trans('AI validation')
      return ''
    }

    const mobile = computed(() => {
      return $store.getters['app/getIsMobile']
    })

    return {
      trans,
      mobile,
      errorLoading,
      getValidationClass,
      getValidationIcon,
      getValidationTypeTitle,
      formatData,
      center,
      zoom,
      features,
      featuresGeoJson,
      baseMap,
      geoJson,
      locationName,
      filters,
      styleFunction,
      observationNames,
      map,
      dateFrom,
      dateRange,
      anyFilters,
      hashtags,
      filterId,
      reportId
    }
  }
}
</script>

<style lang="scss">
h5, h6{
  margin: 5px 15px;
}

.ol-attribution{
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

.filters{
  display: flex;
  flex-wrap: wrap
}

.hashtags span,
.filters div {
  margin: 5px;
}

.ul-filters{
    list-style: none;
    padding: 0px;
}

.ul-filters li{
  margin: 3px 10px;
  display: inline-block;
}

.ul-filters li,
.filters span {
  padding: 2px 10px;
  border-radius: 10px;
  background-color: $primary-color;
}

.observation-box{
  margin: 10px;
  display: flex;
  flex-grow: 1;
  // flex-wrap: wrap;
  box-shadow: $box-shadow;
}

.observation-info{
  display:flex;
  // flex-wrap: wrap;
  flex-grow: 1;
}

.observation-box img.photo{
  max-width: 250px;
  max-height: 250px;
}

.observation-info {
  padding: 25px;
}

.counter {
  padding: 10px 15px;
  margin-right: 10px;
  background-color: $primary-color;
  color: white;
}

.report-id-wrapper,
.date-wrapper,
.description-wrapper{
  display:flex;
  flex-direction:row;
  margin-top:10px;
}
.report-id-wrapper div:first-child,
.date-wrapper div:first-child,
.description-wrapper div:first-child{
  margin-right:10px;
  font-weight: bold;
}

.report-id-wrapper span,
.date-wrapper span,
.description-wrapper span{
  font-weight: bold;
}
.date-wrapper span.bite-time{
  font-weight:normal;
}

.reference-map{
  // display: flex;
  padding-left: 10px;
}

.q-page-container{
  padding: 20px;
  display:flex;
  flex-direction: column;
}

.report-filters{
  padding-left: 30px;
  font-size:0.9em;
}

.credits{
  position: relative;
  bottom: 5px;
  right: 5px;
  padding:3px;
  background: transparent;
  border-radius: 10px;
  text-align: center;
  font-size:0.8em;
  color: black;
  &>a {
    color: #3498DB;
    text-decoration: none;
    &:hover{
      text-decoration: underline;
    }
  }
}

.validation {
    height: 40px;
    width: 40px;
    border-radius: 50%;
    color: white;
    &.confirmed {
      background: #22a973;
    }
    &.probable {
      background: #8fd3b8;
    }
    &.ai {
      background: #9d6466;
    }
    i {
      height: 40px;
      width: 40px;
      font-size: 1.5em;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      .fa-check {
        background: #f6db63;
        color: white;
        border-radius: 50%;
        height: 20px;
        width: 20px;
        font-size: 0.3em;
        font-weight: bold;
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        bottom: 0;
        right: 0;
        &::before {
          position: relative;
          top: 1px;
        }
      }
    }
}

.validation-box{
  display:flex;
  flex-direction: raw;
  padding-top: 20px;
}

.validation-string {
  flex-grow: 1px;
  margin-left: 10px;
}
.validation-string div{
  margin-left: 10x;
  font-weight: 600;
}
.report-names{
  flex-grow: 1;
  border-bottom: 1px solid #ccc;
}

.observation-img img{
  width: 100%;
  max-width: 250px;
  max-height: 250px;
  text-align:center;
}
.observation-map,
.observation-img{
  padding-top: 40px;
}
.observation-box.mobile .observation-map-container{
  text-align: center;
}
.observation-box.mobile .second-row{
  padding: 0px 5px;
}
.observation-box.mobile .observation-img{
  margin:auto;
}
.common-name{
  font-weight: bold;
}
.common-name::after{
  content: '|';
  margin:0px 5px;
}
.q-btn.ma-btn span{
  line-height: unset;
}
@media print {
  /* Contenido del fichero print.css */
}
</style>
