<template>

  <!-- MAP -->
  <ol-map ref='mapRef' class="absolute-full" :loadTilesWhileAnimating='true' :loadTilesWhileInteracting='true'>
    <ol-view :projection="projection" :constrainResolution='true' :maxZoom=24 :center="center" :zoom="localZoom"
      @change:center="setCenter($event.target.getCenter())" @change:resolution="zoom = $event.target.getZoom()" />

    <ol-tile-layer ref="basemapRef">
      <!-- <ol-source-osm :preload="Infinity" /> -->
      <ol-source-xyz :url="basemapLayerUrl" :preload="Infinity" :attributions-collapsible="false"
        attributions="© <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap </a> contributors, © <a href='https://carto.com/about-carto'>Carto</a>" />
    </ol-tile-layer>

    <slot></slot>

    <ol-tile-layer :visible="labelsLayerVisible" :z-index="10">
      <!-- <ol-source-osm :preload="Infinity" /> -->
      <ol-source-xyz :url="labelsLayerUrl" :preload="Infinity" :opaque="false" />
    </ol-tile-layer>

    <ol-zoom-control />
    <ol-scaleline-control :min-width="50" />
    <ol-fullscreen-control v-if="$q.platform.is.desktop" />
    <ol-toggle-control html="T" :className="`ol-toggle-label-layer${!labelsLayerVisible ? ' ol-disabled' : ''}`"
      title="Toggle place names" :onToggle="() => labelsLayerVisible = !labelsLayerVisible" />

    <q-img style='z-index: 1' class='absolute-bottom q-mb-sm mobile-only' position="calc(50% - 11px) center"
      fit='contain' src="/img/mosquitoalert_horizontal.png" height="30px" />

    <q-spinner v-if="showSpinner" style='z-index: 1' class="absolute-center" size="5em" :thickness="2"
      color="primary" />
  </ol-map>

</template>

<script lang="ts">

import { onMounted, ref, watch } from 'vue'

import { useRouteQuery } from '@vueuse/router'

import { toLonLat, fromLonLat } from 'ol/proj.js'
import Colorize from 'ol-ext/filter/Colorize'

import { useMapUiStore } from 'src/stores/mapUI';

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
    const mapUi = useMapUiStore();

    // Map
    const mapRef = ref()
    const basemapRef = ref()
    const projection = ref('EPSG:3857')

    const latitude = useRouteQuery('lat', '42', {
      transform: {
        get: (v: string) => Number(v),
        set: (v: number) => v.toFixed(5).toString()
      }
    })
    const longitude = useRouteQuery('lon', '0', {
      transform: {
        get: (v: string) => Number(v),
        set: (v: number) => v.toFixed(5).toString()
      }
    })
    const zoom = useRouteQuery('zoom', '4.00', {
      transform: {
        get: (v: string) => Number(v),
        set: (v: number) => v.toFixed(2).toString()
      }
    })
    const localZoom = ref(zoom.value)

    const showSpinner = ref(true)

    const center = ref(fromLonLat([longitude.value, latitude.value], projection.value))
    const setCenter = (value: [number, number]) => {
      const [lon, lat] = toLonLat(value, projection.value) as [number, number]
      longitude.value = lon
      latitude.value = lat
    }

    const grayscaleFilter = new Colorize({ operation: 'grayscale' });
    const labelsLayerVisible = ref(true);

    onMounted(() => {
      basemapRef.value.tileLayer.addFilter(grayscaleFilter);
      mapRef.value.map.on('loadstart', () => {
        showSpinner.value = true
      });
      mapRef.value.map.on('loadend', () => {
        showSpinner.value = false
      })
    });

    watch(
      () => mapUi.grayscaleBasemap,
      (newVal) => {
        grayscaleFilter.setActive(newVal)
      },
      { immediate: true }
    )

    return {
      mapRef,
      basemapRef,
      projection,
      center,
      setCenter,
      localZoom,
      zoom,
      showSpinner,
      labelsLayerVisible,
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

.ol-toggle-label-layer {
  top: unset;
  left: unset;
  bottom: 6em;
  right: .2em;
}

/* Button inside disabled div */
.ol-toggle-label-layer.ol-disabled button {
  /* gray button background */
  opacity: 0.8;
  background-color: #ccc;
  /* gray text */
  color: #666;
  /* optional border styling */
  border: 1px solid #999;
}

.ol-scale-line {
  right: 2.5em;
  line-height: .8em;
}
</style>
