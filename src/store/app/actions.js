
export const setTranslations = async state => {
  const url = state.getters.getBackend + 'translations/ca/'
  fetch(url).then(function (response) { return response.json() }).then(function (json) {
    state.commit('setTranslations', json)
  })
}
