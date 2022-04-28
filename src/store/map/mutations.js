export const selectFeature = (state, payload) => {
  state.selectedFeature = payload
}

export const addActiveLayer = (state, payload) => {
  const index = state.activeLayers.indexOf(payload)
  if (index === -1) {
    state.activeLayers.push(payload)
  }
  console.log(state.activeLayers)
}

export const removeActiveLayer = (state, payload) => {
  const index = state.activeLayers.indexOf(payload)
  if (index > -1) {
    state.activeLayers.splice(index, 1)
  }
  console.log(state.activeLayers)
}
