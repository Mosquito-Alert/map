import DataTile from 'ol/source/DataTile'
import TileLayer from 'ol/layer/WebGLTile'
import geojsonvt from 'geojson-vt'

export default class UserfixesLayer {
  constructor (map, fillColor, strokeColor, zIndex) {
    this.map = map
    this.zIndex = zIndex
    this.tileIndex = null
    this.layer = null
    this.fillColor = fillColor
    this.strokeColor = strokeColor
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
            console.log(_this.fillColor)
            context.fillStyle = _this.fillColor
            context.strokeStyle = _this.strokeColor
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
  }

  refreshLayer (geojson) {
    // Check if needs reloading
    if (this.tileIndex) {
      this.addLayer(this.tileIndex)
      return
    }

    this.tileIndex = geojsonvt(geojson, {
      extent: 4096,
      maxZoom: 20
    })
    this.addLayer(this.tileIndex)
  }
}
