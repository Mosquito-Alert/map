export default function () {
  return {
    DEFAULTS: {
      ZOOM: 5,
      CENTER: [13.6889, 44.8409]
      // ZOOM: 17,
      // CENTER: [2.813930487775805, 41.97837835421166]
      // CENTER: [4.848618507385254, 52.380792836403685]
    },
    maxZoom: 19,
    features: [],
    selectedFeature: null,
    activeLayers: [],
    samplingEffortLoading: false,
    datesRange: { from: '', to: '' },
    mapDates: { from: '', to: '' },
    titles: {
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
    },
    latinNames: {
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
  }
}
