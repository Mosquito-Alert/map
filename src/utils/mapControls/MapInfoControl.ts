import type { IControl } from 'maplibre-gl'
import PrimeVue from 'primevue/config'
import Dialog from 'primevue/dialog'
import { createApp } from 'vue'
import MyPopup from '../../components/Map/MapInfoPopup.vue'

export class MapInfoControl implements IControl {
  _container: HTMLElement
  _vuePopup: HTMLElement
  _vueInstance: ReturnType<typeof createApp> | null
  _map: any

  constructor() {
    this._container = document.createElement('div')
    this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group'
    this._vuePopup = document.createElement('div')
    this._vueInstance = null
  }

  onAdd(map: maplibregl.Map): HTMLElement {
    this._map = map

    const button = document.createElement('button')
    button.className = 'map-info flex! justify-center! items-center!'
    button.innerHTML = '<span class="material-icons-outlined">info</span>'
    button.type = 'button'
    this._container.appendChild(button)

    document.body.appendChild(this._vuePopup)

    // Create Vue instance AND install PrimeVue
    this._vueInstance = createApp(MyPopup)
    this._vueInstance.use(PrimeVue)
    this._vueInstance.component('Dialog', Dialog)

    const component = this._vueInstance.mount(this._vuePopup) as any
    button.onclick = () => {
      component.open()
    }

    return this._container
  }

  onRemove() {
    this._vueInstance?.unmount()
    this._vuePopup?.remove()
    this._container?.remove()
  }
}
