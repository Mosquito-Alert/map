import { Control } from 'ol/control'

export default class DownloadControl extends Control {
  constructor (optOptions) {
    const options = optOptions || {}
    const button = document.createElement('button')
    button.setAttribute('title', 'Download')
    button.innerHTML = '<i class="fa-thin fa-download"></i>'

    const element = document.createElement('div')
    element.className = 'ol-download ol-unselectable ol-control'
    element.appendChild(button)

    super({
      element: element,
      target: options.target
    })
    button.addEventListener('click', options.callback.bind(this), false)
  }
}
