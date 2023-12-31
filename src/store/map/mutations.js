export const setMinMaxDates = (state, payload) => {
  state.minMaxDates.min = payload.min
  state.minMaxDates.max = payload.max
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

export const setCurrents = (state, payload) => {
  state.CURRENTS.ZOOM = payload.zoom
  state.CURRENTS.CENTER = payload.center
  state.CURRENTS.MOBILEZOOM = payload.zoom
}

export const setCenter = (state, payload) => {
  state.CURRENTS.CENTER = payload.center
}

export const setModelDate = (state, payload) => {
  state.modelDate = payload
}

export const setViewbox = (state, payload) => {
  state.viewbox = payload.map(Number)
}

export const setLeftMenuToggling = (state, payload) => {
  state.leftMenuToggling = payload
}

export const setIndexingOn = (state, value) => {
  state.indexingOn = value
}

export const setFirstViewMap = (state, value) => {
  state.firstViewMap = value
}
export const setDataset = (state, value) => {
  state.dataset = value
}
