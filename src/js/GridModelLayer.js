// import { getInterpolatedColor } from '../js/InterpolateColors.js'
import DataTile from 'ol/source/DataTile'
import TileLayer from 'ol/layer/WebGLTile'
import geojsonvt from 'geojson-vt'

export default class GridModelLayer {
  constructor (map, geoJson, options) {
    this.map = map
    // this.legend = legend
    // this.zIndex = zIndex
    this.tileIndex = geojsonvt(geoJson, {
      extent: 4096,
      maxZoom: 20,
      buffer: 512
    })
    this.layer = null
    this.options = options
  }

  getColor (value) {
    // return getInterpolatedColor(this.options.colors.from, this.options.colors.to, value)
    let c
    if (value < this.options.rangs[0]) {
      c = this.options.colors[0]
    } else if (value < this.options.rangs[1]) {
      c = this.options.colors[1]
    } else if (value < this.options.rangs[2]) {
      c = this.options.colors[2]
    } else if (value < this.options.rangs[3]) {
      c = this.options.colors[3]
    } else if (value < this.options.rangs[4]) {
      c = this.options.colors[4]
    } else {
      c = this.options.colors[5]
    }
    return c
  }

  addLayer () {
    const _this = this
    const canvas = document.createElement('canvas')
    const size = 256
    canvas.width = size
    canvas.height = size
    const context = canvas.getContext('2d')
    context.strokeStyle = 'white'
    this.map.removeLayer(this.layer)
    this.layer = new TileLayer({
      zIndex: _this.options.zIndex,
      minZoom: _this.options.minZoom,
      maxZoom: _this.options.maxZoom,
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
            if (type === 1) {
              _this.drawPoint(context, feature, extent, size, _this.options.color)
            } else if (type === 3) {
              const color = _this.getColor(feature.tags.v)
              context.fillStyle = color
              context.beginPath()
              // context.lineWidth = 1
              // context.strokeStyle = 'blue'
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
          }
          const data = context.getImageData(0, 0, size, size).data
          return new Uint8Array(data.buffer)
        },
        // disable opacity transition to avoid overlapping labels during tile loading
        transition: 0
      })
    })

    // this.layer.setOpacity(this.options.opacity)
    this.map.addLayer(this.layer)
  }

  drawPoint (context, feature, extent, size, color) {
    let radius = 4
    const pad = 0
    const value = feature.tags.se
    // Draw only uncertainty with data
    if (!value) {
      return true
    }
    if (value < 0.25) {
      radius = radius * 1
    } else if (value < 0.5) {
      radius = radius * 2
    } else if (value < 0.75) {
      radius = radius * 3
    } else {
      radius = radius * 4
    }
    // context.strokeStyle = color
    context.fillStyle = color
    context.lineWidth = 1
    const d = feature.geometry[0]
    context.beginPath()
    context.arc((d[0] / extent * size) + pad, (d[1] / extent * size) + pad, radius, 0, Math.PI * 2)
    context.fill()
    context.stroke()
  }
}
