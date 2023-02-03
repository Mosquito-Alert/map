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
  })
  // await fetch('http://localhost:8000/csrf/', {
  //   credentials: 'include'
  // }).then(function (response) {
  //   console.log(response)
  // })
}

export const setFilter = async (context, filter) => {
  const worker = context.getters.getWorker
  filter.data.layers = JSON.parse(JSON.stringify(context.getters.layers))
  worker.postMessage(filter)
}
