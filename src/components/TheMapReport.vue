<template>
  <div id='mapa' class='bg-white'>
    <ol-map ref='map'
            :loadTilesWhileAnimating='true'
            :loadTilesWhileInteracting='true'
            style="height: 400px; width: 400px">

        <ol-view ref='view'
            maxZoom="19"
            constrainResolution='true' />

        <div class="ol-attribution">
          © <a href="https://www.openstreetmap.org/copyright/" target="_blank">OpenStreetMap</a> contributors
          | © <a href="https://mapbox.com" target="_blank">Mapbox</a>
          | <a href="https://openlayers.org" target="_blank">OpenLayers</a>
        </div>
        <!-- base map -->
        <ol-tile-layer ref='baseMap' title='mapbox' zIndex="0">
          <ol-source-osm />
        </ol-tile-layer>

        <!-- CLUSTERS geojson layer -->
        <ol-vector-layer ref='observationsLayer' name="observationsLayer" zIndex="10">
          <ol-source-vector :features='features' :format='geoJson' ref='observationsSource'>
            <ol-style :overrideStyleFunction="styleFunction">
            </ol-style>
          </ol-source-vector>
        </ol-vector-layer>

    </ol-map>
  </div>
  <div class="filters">
    <div class="observations">
      <ul v-for="observation, code in filters.observations" :key="code" >
        <li>
          {{ observation.code }}
        </li>
      </ul>
    </div>

    <div class="dates">
      <span>{{ filters.dates }}</span>
    </div>

    <div class="dates" v-if="locationName">
      <span>{{ locationName }}</span>
    </div>

    <div class="dates" v-if="filters.hashtags">
      <span>{{ filters.hashtags }}</span>
    </div>
  </div>
</template>

<script>
import 'vue3-openlayers/dist/vue3-openlayers.css'
import { computed, ref, onMounted, inject } from 'vue'
import { transform, transformExtent } from 'ol/proj.js'
// import { defineComponent, computed, ref, onMounted, inject, watch } from 'vue'
import { useStore } from 'vuex'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
// import { Polygon, MultiPolygon, LineString } from 'ol/geom'
// import moment from 'moment'
import { Circle, Fill, Stroke, Icon, Text } from 'ol/style'
import ReportView from '../js/ReportView'

export default {
  name: 'TheMapReport',
  props: ['report'],
  setup (props, context) {
    const $store = useStore()
    const map = ref()
    const center = ref()
    const zoom = ref()
    const filters = ref({})
    const locationName = ref()
    const features = ref([])
    const format = inject('ol-format')
    const geoJson = new format.GeoJSON()
    const worker = new Worker('TheReportWorker.js')

    const reportId = computed(() => {
      return (props.report)
    })

    onMounted(function () {
      // Fetch report view data
      const ol = map.value.map
      const backendUrl = $store.getters['app/getBackend']
      const loadViewUrl = backendUrl + 'api/report/load/'

      const newView = new ReportView(ol, {
        url: loadViewUrl + reportId.value
      })

      newView.load(handleReportView)
    })

    function handleReportView (report) {
      if (report.status === 'ok') {
        const view = JSON.parse(report.view[0].view)
        center.value = view.center
        zoom.value = view.zoom
        filters.value = JSON.parse(JSON.stringify(view.filters))

        locationName.value = ('locationName' in view) ? view.locationName : ''
        map.value.map.getView().fit(
          view.extent, { nearest: true }
        )

        // Get features as geoJson
        const reportFilters = formatParams(view)

        const backendUrl = $store.getters['app/getBackend']
        const url = backendUrl + 'api/downloads/features/'

        fetch(url, {
          method: 'POST', // or 'PUT'
          body: JSON.stringify(reportFilters),
          headers: {
            'Content-Type': 'application/force-download'
          }
        })
          .then(res => res.json())
          .then(featuresGeoJson => {
            const bounds = view.extent
            const southWest = transform([bounds[0], bounds[1]], 'EPSG:3857', 'EPSG:4326')
            const northEast = transform([bounds[2], bounds[3]], 'EPSG:3857', 'EPSG:4326')

            worker.postMessage({
              bbox: southWest.concat(northEast),
              zoom: map.value.map.getView().getZoom(),
              features: featuresGeoJson
            })
          }).catch((error) => {
            console.log(error)
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
          font: 'bold 12px Roboto',
          text: size.toLocaleString(),
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

    return {
      center,
      zoom,
      features,
      geoJson,
      locationName,
      filters,
      reportId,
      styleFunction,
      map
    }
  }
}
</script>

<style scoped lang="scss">
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
</style>
