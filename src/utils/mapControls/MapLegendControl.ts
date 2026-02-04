import type { IControl } from 'maplibre-gl'
import { useMapStore } from '../../stores/mapStore'
import { useObservationsStore } from '../../stores/observationsStore'

export class MapLegendControl implements IControl {
  _container: HTMLElement
  _button!: HTMLButtonElement
  _unsubscribe?: () => void

  constructor() {
    this._container = document.createElement('div')
    this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group'
  }

  onAdd(map: maplibregl.Map): HTMLElement {
    const mapStore = useMapStore()
    const observationsStore = useObservationsStore()

    this._button = document.createElement('button')
    this._button.className =
      'map-legend flex! justify-center! items-center! opacity-50! cursor-not-allowed!'
    this._button.innerHTML = `<span class="material-icons-outlined">ballot</span>`
    this._button.setAttribute('aria-label', 'Toggle Legend')
    this._button.title = 'Toggle Legend'
    this._button.disabled = !observationsStore.dataProcessed

    this._button.onclick = () => {
      if (!observationsStore.dataProcessed) return
      // Toggle the showLegend state in the map store
      mapStore.showLegend = !mapStore.showLegend
    }

    this._unsubscribe = mapStore.$subscribe((_mutation, state) => {
      this._button.classList.toggle('text-amber-500!', state.showLegend)
    })
    this._unsubscribe = observationsStore.$subscribe((_mutation, state) => {
      this._button.disabled = !state.dataProcessed
      this._button.classList.toggle('opacity-50!', !state.dataProcessed)
      this._button.classList.toggle('cursor-not-allowed!', !state.dataProcessed)
    })

    this._container.appendChild(this._button)

    return this._container
  }

  onRemove() {
    this._unsubscribe?.()
    this._container?.remove()
  }
}
