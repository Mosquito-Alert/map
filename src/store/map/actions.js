export const selectFeature = (context, feature) => {
  const root = context.rootGetters['app/getBackend']
  const url = root + 'api/get_feature/' + feature.properties.id
  fetch(url).then(response => response.json()).then(json => {
    json.coordinates = feature.geometry.flatCoordinates
    if (json.layer === 'mosquito_tiger_probable') {
      json.title = 'Tiger mosquito'
      json.validation = 'Probable'
    } else if (json.layer === 'mosquito_tiger_confirmed') {
      json.title = 'Tiger mosquito'
      json.validation = 'Confirmed'
    }
    context.commit('selectFeature', json)
  })
}
