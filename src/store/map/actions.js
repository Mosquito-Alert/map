export const selectFeature = (context, feature) => {
  const root = context.rootGetters['app/getBackend']
  const url = root + 'api/get_observation/' + feature.properties.id
  fetch(url).then(response => response.json()).then(json => {
    json.coordinates = feature.geometry.flatCoordinates
    if (!('validation_type' in json)) {
      json.validation_type = 'human'
    }
    if (json.private_webmap_layer === 'mosquito_tiger_probable') {
      json.title = 'Tiger mosquito'
      json.validation = 'Probable'
    } else if (json.private_webmap_layer === 'mosquito_tiger_confirmed') {
      json.title = 'Tiger mosquito'
      json.validation = 'Confirmed'
    }
    context.commit('selectFeature', json)
  })
}
