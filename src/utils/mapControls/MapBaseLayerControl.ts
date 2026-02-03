import type { IControl, StyleSpecification } from 'maplibre-gl'
import { createApp } from 'vue'
import Tooltip from 'primevue/tooltip'
import MapBaseLayerSelector from '../../components/Map/MapBaseLayerSelector.vue'

export type BasemapType = {
  id: string
  url: string | StyleSpecification
  image: string
  name: string
}

export type MapLibreBasemapsControlOptions = {
  basemaps: Array<BasemapType>
  initialBasemap: string // id of the initial basemap
}

export class MapBaseLayerControl implements IControl {
  _options: MapLibreBasemapsControlOptions
  _container: HTMLElement
  _app: any

  constructor(options: MapLibreBasemapsControlOptions) {
    this._options = options
    this._container = document.createElement('div')
  }

  onAdd(map: maplibregl.Map): HTMLElement {
    const mountPoint = document.createElement('div')
    this._container.appendChild(mountPoint)

    map.on('load', () => {
      this._app = createApp(MapBaseLayerSelector, { options: this._options })
      this._app.directive('tooltip', Tooltip)
      console.log('options:')
      console.log(this._options)
      this._app.mount(mountPoint)
    })

    return this._container
  }

  onRemove() {
    this._app.unmount()
    this._container?.remove()
  }
}
