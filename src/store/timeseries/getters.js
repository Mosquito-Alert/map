export const getData = state => {
  return state.data
}

export const getDData = state => {
  return state.Data
}

export const getDates = state => {
  return Object.values(state.dates)
}

export const getChartOptions = state => {
  return state.chart.options
}

export const getCompleteDatesRange = state => {
  return state.completeDatesRange
}

export const getActiveLayers = state => {
  return state.activeLayers
}

export const getGraphIsVisible = state => {
  return state.graphIsVisible
}

export const getYTickSuggestedMax = state => {
  return state.chart.options.scales.y.suggestedMax
}
