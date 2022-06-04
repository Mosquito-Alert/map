export const setDatesRange = (state, payload) => {
  state.datesRange = payload
}

export const setMapDates = (state, payload) => {
  state.mapDates.from = payload.from
  state.mapDates.to = payload.to
}

export const selectFeature = (state, payload) => {
  state.selectedFeature = payload
}

export const addActiveLayer = (state, payload) => {
  const index = state.activeLayers.findIndex(element => {
    return element.type === payload.type && (('code' in payload) ? element.code === payload.code : true)
  })

  if (index === -1) {
    state.activeLayers.push(payload)
  }
}

export const removeActiveLayer = (state, payload) => {
  const index = state.activeLayers.findIndex(element => {
    return element.type === payload.type && (('code' in payload) ? element.code === payload.code : true)
  })

  if (index > -1) {
    state.activeLayers.splice(index, 1)
  }
}

export const setSamplingEffortLoading = (state, payload) => {
  state.samplingEffortLoading = payload.loading
}

export const setDefaults = (state, payload) => {
  state.DEFAULTS.ZOOM = payload.zoom
  state.DEFAULTS.CENTER = payload.center
  state.DEFAULTS.MOBILEZOOM = payload.zoom
}
