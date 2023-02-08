export const defaultObservations = [
  { type: 'observations', code: 'tiger' },
  { type: 'observations', code: 'tiger_probable' },
  { type: 'observations', code: 'culex' },
  { type: 'observations', code: 'culex_probable' }
]

export const observations = {
  confirmed_probable: ['tiger', 'culex', 'koreicus', 'japonicus'],
  observations: { // Mosquito observations
    tiger: {
      categories: ['mosquito_tiger_confirmed', 'albopictus_cretinus'],
      common_name: 'Tiger mosquito confirmed',
      scientific_name: 'Aedes albopictus',
      icon: require('../../assets/img/marker_tiger.svg'),
      iconConflict: require('../../assets/img/marker_tiger_cretinus.svg'),
      color: '#4d4d4d'
    },
    tiger_probable: {
      categories: ['mosquito_tiger_probable'],
      common_name: 'Tiger mosquito possible',
      scientific_name: 'Aedes albopictus',
      icon: require('../../assets/img/marker_tiger_probable.svg'),
      iconConflict: require('../../assets/img/marker_tiger_cretinus.svg'),
      color: '#4d4d4d'
    },
    yellow: {
      categories: ['yellow_fever_confirmed'],
      common_name: 'Yellow fever mosquito confirmed',
      scientific_name: 'Aedes aegypti',
      icon: require('../../assets/img/marker_yellow.svg'),
      color: '#ffdd19'
    },
    yellow_probable: {
      categories: ['yellow_fever_probable'],
      common_name: 'Yellow fever mosquito possible',
      scientific_name: 'Aedes aegypti',
      icon: require('../../assets/img/marker_yellow_probable.svg'),
      color: '#ffdd19'
    },
    japonicus: {
      categories: ['japonicus_confirmed', 'japonicus_koreicus'],
      common_name: 'Japonicus mosquito confirmed',
      scientific_name: 'Aedes japonicus',
      icon: require('../../assets/img/marker_japonicus.svg'),
      iconConflict: require('../../assets/img/marker_japonicus_koreicus.svg'),
      color: '#49a999'
    },
    japonicus_probable: {
      categories: ['japonicus_probable'],
      common_name: 'Japonicus mosquito possible',
      scientific_name: 'Aedes japonicus',
      icon: require('../../assets/img/marker_japonicus_probable.svg'),
      iconConflict: require('../../assets/img/marker_japonicus_koreicus.svg'),
      color: '#49a999'
    },
    koreicus: {
      categories: ['koreicus_confirmed', 'japonicus_koreicus'],
      common_name: 'Koreicus mosquito confirmed',
      scientific_name: 'Aedes koreicus',
      icon: require('../../assets/img/marker_koreicus.svg'),
      iconConflict: require('../../assets/img/marker_japonicus_koreicus.svg'),
      color: '#499fff'
    },
    koreicus_probable: {
      categories: ['koreicus_probable'],
      common_name: 'Koreicus mosquito possible',
      scientific_name: 'Aedes koreicus',
      icon: require('../../assets/img/marker_koreicus_probable.svg'),
      iconConflict: require('../../assets/img/marker_japonicus_koreicus.svg'),
      color: '#499fff'
    },
    culex: {
      categories: ['culex_confirmed'],
      common_name: 'Culex mosquito confirmed',
      scientific_name: 'Culex pipiens',
      icon: require('../../assets/img/marker_culex.svg'),
      color: '#aa4499',
      separator: true
    },
    culex_probable: {
      categories: ['culex_probable'],
      common_name: 'Culex mosquito possible',
      scientific_name: 'Culex pipiens',
      icon: require('../../assets/img/marker_culex_probable.svg'),
      color: '#aa6099',
      separator: true
    },
    unidentified: {
      categories: ['unidentified'],
      common_name: 'Unidentified mosquito',
      icon: require('../../assets/img/marker_unidentified.svg'),
      color: '#c0c0c0'
    },
    not_yet_validated: {
      categories: ['not_yet_validated'],
      common_name: 'No validat',
      icon: require('../../assets/img/marker_not_yet_validated.svg'),
      color: '#c0c0c0'
    }
  },
  otherObservations: {
    other: {
      categories: ['other_species'],
      common_name: 'Other species',
      icon: require('../../assets/img/marker_other.svg'),
      color: '#c0c0c0'
    }
  },
  bites: { // Bites
    pending: {
      categories: ['bite'],
      icon: require('../../assets/img/marker_bite.svg'),
      faIcon: 'fa-solid fa-child-reaching bites',
      common_name: 'Bites',
      color: '#cc6677'
    }
  },
  breeding: { // Breeding sites
    with_water: {
      categories: ['storm_drain_water'],
      icon: require('../../assets/img/storm_drain_water.svg'),
      faIcon: 'fa-solid fa-droplet breeding',
      common_name: 'Stormdrain with water',
      color: '#1072ad'
    },
    without_water: {
      categories: ['storm_drain_dry'],
      icon: require('../../assets/img/storm_drain_dry.svg'),
      faIcon: 'fa-solid fa-droplet-slash breeding',
      common_name: 'Stormdrain without water',
      color: '#1072ad'
    },
    other_water: {
      categories: ['breeding_site_other'],
      icon: require('../../assets/img/breeding_other.svg'),
      faIcon: 'fa-light fa-dharmachakra breeding',
      common_name: 'Breeding site other',
      color: '#1072ad'
    },
    not_validated: {
      categories: ['breeding_site_not_yet_filtered'],
      icon: require('../../assets/img/breeding_not_validated.svg'),
      faIcon: 'fa-solid fa-droplet-degree breeding',
      common_name: 'Breeding not validated',
      color: '#1072ad'
    }
  },
  other: { // ??
    conflict: {
      // categories: ['conflict'],
      icon: require('../../assets/img/marker_other.svg')
    }
  },
  sampling_effort: {
    legend: [
      { from: 0, to: 10, color: '#ffffb266' },
      { from: 10, to: 100, color: '#fd8d3c66' },
      { from: 100, to: 1000, color: '#f03b2066' },
      { from: 1000, to: Infinity, color: '#bd002666' }
    ]
  }
}
