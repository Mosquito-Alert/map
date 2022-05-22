import { Control } from 'ol/control'

export default class DownloadControl extends Control {
  constructor (optOptions) {
    const options = optOptions || {}
    const button = document.createElement('button')
    button.setAttribute('title', options.title)
    button.innerHTML = options.icon

    const element = document.createElement('div')
    element.className = options.className
    element.appendChild(button)
    super({
      element: element,
      target: options.target
    })
    this.element = element
    button.addEventListener('click', options.callback.bind(this), false)
  }

  disable () {
    this.element.classList.add('ol-disabled')
  }

  enable () {
    this.element.classList.remove('ol-disabled')
  }

  isActive () {
    return !this.element.classList.contains('ol-disabled')
  }
}
