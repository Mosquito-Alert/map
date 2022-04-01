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
    breeding_site_other: 'Breeding site other',
    bite: 'Bites'
  }
  const latinNames = {
    mosquito_tiger_confirmed: 'Aedes albopictus',
    mosquito_tiger_probable: 'Aedes albopictus',
    yellow_fever_confirmed: 'Aedes aegypti',
    yellow_fever_probable: 'Aedes aegypti',
    japonicus_confirmed: 'Aedes japonicus',
    japonicus_probable: 'Aedes japonicus',
    culex_confirmed: 'Culex pipens',
    culex_probable: 'Culex pipens',
    koreicus_confirmed: 'Aedes koreicus',
    koreicus_probable: 'Aedes koreicus'
  }

  fetch(url).then(response => response.json()).then(json => {
    json.coordinates = feature.geometry.flatCoordinates

    if (!('validation_type' in json)) {
      json.validation_type = 'human'
    }
    if (json.private_webmap_layer in latinNames) {
      json.latinName = latinNames[json.private_webmap_layer]
    }
    // format title based on observation type
    if (json.type.toLowerCase() === 'bite') {
      json.title = titles.bite
    } else if (json.type.toLowerCase() === 'site') {
      json.title = titles[json.private_webmap_layer]
    } else if (json.type.toLowerCase() === 'adult') {
      json.title = titles[json.private_webmap_layer]
      json.validation = (json.private_webmap_layer.toLowerCase().indexOf('confirmed') > -1) ? 'Confirmed' : 'Probable'
    }

    // Format object based on private_webmap_layer
    if (json.private_webmap_layer.toLowerCase() === 'storm_drain_water' ||
        json.private_webmap_layer.toLowerCase() === 'storm_drain_dry'
    ) {
      json.withWater = ''
    }
    if (json.private_webmap_layer.toLowerCase() === 'storm_drain_water') {
      json.withLarva = json.formatedResponses.with_larva
    }
    if (json.private_webmap_layer.toLowerCase() === 'breeding_site_other') {
      json.withWater = json.formatedResponses.with_water
      json.withLarva = json.formatedResponses.with_larva
    }
    // if bite
    if (json.type.toLowerCase() === 'bite') {
      json.howMany = json.formatedResponses.howManyBites
      json.bodyPart = json.formatedResponses.bodyPart
      json.location = json.formatedResponses.location
      json.biteTime = json.formatedResponses.biteTime
    }

    // check img url
    const preUrl = '//webserver.mosquitoalert.com'
    if (json.photo_url !== '') {
      json.photo_url = preUrl + json.photo_url
    }
    context.commit('selectFeature', json)
  })
}
