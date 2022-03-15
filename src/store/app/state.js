export default function () {
  let backendUrl = ''
  if (process.env.DEV) {
    backendUrl = 'http://localhost:8000/'
  } else {
    backendUrl = 'https://sigserver4.udg.edu/apps/mosquito2_backend/'
  }
  // first language is default
  const allowedLangs = ['en', 'es', 'ca']
  const browserLang = navigator.language.toLowerCase().substring(0, 2)
  const defaultLang = (allowedLangs.includes(browserLang)) ? browserLang : allowedLangs[0]
  return {
    lang: defaultLang,
    DEFAULTS: {
      LAYERS: [
        { type: 'observations', code: 'tiger' }
        // {type: 'observations', code: 'other'}
      ],
      INFO_OPEN: true
    },
    BACKEND: backendUrl,
    trans: {},
    modals: {
      info: false
    },
    selectedIcons: {
      mosquito_tiger_confirmed: require('../../assets/img/marker_tiger_selected.svg'),
      mosquito_tiger_probable: require('../../assets/img/marker_tiger_selected.svg'),
      yellow_fever_confirmed: require('../../assets/img/marker_yellow_selected.svg'),
      yellow_fever_probable: require('../../assets/img/marker_yellow_selected.svg'),
      japonicus_confirmed: require('../../assets/img/marker_japonicus_selected.svg'),
      japonicus_probable: require('../../assets/img/marker_japonicus_selected.svg'),
      culex_confirmed: require('../../assets/img/marker_culex_selected.svg'),
      culex_probable: require('../../assets/img/marker_culex_selected.svg'),
      koreicus_confirmed: require('../../assets/img/marker_koreicus_selected.svg'),
      koreicus_probable: require('../../assets/img/marker_koreicus_selected.svg'),
      albopictus_cretinus: require('../../assets/img/marker_selected.svg'),
      unidentified: require('../../assets/img/marker_unidentified_selected.svg'),
      other_species: require('../../assets/img/marker_other_selected.svg'),
      japonicus_koreicus: require('../../assets/img/marker_selected.svg'),
      not_yet_validated: require('../../assets/img/marker_selected.svg'),
      trash_layer: require('../../assets/img/marker_selected.svg'),
      storm_drain_water: require('../../assets/img/storm_drain_water_selected.svg'),
      storm_drain_dry: require('../../assets/img/storm_drain_dry_selected.svg'),
      breeding_site_other: require('../../assets/img/breeding_not_yet_filtered_selected.svg'),
      breeding_site_not_yet_filtered: require('../../assets/img/breeding_not_yet_filtered_selected.svg'),
      conflict: require('../../assets/img/marker_koreicus_japonicus_selected.svg')
    },
    layers: {
      observations: { // Mosquito observations
        tiger: {
          categories: ['mosquito_tiger_probable', 'mosquito_tiger_confirmed'],
          common_name: 'Tiger mosquito',
          scientific_name: 'Aedes albopictus',
          icon: require('../../assets/img/marker_tiger.svg')
        },
        yellow: {
          categories: ['yellow_fever_probable', 'yellow_fever_confirmed'],
          common_name: 'Yellow fever mosquito',
          scientific_name: 'Aedes aegypti',
          icon: require('../../assets/img/marker_yellow.svg')
        },
        japonicus: {
          categories: ['japonicus_probable', 'japonicus_confirmed', 'japonicus_koreicus'],
          common_name: 'Japonicus mosquito',
          scientific_name: 'Aedes japonicus',
          icon: require('../../assets/img/marker_japonicus.svg'),
          iconConflict: require('../../assets/img/marker_japonicus_koreicus.svg')
        },
        koreicus: {
          categories: ['koreicus_probable', 'koreicus_confirmed', 'japonicus_koreicus'],
          common_name: 'Koreicus mosquito',
          scientific_name: 'Aedes koreicus',
          icon: require('../../assets/img/marker_koreicus.svg'),
          iconConflict: require('../../assets/img/marker_japonicus_koreicus.svg')
        },
        culex: {
          categories: ['culex_probable', 'culex_confirmed'],
          common_name: 'Culex mosquito',
          scientific_name: 'Culex pipens',
          icon: require('../../assets/img/marker_culex.svg'),
          separator: true
        },
        unidentified: {
          categories: ['unidentified'],
          common_name: 'Unidentified mosquito',
          icon: require('../../assets/img/marker_unidentified.svg')
        }
      },
      otherObservations: {
        other: {
          categories: ['other_species'],
          common_name: 'Other species',
          icon: require('../../assets/img/marker_other.svg')
        }
      },
      bites: { // Bites
        pending: {
          categories: ['bites'],
          icon: require('../../assets/img/storm_drain_water.svg'),
          faIcon: 'fa-solid fa-child',
          common_name: 'Bites'
        }
      },
      breeding: { // Breeding sites
        with_water: {
          categories: ['storm_drain_water'],
          icon: require('../../assets/img/storm_drain_water.svg'),
          faIcon: 'fa-solid fa-droplet',
          common_name: 'Stormdrain with water'
        },
        without_water: {
          categories: ['storm_drain_dry'],
          icon: require('../../assets/img/storm_drain_dry.svg'),
          faIcon: 'fa-solid fa-droplet-slash',
          common_name: 'Stormdrain without water'
        },
        other: {
          categories: ['breeding_site_other'],
          icon: require('../../assets/img/breeding_not_yet_filtered.svg'),
          faIcon: 'fa-light fa-dharmachakra',
          common_name: 'Breeding site others'
        }
      },
      storm_drain: { // Storm drain
        water: {
          categories: ['storm_drain_water'],
          icons: []
        },
        dry: {
          categories: ['storm_drain_dry'],
          icons: []
        }
      },
      other: { // ??
        conflict: {
          categories: ['conflict'],
          icons: []
        }
      },
      sampling_effort: {
        legend: {
          0: '#ffffb2',
          10: '#fecc5c',
          100: '#fd8d3c',
          1000: '#f03b20',
          1500: '#bd0026'
        }
      }
    }
  }
}
