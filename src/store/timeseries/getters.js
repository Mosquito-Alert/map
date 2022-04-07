export const getData = state => {
  return state.data
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
