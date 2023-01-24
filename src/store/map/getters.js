export const getMinMaxDates = (state) => {
  return state.minMaxDates
}

export const getMapDates = (state) => {
  return state.mapDates
}

export const getDefault = (state, payload) => {
  return state.DEFAULTS
}

export const getCurrents = (state, payload) => {
  return state.CURRENTS
}

export const features = (state, payload) => {
  return state.features
}

export const getSelectedFeature = (state) => {
  return state.selectedFeature
}

export const getMaxZoom = state => {
  return state.maxZoom
}

export const getActiveLayers = state => {
  return state.activeLayers
}

export const getSamplingEffortLoading = state => {
  return state.samplingEffortLoading
}

export const getTitles = state => {
  return state.titles
}

export const getLatinNames = state => {
  return state.latinNames
}

export const getModelDate = state => {
  return state.modelDate
}

export const getViewbox = state => {
  return state.viewbox
}

export const getLeftMenuToggling = state => {
  return state.leftMenuToggling
}

export const getIndexingOn = state => {
  return state.indexingOn
}
