import type { IControl } from 'maplibre-gl'
import { useMapStore } from '../../stores/mapStore'

export class MapGlobeControl implements IControl {
  _container: HTMLElement
  _button!: HTMLButtonElement

  constructor() {
    this._container = document.createElement('div')
    this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group'
  }

  onAdd(map: maplibregl.Map): HTMLElement {
    const mapStore = useMapStore()

    this._button = document.createElement('button')
    this._button.className = 'map-globe-switch font-semibold opacity-50! cursor-not-allowed!'
    this._button.innerHTML = `3D`
    this._button.setAttribute('aria-label', 'Toggle Globe View')
    this._button.title = 'Toggle Globe View'
    this._button.disabled = true

    this._button.onclick = () => {
      if (!map) return
      // Toggle the globeView state in the map store
      mapStore.globeView = !mapStore.globeView
      if (mapStore.globeView) {
        map.setProjection({ type: 'globe' })
        this._button.innerHTML = `3D`
      } else {
        map.setProjection({ type: 'mercator' })
        this._button.innerHTML = `2D`
      }
    }

    map.on('load', () => {
      this._button.disabled = false
      this._button.classList.remove('opacity-50!')
      this._button.classList.remove('cursor-not-allowed!')
    })

    this._container.appendChild(this._button)

    return this._container
  }

  onRemove() {
    this._container?.remove()
  }
}
