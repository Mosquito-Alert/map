import DataTile from 'ol/source/DataTile'
import TileLayer from 'ol/layer/WebGLTile'
import geojsonvt from 'geojson-vt'
import { useStore } from 'vuex'

export default class UserfixesLayer {
  constructor (map, url, legend, zIndex) {
    this.map = map
    this.legend = legend
    this.zIndex = zIndex
    this.url = url
    this.tileIndex = null
    this.layer = null
    this.$store = useStore()
  }

  // addAlpha (color, opacity) {
  //   // coerce values so ti is between 0 and 1.
  //   const _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255)
  //   console.log(color + _opacity.toString(16).toUpperCase())
  //   return color + _opacity.toString(16).toUpperCase()
  // }

  getUserFixesColor (nFixes) {
    const index = this.legend.findIndex(e => {
      return (e.from <= nFixes && e.to >= nFixes)
    })
    return this.legend[index].color
  }

  addLayer (tileIndex) {
    const _this = this
    this.tileIndex = tileIndex
    const canvas = document.createElement('canvas')
    const size = 256
    canvas.width = size
    canvas.height = size
    const context = canvas.getContext('2d')
    context.strokeStyle = 'white'
    this.map.removeLayer(this.layer)
    this.layer = new TileLayer({
      maxZoom: 19, // visible at zoom levels above 14
      source: new DataTile({
        loader: function (z, x, y) {
          const pad = 0
          const extent = 4096
          const tileContent = _this.tileIndex.getTile(z, x, y)
          if (!tileContent.features) {
            return
          }
          context.clearRect(0, 0, size, size)
          const features = tileContent.features
          for (let i = 0; i < features.length; i++) {
            const feature = features[i]
            const type = feature.type
            // Draw only polygons
            if (type !== 3) continue
            const color = _this.getUserFixesColor(feature.tags.num_fixes)
            context.fillStyle = color
            context.strokeStyle = color
            context.beginPath()

            for (let j = 0; j < feature.geometry.length; j++) {
              const geom = feature.geometry[j]
              for (let k = 0; k < geom.length; k++) {
                const p = geom[k]
                const x = p[0] / extent * size
                const y = p[1] / extent * size
                if (k) context.lineTo(x + pad, y + pad)
                else context.moveTo(x + pad, y + pad)
              }
            }
            context.fill('evenodd')
            context.stroke()
          }
          const data = context.getImageData(0, 0, size, size).data
          return new Uint8Array(data.buffer)
        },
        // disable opacity transition to avoid overlapping labels during tile loading
        transition: 0
      })
    })

    this.layer.setZIndex(this.zIndex)
    this.map.addLayer(this.layer)
    this.$store.commit('map/setSamplingEffortLoading', { loading: false })
  }

  refreshLayer () {
    const _this = this
    // Check if needs reloading
    if (this.tileIndex) {
      this.addLayer(this.tileIndex)
      return
    }

    fetch(this.url)
      .then(function (response) {
        return response.json()
      })
      .then(function (json) {
        _this.tileIndex = geojsonvt(json, {
          extent: 4096,
          maxZoom: 20
        })
        _this.addLayer(_this.tileIndex)
      })
  }
}
