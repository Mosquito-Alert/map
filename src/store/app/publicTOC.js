export const defaultObservations = [
  { type: 'observations', code: 'tiger' },
  { type: 'observations', code: 'culex' }
]

export const observations = {
  confirmed_probable: ['tiger', 'culex', 'koreicus', 'japonicus'],
  observations: { // Mosquito observations
    tiger: {
      categories: ['mosquito_tiger_confirmed', 'mosquito_tiger_probable', 'albopictus_cretinus'],
      common_name: 'Tiger mosquito',
      scientific_name: 'Aedes albopictus',
      icon: require('../../assets/img/marker_tiger.svg'),
      iconConflict: require('../../assets/img/marker_tiger_cretinus.svg'),
      color: '#4d4d4d',
      active: true
    },
    yellow: {
      categories: ['yellow_fever_confirmed', 'yellow_fever_probable'],
      common_name: 'Yellow fever mosquito',
      scientific_name: 'Aedes aegypti',
      icon: require('../../assets/img/marker_yellow.svg'),
      color: '#ffdd19',
      active: false
    },
    japonicus: {
      categories: ['japonicus_confirmed', 'japonicus_probable', 'japonicus_koreicus'],
      common_name: 'Japonicus mosquito',
      scientific_name: 'Aedes japonicus',
      icon: require('../../assets/img/marker_japonicus.svg'),
      iconConflict: require('../../assets/img/marker_japonicus_koreicus.svg'),
      color: '#49a999',
      active: false
    },
    koreicus: {
      categories: ['koreicus_confirmed', 'koreicus_probable', 'japonicus_koreicus'],
      common_name: 'Koreicus mosquito',
      scientific_name: 'Aedes koreicus',
      icon: require('../../assets/img/marker_koreicus.svg'),
      iconConflict: require('../../assets/img/marker_japonicus_koreicus.svg'),
      color: '#499fff',
      active: false
    },
    culex: {
      categories: ['culex_confirmed', 'culex_probable'],
      common_name: 'Culex mosquito confirmed',
      scientific_name: 'Culex pipiens',
      icon: require('../../assets/img/marker_culex.svg'),
      color: '#aa4499',
      separator: true,
      active: true
    },
    unidentified: {
      categories: ['unidentified'],
      common_name: 'Unidentified mosquito',
      icon: require('../../assets/img/marker_unidentified.svg'),
      color: '#c0c0c0',
      active: false
    }
  },
  otherObservations: {
    other: {
      categories: ['other_species'],
      common_name: 'Other species',
      icon: require('../../assets/img/marker_other.svg'),
      color: '#c0c0c0',
      active: false
    }
  },
  bites: { // Bites
    pending: {
      categories: ['bite'],
      icon: require('../../assets/img/marker_bite.svg'),
      faIcon: 'fa-solid fa-child-reaching bites',
      common_name: 'Bites',
      color: '#cc6677',
      active: false
    }
  },
  breeding: { // Breeding sites
    with_water: {
      categories: ['storm_drain_water'],
      icon: require('../../assets/img/storm_drain_water.svg'),
      faIcon: 'fa-solid fa-droplet breeding',
      common_name: 'Stormdrain with water',
      color: '#1072ad',
      active: false
    },
    without_water: {
      categories: ['storm_drain_dry'],
      icon: require('../../assets/img/storm_drain_dry.svg'),
      faIcon: 'fa-solid fa-droplet-slash breeding',
      common_name: 'Stormdrain without water',
      color: '#1072ad',
      active: false
    },
    other_water: {
      categories: ['breeding_site_other'],
      icon: require('../../assets/img/breeding_other.svg'),
      faIcon: 'fa-light fa-dharmachakra breeding',
      common_name: 'Breeding site other',
      color: '#1072ad',
      active: false
    }
  },
  other: { // ??
    conflict: {
      // categories: ['conflict'],
      icon: require('../../assets/img/marker_other.svg'),
      active: false
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
