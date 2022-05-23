export const getDatesRange = (state) => {
  return state.datesRange
}

export const getMapDates = (state) => {
  return state.mapDates
}

export const getDefault = (state, payload) => {
  return state.DEFAULTS
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
