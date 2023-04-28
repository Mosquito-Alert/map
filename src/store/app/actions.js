import { defaultObservations as privateDefaultObservations, observations as privateLayers } from './privateTOC'
import { defaultObservations as publicDefaultObservations, observations as publicLayers } from './publicTOC'
import axios from 'axios'

export const setInitData = async (context, lang) => {
  context.commit('setLanguage', lang)
  await context.dispatch('setTranslations')
}

export const setTranslations = async (context) => {
  const lang = context.getters.getLang
  const url = context.getters.getBackend + 'translations/' + lang + '/'
  await axios(url, {
    withCredentials: true
  }).then(function (resp) {
    context.commit('setTranslations', resp.data.trans)
    context.commit('setTabsVisibility', resp.data.config.tabs)
    context.commit('setWMSsetWmsData', resp.data.config.wms)
    const registered = ('registered-user' in resp.data) ? resp.data['registered-user'] : false
    context.commit('setAuthorized', registered)
  })

  if (context.getters.getAuthorized) {
    context.commit('setLayers', privateLayers)
    context.commit('setDefaultObservations', privateDefaultObservations)
  } else {
    context.commit('setLayers', publicLayers)
    context.commit('setDefaultObservations', publicDefaultObservations)
  }
}

export const setFilter = async (context, filter) => {
  const worker = context.getters.getWorker
  filter.data.layers = JSON.parse(JSON.stringify(context.getters.layers))
  worker.postMessage(filter)
}
