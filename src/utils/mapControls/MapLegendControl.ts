import type { IControl } from 'maplibre-gl'
import { useMapStore } from '../../stores/mapStore'

export class MapLegendControl implements IControl {
  _container: HTMLElement

  constructor() {
    this._container = document.createElement('div')
    this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group'
  }

  onAdd(map: maplibregl.Map): HTMLElement {
    const button = document.createElement('button')

    map.on('load', () => {
      button.className = 'map-legend flex! justify-center! items-center!'
      button.innerHTML = `<span class="material-icons-outlined">ballot</span>`
      this._container.appendChild(button)

      button.onclick = () => {
        // Toggle the showLegend state in the map store
        const mapStore = useMapStore()
        mapStore.showLegend = !mapStore.showLegend
      }
    })

    return this._container
  }

  onRemove() {
    this._container?.remove()
  }
}
