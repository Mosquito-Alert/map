<template>

  <!-- <ol-vector-tile-layer ref="layerRef" :visible="visible" :opacity="opacity">
    <ol-source-vector-tile
      url="https://mapserver.mosquitoalert.com/geoserver/gwc/service/tms/1.0.0/mosquitoalert:discoveries@EPSG:900913@pbf/{z}/{x}/{-y}.pbf"
      :format="mvtFormat" :maxZoom="9">
      <ol-style :overrideStyleFunction="styleFn"></ol-style>
    </ol-source-vector-tile>
  </ol-vector-tile-layer> -->

  <ol-tile-layer :opacity="opacity" :visible="visible">
    <ol-source-tile-wms url="https://mapserver.mosquitoalert.com/geoserver/mosquitoalert/wms"
      layers="mosquitoalert:discoveries" serverType="geoserver" :params="{
        'env': `field:${speciesCode}`,
      }" />
  </ol-tile-layer>

</template>

<script lang="ts">

import { ref, watchEffect, inject, onMounted, onUnmounted } from 'vue'

import MVT from 'ol/format/MVT'
import type Feature from 'ol/Feature'
import type Map from "ol/Map";
import { Style, Fill, Stroke, RegularShape, Text } from 'ol/style'

import Legend from 'ol-ext/legend/Legend'
import LegendControl from 'ol-ext/control/Legend'

const choroplethData = {
  // Keys are the possible value of the geometry specie column.
  mosquito_alert: { label: "Mosquito Alert discoveries", color: "#e34a33" },
  official: { label: "Official data", color: "#fef0d9" },
};

const mapStyleColor = ref({
  lowLevelStroke: '#E1C5C7',
  highLevelStroke: '#e1c5c7',
})

export default {
  props: {
    speciesCode: {
      type: String,
      // required: true
    },
    opacity: {
      type: Number,
      default: 1
    },
    visible: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {

    const layerRef = ref()
    const map = inject<Map | undefined>("map");

    const mvtFormat = new MVT({
      // featureClass: Feature,
      idProperty: 'locCode'
    })

    // Create legend for the discoveries layer
    const legend = new Legend({
      title: 'Legend',
      size: [14, 14],
      // layer: layerRef.value.vectorTileLayer,
      textStyle: new Text({
        font: '14px Roboto'
      }),
      titleStyle: new Text({
        font: '16px Roboto',
        textAlign: 'center',
        justify: 'center'
      })

    })

    // Add legend items based on choropleth data
    // Object.entries(choroplethData).forEach(([colorKey, { label, color }]) => {
    Object.values(choroplethData).forEach(({ label, color }) => {
      legend.addItem({
        title: label,
        typeGeom: 'Point',
        style: new Style({
          image: new RegularShape({
            points: 4, // Rectangle
            radius: 14,
            angle: Math.PI / 4,
            stroke: new Stroke({
              color: 'gray',
              width: 1.5
            }),
            fill: new Fill({
              color: color
            })
          })
        })
      })
    })

    // Create legend control and add it to the map
    const legendControl = new LegendControl({
      legend: legend,
      collapsed: false
    })

    watchEffect(() => {
      if (layerRef.value === undefined) {
        return
      }
      layerRef.value.vectorTileLayer.setProperties(
        {
          // This is for setting the MVT column to look at
          statusProperty: props.speciesCode,
          getFeatureStatus: function (feature: Feature) {
            return feature.get(this.statusProperty)
          }
        }
      )
      layerRef.value.vectorTileLayer.changed()
    })

    onMounted(() => {
      map?.addControl(legendControl)
    })

    onUnmounted(() => {
      map?.removeControl(legendControl)
    })

    return {
      layerRef,
      mvtFormat,
      styleFn(feature: Feature) {
        if (feature.get('leave') === 1) {
          // Setting to unknown if undefined.
          const statusValue = layerRef.value.vectorTileLayer.getProperties().getFeatureStatus(feature)
          if (statusValue === undefined) {
            return
          }
          const fillColor = choroplethData[statusValue as keyof typeof choroplethData].color

          let stroke
          const zoomLevel = map?.getView().getZoom()
          const codeLevel = feature.get('codeLevel')
          if ((zoomLevel !== undefined && zoomLevel >= 6 && codeLevel > 4) || codeLevel <= 4) {
            stroke = new Stroke({
              color: mapStyleColor.value.lowLevelStroke,
              width: 0.25
            })
          } else {
            // Polygons are not perfect and there are holes between them.
            // Filling with the same color in order to prevent showing the
            // base map color between the polygons.
            stroke = new Stroke({
              color: fillColor,
              width: 1
            })
          }

          return new Style({
            fill: new Fill({
              color: fillColor
            }),
            stroke: stroke
          })
        }
      }
    }
  }
}
</script>
