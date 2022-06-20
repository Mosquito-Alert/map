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

export const toggleLeftDrawerStatus = (state) => {
  state.leftDrawerStatus = !state.leftDrawerStatus
  console.log('new status ' + state.leftDrawerStatus)
}

export const setDefaults = (state, payload) => {
  state.DEFAULTS.observations = payload.observations
  state.DEFAULTS.dates = payload.dates
  state.DEFAULTS.hashtags = payload.hashtags
}

export const setDefaultDates = (state, payload) => {
  state.DEFAULTS.dates = payload
}

export const setPendingView = (state, payload) => {
  console.log(payload)
  state.pendingView = payload
}
