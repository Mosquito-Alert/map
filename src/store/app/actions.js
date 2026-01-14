export const setInitData = async (context, lang) => {
  context.commit('setLanguage', lang)
}

export const setFilter = async (context, filter) => {
  const worker = context.getters.getWorker
  filter.data.layers = JSON.parse(JSON.stringify(context.getters.layers))
  worker.postMessage(filter)
}
