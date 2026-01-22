<template>
  <GadmVectorTileLayer ref="layerRef" :level="level" :visible="visible" :opacity="opacity" v-bind="{ ...(minZoom !== undefined && { minZoom }), ...(maxZoom !== undefined && { maxZoom }) }">
    <ol-style :overrideStyleFunction="styleFn"></ol-style>
  </GadmVectorTileLayer>
</template>

<script lang="ts">

import { useQuasar } from 'quasar'
import { ref, onMounted, watch } from 'vue'
import { cdn } from 'boot/axios'

import GadmVectorTileLayer from 'src/components/GadmVectorTileLayer.vue'

import { Style, Fill, Stroke } from 'ol/style'
import type { Feature } from 'ol'

const mapStyleColor = {
  lowLevelStroke: '#C9C9C9',
  highLevelStroke: '#B9B9B9',
}

export default {
  components: {
    GadmVectorTileLayer
  },
  props: {
    palette: {
      type: Array<string>,
      required: true
    },
    speciesCode: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    level: {
      type: Number,
      required: true
    },
    opacity: {
      type: Number,
      default: 1
    },
    visible: {
      type: Boolean,
      default: true
    },
    minZoom: {
      type: Number
    },
    maxZoom: {
      type: Number
    },
    filters: {
      type: Object
    }
  },
  setup(props) {
    const $q = useQuasar()

    const layerRef = ref()

    let dataObj: Record<string, { prob: number, se: number }> = {}

    // Watcher for props
    watch(() => [props.speciesCode, props.date] as const, ([newSpeciesCode, newDate]) => {
      if ([newSpeciesCode, newDate].every(item => item !== undefined)) {
        load(newSpeciesCode, newDate)
      }
    })

    watch(() => props.filters, () => {
      layerRef.value.changed()
    }, { deep: true })

    onMounted(() => {
      load(props.speciesCode, props.date)
    })

    function getFeatureColor(feature: Feature) {
      // NOTE: if every start using geoserver
      // const id = feature.getId()
      // Get the data from CSV if provided and determine color based on probability
      const id = feature.getProperties()['id']
      if (id === undefined || dataObj[id] === undefined) {
        // id not found in dataObj
        return
      }

      // Apply filters
      if (props.filters) {
        if (props.filters.certaintyRange) {
          const { min, max } = props.filters.certaintyRange
          const certainty = dataObj[id].se
          if (certainty < min || certainty > max) {
            // Certainty outside the filter range
            return
          }
        }
      }

      const palette = props.palette
      const index = Math.min(
        Math.floor(dataObj[id].prob * palette.length),
        palette.length - 1
      )

      return palette[index]
    }

    function load(speciesCode: string, date: Date) {
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')

      dataObj = {}

      const urlPath = `static/models/global_minimal_model_estimates/gadm${props.level}/${speciesCode}/${year}/${month}/gadm${props.level}_monthly.csv`
      cdn.get(urlPath)
        .then((response) => {
          const lines = response.data.split(/\r?\n/)
          const headers = lines[0].split(',')
          const indexId = headers.indexOf('gid_' + props.level)
          const indexEst = headers.indexOf('est')
          const indexSe = headers.indexOf('se')
          for (let i = 1; i < lines.length; i++) {
            const currentLine = lines[i].split(',')
            const nutsId = currentLine[indexId]
            if (nutsId !== undefined) {
              const prob = currentLine[indexEst]
              // Converting uncertainty to certainty
              const se = 1 - currentLine[indexSe]
              dataObj[nutsId] = { prob, se }
            }
          }
        })
        .catch(() => {
          $q.notify({
            color: 'negative',
            position: 'bottom',
            message: `Loading ${speciesCode} model for GADM${props.level} failed`,
            icon: 'report_problem'
          })
        }).finally(() => {
          layerRef.value.changed()
        })
    }

    return {
      layerRef,
      styleFn(feature: Feature) {
        const fillColor = getFeatureColor(feature)

        if (fillColor === undefined) {
          return
        }

        return new Style({
          fill: new Fill({
            color: String(fillColor)
          }),
          stroke: new Stroke({
            color: mapStyleColor.lowLevelStroke,
            width: 0.4
          })
        })
      }
    }
  }
}
</script>
