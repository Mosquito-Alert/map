import { transform } from 'ol/proj.js'
import FormatObservation from '../../js/FormatObservation'
import { StatusCodes as STATUS_CODES } from 'http-status-codes'
import { useStore } from 'vuex'
import axios from 'axios'

export const selectOneFeatureMap = (context, id) => {
  const root = context.rootGetters['app/getBackend']
  const titles = context.rootGetters['map/getTitles']
  const latinNames = context.rootGetters['map/getLatinNames']
  const url = root + 'api/get_observation/' + id + '/'
  const $store = useStore()

  axios(url, {
    withCredentials: true
  })
    .then(resp => {
      if (resp.status !== STATUS_CODES.OK) {
        $store.commit('app/setModal', {
          id: 'error',
          content: {
            visibility: true,
            msg: resp.data.error
          }
        })
      } else {
        resp.data.coordinates = transform(
          [resp.data.lon, resp.data.lat],
          'EPSG:4326', 'EPSG:3857'
        )
        const formated = new FormatObservation(resp.data, titles, latinNames).format()
        context.commit('selectFeature', formated)
      }
    })
}

export const selectFeature = (context, feature) => {
  const root = context.rootGetters['app/getBackend']
  const url = root + 'api/get_observation/' + feature.properties.id + '/'
  const titles = context.rootGetters['map/getTitles']
  const latinNames = context.rootGetters['map/getLatinNames']

  // If there is no id then all info is already in feature
  if (!feature.properties.id) {
    const formated = new FormatObservation(feature.properties, titles, latinNames).format()
    formated.coordinates = feature.geometry.flatCoordinates
    context.commit('selectFeature', formated)
    return
  }

  axios(url, {
    withCredentials: true
  }).then(resp => {
    resp.data.coordinates = feature.geometry.flatCoordinates
    const formated = new FormatObservation(resp.data, titles, latinNames).format()
    context.commit('selectFeature', formated)
  })
}
