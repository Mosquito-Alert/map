export const setCompleteDatesRange = (state, payload) => {
  state.completeDatesRange = payload
}

export const updateDates = (state, payload) => {
  state.dates = payload
}

export const updateData = (state, payload) => {
  state.data = payload
}

export const updateDData = (state, payload) => {
  state.Data = payload
}

export const updateCache = (state, payload) => {
  state.cache = payload
}

export const updateDataFromCache = (state) => {
  state.Data = state.cache
}

export const updateXUnits = (state, days) => {
  if (days < 40) {
    state.chart.options.scales.x.time.unit = 'day'
  } else {
    state.chart.options.scales.x.time.unit = 'month'
  }
}

export const setChartOptions = (state, options) => {
  state.chart.options = options
}

export const setGraphIsVisible = (state, visibility) => {
  state.graphIsVisible = visibility
}

export const setChartOnZoomComplete = (state, options) => {
  state.chart.options.plugins.zoom.zoom.onZoomComplete = options
}

export const setChartOnZoomStart = (state, options) => {
  state.chart.options.plugins.zoom.zoom.onZoomStart = options
}

export const setChartOnPanStart = (state, options) => {
  state.chart.options.plugins.zoom.pan.onPanStart = options
}

export const setChartOnPanComplete = (state, options) => {
  state.chart.options.plugins.zoom.pan.onPanComplete = options
}

export const setYTickSuggetedMax = (state, max) => {
  state.chart.options.scales.y.suggestedMax = max
}

export const setToggling = (state, payload) => {
  state.toggling = payload
}

export const setAnimationOptions = (state, payload) => {
  state.chart.options.animation = payload
}
