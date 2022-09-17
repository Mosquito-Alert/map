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
  state.pendingView = payload
}

export const setCookiesComply = (state, payload) => {
  state.cookiesComply = payload
}

export const setCalendarSubtitle = (state, payload) => {
  state.calendarSubtitle = payload
}

export const setModelDefaults = (state, payload) => {
  state.DEFAULTS.model = payload
}

export const setModelEst = (state, payload) => {
  state.DEFAULTS.model.est = payload
}

export const setModelSe = (state, payload) => {
  state.DEFAULTS.model.se = payload
}

export const setUncertaintyColor = (state, payload) => {
  state.DEFAULTS.model.uncertaintyColor = payload
}

export const setEstTransparency = (state, payload) => {
  state.DEFAULTS.model.estTransparency = payload
}

export const setSeTransparency = (state, payload) => {
  state.DEFAULTS.model.seTransparency = payload
}
