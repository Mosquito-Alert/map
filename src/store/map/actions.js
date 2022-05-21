import { transform } from 'ol/proj.js'
import FormatObservation from '../../js/FormatObservation'

export const selectOneFeatureMap = (context, id) => {
  const root = context.rootGetters['app/getBackend']
  const titles = context.rootGetters['map/getTitles']
  const latinNames = context.rootGetters['map/getLatinNames']

  const url = root + 'api/get_observation/' + id

  fetch(url)
    .then(response => response.json())
    .then(json => {
      json.coordinates = transform(
        [json.lon, json.lat],
        'EPSG:4326', 'EPSG:3857'
      )
      const formated = new FormatObservation(json, titles, latinNames).format()
      context.commit('selectFeature', formated)
    })
}

export const selectFeature = (context, feature) => {
  const root = context.rootGetters['app/getBackend']
  const url = root + 'api/get_observation/' + feature.properties.id
  const titles = context.rootGetters['map/getTitles']
  const latinNames = context.rootGetters['map/getLatinNames']

  fetch(url).then(response => response.json()).then(json => {
    json.coordinates = feature.geometry.flatCoordinates
    const formated = new FormatObservation(json, titles, latinNames).format()
    context.commit('selectFeature', formated)
  })
}
