export const selectFeature = (context, feature) => {
  const root = context.rootGetters['app/getBackend']
  const url = root + 'api/get_observation/' + feature.properties.id
  const titles = {
    mosquito_tiger_confirmed: 'Tiger mosquito',
    mosquito_tiger_probable: 'Tiger mosquito',
    yellow_fever_confirmed: 'Yellow fever mosquito',
    yellow_fever_probable: 'Yellow fever mosquito',
    japonicus_confirmed: 'Japonicus mosquito',
    japonicus_probable: 'Japonicus mosquito',
    culex_confirmed: 'Culex mosquito',
    culex_probable: 'Culex mosquito',
    koreicus_confirmed: 'Koreicus mosquito',
    koreicus_probable: 'Koreicus mosquito',
    albopictus_cretinus: 'Albopictus cretinus',
    unidentified: 'Unidentified mosquito',
    other_species: 'Other species',
    conflict: 'Conflict',
    japonicus_koreicus: 'Japonicus_koreicus',
    not_yet_validated: 'Not_yet_validated',
    trash_layer: 'Trash',
    storm_drain_dry: 'Stormdrain without water',
    storm_drain_water: 'Stormdrain with water',
    breeding_site_not_yet_filtered: 'Breeding_site_not_yet_filtered',
    breeding_site_other: 'Breeding site other'
  }

  fetch(url).then(response => response.json()).then(json => {
    json.coordinates = feature.geometry.flatCoordinates

    if (!('validation_type' in json)) {
      json.validation_type = 'human'
    }

    json.title = titles[json.private_webmap_layer]
    json.validation = (titles[json.private_webmap_layer].indexOf('confirmed') > -1) ? 'Confirmed' : 'Probable'

    // check img url
    let preUrl = ''
    if (process.env.DEV) {
      preUrl = '//webserver.mosquitoalert.com'
    }
    json.photo_url = preUrl + json.photo_url
    context.commit('selectFeature', json)
  })
}
