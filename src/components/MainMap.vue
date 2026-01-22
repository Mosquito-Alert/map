<template>

  <!-- MAP -->
  <ol-map ref='mapRef' class="absolute-full" :loadTilesWhileAnimating='true' :loadTilesWhileInteracting='true'
    @moveend="updateRoute">
    <ol-view :projection="projection" :constrainResolution='true' :maxZoom=17 :center="center" :zoom="zoom" />

    <ol-tile-layer>
      <!-- <ol-source-osm :preload="Infinity" /> -->
      <ol-source-xyz :url="basemapLayerUrl" :preload="Infinity" :attributions-collapsible="false"
        attributions="© <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap </a> contributors, © <a href='https://carto.com/about-carto'>Carto</a>" />
    </ol-tile-layer>

    <slot></slot>

    <ol-tile-layer :z-index="10">
      <!-- <ol-source-osm :preload="Infinity" /> -->
      <ol-source-xyz :url="labelsLayerUrl" :preload="Infinity" :opaque="false" />
    </ol-tile-layer>

    <ol-zoom-control />
    <ol-scaleline-control :min-width="50" />
    <ol-fullscreen-control v-if="$q.platform.is.desktop" />

    <q-img style='z-index: 1' class='absolute-bottom q-mb-sm mobile-only' position="calc(50% - 11px) center"
      fit='contain' src="img/mosquitoalert_horizontal.png" height="30px" />
  </ol-map>

</template>

<script lang="ts">

import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { toLonLat, fromLonLat } from 'ol/proj.js'

export default {
  props: {
    basemapLayerUrl: {
      type: String,
      default: "https://basemaps.cartocdn.com/rastertiles/voyager_no_labels_no_buildings/{z}/{x}/{y}.png"
    },
    labelsLayerUrl: {
      type: String,
      default: "https://basemaps.cartocdn.com/rastertiles/light_only_labels/{z}/{x}/{y}.png"
    },
  },
  setup() {

    const route = useRoute()
    const router = useRouter()

    // Map
    const mapRef = ref()
    const projection = ref('EPSG:3857')

    const center = ref(
      fromLonLat(
        [parseFloat(String(route.query?.lon ?? 0)), parseFloat(String(route.query?.lat ?? 0))],
        projection.value
      )
    )
    const zoom = ref(parseFloat(String(route.query.zoom || 0)))
    return {
      mapRef,
      projection,
      center,
      zoom,
      async updateRoute() {
        const center = toLonLat(
          mapRef.value.map.getView().getCenter(),
          mapRef.value.map.getView().getProjection()
        )

        await router.push({
          ...route,
          // params: {
          //   ...route.params
          // },
          query: {
            ...route.query,
            lon: center[0]?.toFixed(5),
            lat: center[1]?.toFixed(5),
            zoom: mapRef.value.map.getView().getZoom().toFixed(2)
          }
        })
      },
      updateSize() {
        mapRef.value.updateSize()
      }
    }
  }
}
</script>

<style lang="scss">
.ol-control,
.ol-control:hover,
.ol-control:focus {
  background-color: transparent;
  border-radius: .3em !important;
}

.ol-control button {
  font-size: 1.2em;
  font-weight: 400;
  background-color: var(--q-primary);
  color: white;
  pointer-events: auto;
  cursor: pointer !important;
  border-radius: inherit !important;
}

.ol-control button:not(:last-child) {
  margin-bottom: .1em;
}

.ol-control button:hover,
.ol-control button:focus {
  background-color: var(--q-primary);
  color: white;
  outline: none;
  filter: brightness(105%);
}

.ol-attribution:not(.ol-collapsed),
.ol-scale-line {
  background: $grey-4;
}

.ol-attribution ul,
.ol-scale-line-inner {
  color: $grey-14;
  border-color: $grey-14 !important;
  font-size: .65em !important;
}

.ol-attribution a {
  color: #369;
}

// .ol-scale-line,
// .ol-attribution {
//   border-style: solid;
//   border-width: 1px;
//   border-color: $grey-5;
// }

.ol-scale-line,
.ol-zoom {
  top: unset;
  left: unset;
  bottom: 2em;
  right: .2em;
}

.ol-scale-line {
  right: 2.5em;
  line-height: .8em;
}
</style>
