export const setTranslations = (state, payload) => {
  state.trans = payload
}

export const setAuthorized = (state, payload) => {
  state.authorized = payload
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

export const setLayers = (state, payload) => {
  state.layers = payload
}

export const setDefaultObservations = (state, payload) => {
  state.DEFAULTS.observations = payload
}

export const setDefaults = (state, payload) => {
  state.DEFAULTS.observations = payload.observations
  state.DEFAULTS.dates = payload.dates
  state.DEFAULTS.hashtags = payload.hashtags
}

export const setDefaultSamplingEffort = (state, payload) => {
  state.DEFAULTS.sampling_effort = payload
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

export const setModelEstimation = (state, payload) => {
  state.DEFAULTS.model.estimation = payload
}

export const setModelUncertainty = (state, payload) => {
  state.DEFAULTS.model.uncertainty = payload
}

export const setUncertaintyColor = (state, payload) => {
  state.DEFAULTS.model.uncertaintyColor = payload
}

export const setEstimationTransparency = (state, payload) => {
  state.DEFAULTS.model.estimationTransparency = payload
  state.DEFAULTS.model.estimationOpacity = 1 - (payload / 100)
}

export const setUncertaintyTransparency = (state, payload) => {
  state.DEFAULTS.model.uncertaintyTransparency = payload
  state.DEFAULTS.model.uncertaintyOpacity = 1 - (payload / 100)
}

export const setEstimationColors = (state, payload) => {
  state.DEFAULTS.model.estimationColors = payload
}
