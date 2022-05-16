export const setTranslations = (state, payload) => {
  state.trans = payload
}

export const setLanguage = (state, lang) => {
  state.lang = lang
}

export const setModal = (state, payload) => {
  state.modals[payload.id] = payload.content
}

export const setFilteringTag = (state, payload) => {
  state.isFilteringTag = payload.value
}

export const increaseLeftDrawerStatus = (state) => {
  state.leftDrawerStatus += 1
}

export const setDefaults = (state, payload) => {
  state.DEFAULTS.observations = payload.observations
  state.DEFAULTS.dates = payload.dates
  state.DEFAULTS.hashtags = payload.hashtags
}
