<template>
  <Teleport v-if="!!boundaryStore.getPolygon" defer to=".ol-overlaycontainer-stopevent">
    <q-chip :model-value="!!boundaryStore.getPolygon" removable clickable class="ol-search all-pointer-events"
      color="primary" text-color="white" icon="location_on" :label="boundaryStore.getBoundaryName || ''"
      @remove="boundaryStore.setPolygon(null)" />
  </Teleport>

  <ol-vector-layer :visible="true" :opacity="1">
    <ol-source-vector>
      <ol-feature v-if="!!boundaryStore.getPolygon">
        <component :is="geometryComponent" :coordinates="boundaryStore.getPolygon.getCoordinates()" />
        <ol-style>
          <ol-style-stroke :color="colors.getPaletteColor('primary')" :width="2" />
          <ol-style-fill :color="colors.getPaletteColor('primary') + '33'" />
        </ol-style>
      </ol-feature>
    </ol-source-vector>
  </ol-vector-layer>
</template>

<script setup lang="ts">
import { colors } from 'quasar'
import { computed, watch, onMounted, onUnmounted, inject } from 'vue'

import { useRouteQuery } from '@vueuse/router';
import { useI18n } from 'vue-i18n';

import type Map from "ol/Map";
import GeoJSON from 'ol/format/GeoJSON'
import Polygon from 'ol/geom/Polygon';
import MultiPolygon from 'ol/geom/MultiPolygon';
import SearchNominatim from 'ol-ext/control/SearchNominatim'
import type { SearchEvent } from 'ol-ext/control/Search';

import { useBoundaryStore } from 'src/stores/boundaryStore';

const { t, locale } = useI18n();
const boundaryStore = useBoundaryStore();

const map = inject<Map>("map")

const nominatimPlaceId = useRouteQuery('place_id', '', { transform: Number })

const geometryComponent = computed(() => {
  if (boundaryStore.getPolygon instanceof Polygon) return 'ol-geom-polygon';
  if (boundaryStore.getPolygon instanceof MultiPolygon) return 'ol-geom-multi-polygon';
  return null; // fallback if needed
});

const geoJson = new GeoJSON()
const searchControl = new SearchNominatim({
  polygon: true,
  maxItems: 10,
  maxHistory: -1,
  title: t('search'),
  placeholder: t('search') + '...',
  typing: 500,
  collapsed: false,
  noCollapse: true,
  zoomOnSelect: 11,
  onselect: (e: SearchEvent) => {
    const geometry = geoJson.readGeometry(
      e.search.geojson,
      {
        dataProjection: 'EPSG:4326',
        featureProjection: map!.getView().getProjection()
      }
    );
    boundaryStore.setPolygon(
      geometry as Polygon | MultiPolygon,
      map!.getView().getProjection(),
      e.search.name
    );
    nominatimPlaceId.value = e.search.place_id.toString();
  }
})
// Disable attribution copy
searchControl.set('copy', '')
// Overwrite requestData to add 'accept-language' header.
// See: https://github.com/Viglino/ol-ext/issues/559
searchControl.requestData = function (s) {
  const data = SearchNominatim.prototype.requestData.call(this, s);
  data['accept-language'] = locale.value;
  data['polygon_threshold'] = 0.001;
  return data
}

watch(() => boundaryStore.getPolygon, (newValue) => {
  if (!newValue) {
    map?.addControl(searchControl)
  } else {
    map?.removeControl(searchControl)
  }
});

onMounted(async () => {
  map?.addControl(searchControl)

  if (nominatimPlaceId.value) {
    const url = new URL('https://nominatim.openstreetmap.org/details.php')
    const urlparams = new URLSearchParams({
      place_id: nominatimPlaceId.value.toString(),
      polygon_geojson: '1',
      'accept-language': locale.value,
      polygon_threshold: '0.001'
    })
    url.search = urlparams.toString()
    await fetch(url.toString()).then(res => res.json()).then(data => {
      const geometry = geoJson.readGeometry(
        data.geometry,
        {
          dataProjection: 'EPSG:4326',
          featureProjection: map!.getView().getProjection()
        }
      );
      boundaryStore.setPolygon(
        geometry as Polygon | MultiPolygon,
        map!.getView().getProjection(),
        data.localname
      );
    });
  }
})

onUnmounted(() => {
  map?.removeControl(searchControl)
})

</script>
