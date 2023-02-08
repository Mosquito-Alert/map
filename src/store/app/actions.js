import { defaultObservations as privateDefaultObservations, observations as privateLayers } from './privateTOC'
import { defaultObservations as publicDefaultObservations, observations as publicLayers } from './publicTOC'

export const setLanguage = async (context, lang) => {
  context.commit('setLanguage', lang)
  await context.dispatch('setTranslations')
}

export const setTranslations = async (context) => {
  const lang = context.getters.getLang
  const url = context.getters.getBackend + 'translations/' + lang + '/'
  await fetch(url, {
    credentials: 'include'
  }).then(function (response) { return response.json() }).then(function (json) {
    context.commit('setTranslations', json)
    const registered = ('registered-user' in json) ? json['registered-user'] : false
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
