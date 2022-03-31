export const updateDates = (state, payload) => {
  state.dates = payload
}

export const updateData = (state, payload) => {
  state.data = payload
}

export const updateXUnits = (state, days) => {
  if (days < 40) {
    state.chart.options.scales.x.time.unit = 'day'
  } else {
    state.chart.options.scales.x.time.unit = 'month'
  }
}
