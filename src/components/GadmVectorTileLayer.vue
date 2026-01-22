<template>
  <ol-vector-tile-layer ref="layerRef" renderMode='hybrid' :visible="visible" :opacity="opacity" :minZoom="minZoom"
    :maxZoom="maxZoom" :zIndex="zIndex" :background="backgroundColor">
    <ol-source-vector-tile :url="url" :format="mvtFormat" attributions='© GADM' :minZoom='2' :maxZoom='7'>
      <slot></slot>
    </ol-source-vector-tile>
  </ol-vector-tile-layer>
</template>

<script lang="ts">

import { ref, computed } from 'vue'

import MVT from 'ol/format/MVT'
// import Feature from 'ol/Feature'

const levelToId: Record<number, string> = {
  0: 'COUNTRY',
  1: 'GID_1',
  2: 'GID_2',
  3: 'GID_3',
  4: 'GID_4'
}

export default {
  props: {
    level: {
      type: Number,
      required: true,
      validator: function (value: number) {
        // Check if the value is an integer and between 0 and 4
        return Number.isInteger(value) && value >= 0 && value <= 4
      }
    },
    backgroundColor: {
      type: String
    },
    opacity: {
      type: Number,
      default: 1
    },
    visible: {
      type: Boolean,
      default: true
    },
    zIndex: {
      type: Number,
      default: 0
    },
    minZoom: {
      type: Number
    },
    maxZoom: {
      type: Number
    },
    projection: {
      type: String,
      default: 'EPSG:900913'
    },
    source: {
      type: Object
    }
  },
  setup(props) {
    const layerRef = ref()

    const url = computed(() => {
      return `https://api.mosquitoalert.com/v1/map/tiles/gadm${props.level}/{z}/{x}/{y}.pbf`
      // NOTE: If every want to start using geoserver:
      // const tilesUrl = 'https://mapserver-ifca.mosquitoalert.com/geoserver/gwc/service/tms/1.0.0/'
      // return tilesUrl + 'map_gadm:ADM_' + props.level + '@' + props.projection + '@pbf/{z}/{x}/{-y}.pbf'
    })

    const mvtFormat = computed(() => {
      return new MVT({
        // featureClass: Feature,
        idProperty: levelToId[props.level]
      })
    })

    return {
      layerRef,
      url,
      mvtFormat,
      changed() {
        layerRef.value.vectorTileLayer.changed()
      }
    }
  }
}
</script>
