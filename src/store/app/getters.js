export const selectedIcons = state => {
  return state.selectedIcons
}

export const layers = state => {
  return state.layers
}

export const getLayers = state => {
  return state.layers
}

export const getModels = state => {
  return state.models
}

export const initialLayers = state => {
  return state.DEFAULTS.observations
}

export const getDefaults = state => {
  return state.DEFAULTS
}

export const getBackend = state => {
  return state.BACKEND
}

export const getText = state => function (text) {
  if (text in state.trans) return state.trans[text]
  else return text
}

export const getLang = state => {
  return state.lang
}

export const getModals = state => {
  return state.modals
}

export const getWorker = state => {
  return state.worker
}

export const isFilteringTag = state => {
  return state.isFilteringTag
}

export const getFrontendUrl = state => {
  return state.FRONTEND
}

export const getReportsLimit = state => {
  return state.reportsLimit
}

export const getIsMobile = state => {
  return state.isMobile
}

export const getPendingView = state => {
  return state.pendingView
}

export const getModelsServerPath = state => {
  return state.modelsServerPath
}

export const getLeftDrawerStatus = state => {
  return state.leftDrawerStatus
}

export const getCookiesComply = state => {
  return state.cookiesComply
}

export const getCalendarSubtitle = state => {
  return state.calendarSubtitle
}

export const getAnalyticsId = state => {
  return state.analyticsId
}

export const getModelsFieldNames = state => {
  return state.modelsFieldNames
}
