import { createApp } from 'vue'
import MyPopup from '../components/Map/MapInfoPopup.vue'
import PrimeVue from 'primevue/config'
import Dialog from 'primevue/dialog'
import type { IControl } from 'maplibre-gl'

export class MapInfoControl implements IControl {
  _container: HTMLElement | null
  _vuePopup: HTMLElement | null
  _vueInstance: ReturnType<typeof createApp> | null
  _map: any

  constructor() {
    this._container = null
    this._vuePopup = null
    this._vueInstance = null
  }

  onAdd(map: any) {
    this._map = map

    this._container = document.createElement('div')
    this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group'

    const button = document.createElement('button')
    button.className = 'flex! justify-center! items-center!'
    button.innerHTML = '<span class="material-icons-outlined">info</span>'
    button.type = 'button'
    this._container.appendChild(button)

    this._vuePopup = document.createElement('div')
    document.body.appendChild(this._vuePopup)

    // Create Vue instance AND install PrimeVue
    this._vueInstance = createApp(MyPopup)
    this._vueInstance.use(PrimeVue)
    this._vueInstance.component('Dialog', Dialog)

    const component = this._vueInstance.mount(this._vuePopup)
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
