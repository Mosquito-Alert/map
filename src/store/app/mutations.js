export const setErrorMessage = (state, message) => {
  state.errorMessage = message
}

export const setCsrfToken = (state, token) => {
  state.csrfToken = token
}

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

export const deactivateLayerIcon = (state, payload) => {
  state.layers[payload.type][payload.code].active = false
}

export const toggleLayerIcon = (state, payload) => {
  state.layers[payload.type][payload.code].active = !state.layers[payload.type][payload.code].active
}

export const setActiveLayer = (state, payload) => {
  state.layers[payload.type][payload.code].active = payload.active
}

export const setEarlyWarningSpecieCode = (state, code) => {
  state.earlyWarning.specieCode = code
}

// encounterProbability
export const setEncounterProbabilitySpecieCode = (state, value) => {
  state.encounterProbability.specieCode = value
}

export const setEncounterProbabilityDate = (state, value) => {
  state.encounterProbability.date = value
}

export const setEncounterProbabilityFilterCertaintyRange = (state, value) => {
  state.encounterProbability.filters.certaintyRange = value
}
