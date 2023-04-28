export const getErrorMessage = state => {
  return state.errorMessage
}

export const getCsrfToken = state => {
  return state.csrfToken
}

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

export const getAuthorized = state => {
  return state.authorized
}

export const getLang = state => {
  return state.lang
}

export const getAllowedLangs = state => {
  return state.allowedLangs
}

export const getModals = state => {
  return state.modals
}

export const getShareViewUrl = state => {
  return state.modals.share.url
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

export const getModelsUrl = state => {
  return state.modelsUrl
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

export const getGoogleTagManagerId = state => {
  return state.googleTagManagerId
}

export const getModelsManifestUrl = state => {
  return state.modelsManifestUrl
}

export const getModelsProperties = state => {
  return state.modelsProperties
}

export const getGridSize = state => {
  return state.gridsize
}

export const getModelDefaults = state => {
  return state.DEFAULTS.model
}

export const getAuthenticateUrl = state => {
  return state.authenticateUrl
}

export const getLogoutUrl = state => {
  return state.logoutUrl
}

export const getRegisteredWebUrl = state => {
  return state.registeredWebUrl
}

export const getEstimationColors = state => {
  return state.DEFAULTS.model.estimationColors
}

export const getUncertaintyColor = state => {
  return state.DEFAULTS.model.uncertaintyColor
}

export const getEstimationPalettes = state => {
  return state.DEFAULTS.model.estimationPalettes
}

export const getTilesUrl = state => {
  return state.tilesUrl
}

export const getBrowser = state => {
  return state.browser
}

export const getPossibleCategories = state => {
  return state.possibleCategories
}

export const getLeftMenuTabs = state => {
  return state.leftMenuTabs
}

export const getWmsTabLayers = state => {
  return state.wmsTabLayers
}

export const getSelectedWmsLayers = state => {
  return state.selectedWmsLayer
}

export const getWmsDataFromServer = state => {
  console.log('in getter to get ')
  return state.getWmsDataFromServer === true
}

export const getWmsData = state => {
  return state.WMS
}
