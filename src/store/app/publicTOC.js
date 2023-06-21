export const defaultObservations = [
  { type: 'observations', code: 'tiger' },
  { type: 'observations', code: 'culex' }
]

export const observations = {
  observations: { // Mosquito observations
    tiger: {
      categories: ['mosquito_tiger_confirmed', 'mosquito_tiger_probable', 'albopictus_cretinus'],
      common_name: 'Tiger mosquito',
      scientific_name: 'Aedes albopictus',
      icon: new URL(`/src/assets/img/marker_tiger.svg`, import.meta.url).href,
      iconConflict: new URL(`/src/assets/img/marker_tiger_cretinus.svg`, import.meta.url).href,
      color: '#4d4d4d',
      active: false
    },
    yellow: {
      categories: ['yellow_fever_confirmed', 'yellow_fever_probable'],
      common_name: 'Yellow fever mosquito',
      scientific_name: 'Aedes aegypti',
      icon: new URL(`/src/assets/img/marker_yellow.svg`, import.meta.url).href,
      color: '#ffdd19',
      active: false
    },
    japonicus: {
      categories: ['japonicus_confirmed', 'japonicus_probable', 'japonicus_koreicus'],
      common_name: 'Japonicus mosquito',
      scientific_name: 'Aedes japonicus',
      icon: new URL(`/src/assets/img/marker_japonicus.svg`, import.meta.url).href,
      iconConflict: new URL(`/src/assets/img/marker_japonicus_koreicus`, import.meta.url).href,
      color: '#49a999',
      active: false
    },
    koreicus: {
      categories: ['koreicus_confirmed', 'koreicus_probable', 'japonicus_koreicus'],
      common_name: 'Koreicus mosquito',
      scientific_name: 'Aedes koreicus',
      icon: new URL(`/src/assets/img/marker_koreicus.svg`, import.meta.url).href,
      iconConflict: new URL(`/src/assets/img/marker_japonicus_koreicus.svg`, import.meta.url).href,
      color: '#499fff',
      active: false
    },
    culex: {
      categories: ['culex_confirmed', 'culex_probable'],
      common_name: 'Culex mosquito',
      scientific_name: 'Culex pipiens',
      icon: new URL(`/src/assets/img/marker_culex.svg`, import.meta.url).href,
      color: '#aa4499',
      separator: true,
      active: false
    },
    unidentified: {
      categories: ['unidentified'],
      common_name: 'Unidentified mosquito',
      icon: new URL(`/src/assets/img/marker_unidentified.svg`, import.meta.url).href,
      color: '#c0c0c0',
      active: false
    }
  },
  otherObservations: {
    other: {
      categories: ['other_species'],
      common_name: 'Other species',
      icon: new URL(`/src/assets/img/marker_other.svg`, import.meta.url).href,
      color: '#c0c0c0',
      active: false
    }
  },
  bites: { // Bites
    bite: {
      categories: ['bite'],
      icon: new URL(`/src/assets/img/marker_bite.svg`, import.meta.url).href,
      faIcon: 'fa-solid fa-child-reaching bites',
      common_name: 'Bites',
      color: '#cc6677',
      active: false
    }
  },
  breeding: { // Breeding sites
    with_water: {
      categories: ['storm_drain_water'],
      icon: new URL(`/src/assets/img/storm_drain_water.svg`, import.meta.url).href,
      faIcon: 'fa-solid fa-droplet breeding',
      common_name: 'Stormdrain with water',
      color: '#1072ad',
      active: false
    },
    without_water: {
      categories: ['storm_drain_dry'],
      icon: new URL(`/src/assets/img/storm_drain_dry.svg`, import.meta.url).href,
      faIcon: 'fa-solid fa-droplet-slash breeding',
      common_name: 'Stormdrain without water',
      color: '#1072ad',
      active: false
    },
    other_water: {
      categories: ['breeding_site_other'],
      icon: new URL(`/src/assets/img/breeding_other.svg`, import.meta.url).href,
      faIcon: 'fa-light fa-dharmachakra breeding',
      common_name: 'Breeding site other',
      color: '#1072ad',
      active: false
    }
  },
  other: { // ??
    conflict: {
      // categories: ['conflict'],
      icon: new URL(`/src/assets/img/marker_other.svg`, import.meta.url).href,
      active: false
    }
  },
  sampling_effort: {
    sampling: {
      active: false,
      legend: [
        { from: 0, to: 10, color: '#ffffb266' },
        { from: 10, to: 100, color: '#fd8d3c66' },
        { from: 100, to: 1000, color: '#f03b2066' },
        { from: 1000, to: Infinity, color: '#bd002666' }
      ]
    }
  }
}
