import { getWmsDataFromServer } from './getters'

export const setErrorMessage = (state, message) => {
  state.errorMessage = message
}

export const setCsrfToken = (state, token) => {
  state.csrfToken = token
}

export const setTranslations = (state, payload) => {
  state.trans = payload
}

export const setTabsVisibility = (state, payload) => {
  state.leftMenuTabs = payload
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

export const deactivateLayerIcon = (state, payload) => {
  state.layers[payload.type][payload.code].active = false
}

export const toggleLayerIcon = (state, payload) => {
  state.layers[payload.type][payload.code].active = !state.layers[payload.type][payload.code].active
}

export const setActiveLayer = (state, payload) => {
  state.layers[payload.type][payload.code].active = payload.active
}

export const setWmsTabLayers = (state, payload) => {
  state.wmsTabLayers = payload
}

export const setSelectedWmsLayers = (state, payload) => {
  state.selectedWmsLayer = payload
}

export const setWMSsetWmsData = (state, data) => {
  if (getWmsDataFromServer) {
    state.WMS = data
  } else {
    console.log('No server data allowed. Check configuration file')
  }
}

export const setCurrentWMSView = (state, payload) => {
  state.currentWMSView = payload
}

export const setWmsProperties = (state, payload) => {
  const index = state.currentWMSView.years.findIndex((e) => {
    return e.id === payload.id
  })
  state.currentWMSView.years[index][payload.property] = payload.value
}
