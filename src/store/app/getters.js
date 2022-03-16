export const selectedIcons = state => {
  return state.selectedIcons
}

export const layers = state => {
  return state.layers
}

export const getLayers = state => {
  return state.layers
}

export const initialLayers = state => {
  return state.DEFAULTS.LAYERS
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

export const getLang = state => {
  return state.lang
}

export const getModals = state => {
  return state.modals
}

export const getWorker = state => {
  return state.worker
}
