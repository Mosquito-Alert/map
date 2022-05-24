<template>
  <div id='mapa' class='bg-white'>
    <ol-map ref='map'
            :loadTilesWhileAnimating='true'
            :loadTilesWhileInteracting='true'
            style="height: 400px">

        <ol-view ref='view'
            maxZoom="19"
            center="[13.6889, 44.8409]"
            zoom="5"
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

    </ol-map>
  </div>
</template>

<script>
import 'vue3-openlayers/dist/vue3-openlayers.css'
import { computed, ref, onMounted } from 'vue'
// import { defineComponent, computed, ref, onMounted, inject, watch } from 'vue'
import { useStore } from 'vuex'
// import Feature from 'ol/Feature'
// import Point from 'ol/geom/Point'
// import { Polygon, MultiPolygon, LineString } from 'ol/geom'
// import moment from 'moment'
// import { Circle, Fill, Stroke, Icon, Text } from 'ol/style'
import ReportView from '../js/ReportView'

export default {
  name: 'TheMapReport',
  props: ['report'],
  setup (props, context) {
    const $store = useStore()
    const map = ref()

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

    function handleReportView (view) {
      console.log(view)
    }

    return {
      reportId,
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
