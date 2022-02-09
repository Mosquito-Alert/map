export const setLanguage = (context, lang) => {
  context.commit('setLanguage', lang)
  context.dispatch('setTranslations')
}

export const setTranslations = async (context) => {
  const lang = context.getters.getLang
  const url = context.getters.getBackend + 'translations/' + lang + '/'
  fetch(url).then(function (response) { return response.json() }).then(function (json) {
    context.commit('setTranslations', json)
  })
}

export const setFilter = async (context, filter) => {
  const worker = context.getters.getWorker
  console.log(worker)
  filter.data.layers = JSON.parse(JSON.stringify(context.getters.layers))
  console.log(filter)
  worker.postMessage(filter)
}
