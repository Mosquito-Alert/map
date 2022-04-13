const worker = new Worker('TheMapWorker.js')

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
      ],
      // DATES: { from: '2020/11/01', to: '2020/11/10' },
      DATES: { from: '2014/11/01', to: '2022/11/10' },
      HASHTAGS: [],
      // INFO_OPEN: false
      fillLocationColor: 'rgb(239, 165, 1, 0.5)',
      strokeLocationColor: 'orange'
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
      japonicus_koreicus: require('../../assets/img/marker_japonicus_koreicus_selected.svg'),
      // not_yet_validated: require('../../assets/img/marker_selected.svg'),
      trash_layer: require('../../assets/img/marker_selected.svg'),
      storm_drain_water: require('../../assets/img/storm_drain_water_selected.svg'),
      storm_drain_dry: require('../../assets/img/storm_drain_dry_selected.svg'),
      breeding_site_other: require('../../assets/img/breeding_other_selected.svg'),
      // breeding_site_not_yet_filtered: require('../../assets/img/breeding_other_selected.svg'),
      bite: require('../../assets/img/marker_bite_selected.svg')
    },
    worker,
    layers: {
      observations: { // Mosquito observations
        tiger: {
          categories: ['mosquito_tiger_probable', 'mosquito_tiger_confirmed'],
          common_name: 'Tiger mosquito',
          scientific_name: 'Aedes albopictus',
          icon: require('../../assets/img/marker_tiger35_45.svg'),
          color: '#4d4d4d'
        },
        yellow: {
          categories: ['yellow_fever_probable', 'yellow_fever_confirmed'],
          common_name: 'Yellow fever mosquito',
          scientific_name: 'Aedes aegypti',
          icon: require('../../assets/img/marker_yellow.svg'),
          color: '#ffdd19'
        },
        japonicus: {
          categories: ['japonicus_probable', 'japonicus_confirmed', 'japonicus_koreicus'],
          common_name: 'Japonicus mosquito',
          scientific_name: 'Aedes japonicus',
          icon: require('../../assets/img/marker_japonicus.svg'),
          iconConflict: require('../../assets/img/marker_japonicus_koreicus.svg'),
          color: '#49a999'
        },
        koreicus: {
          categories: ['koreicus_probable', 'koreicus_confirmed', 'japonicus_koreicus'],
          common_name: 'Koreicus mosquito',
          scientific_name: 'Aedes koreicus',
          icon: require('../../assets/img/marker_koreicus.svg'),
          iconConflict: require('../../assets/img/marker_japonicus_koreicus.svg'),
          color: '#499fff'
        },
        culex: {
          categories: ['culex_probable', 'culex_confirmed'],
          common_name: 'Culex mosquito',
          scientific_name: 'Culex pipens',
          icon: require('../../assets/img/marker_culex.svg'),
          color: '#aa4499',
          separator: true
        },
        unidentified: {
          categories: ['unidentified'],
          common_name: 'Unidentified mosquito',
          icon: require('../../assets/img/marker_unidentified35_45.svg'),
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
          common_name: 'Breeding site others',
          color: '#1072ad'
        }
      },
      // storm_drain: { // Storm drain
      //   water: {
      //     categories: ['storm_drain_water'],
      //     icons: []
      //   },
      //   dry: {
      //     categories: ['storm_drain_dry'],
      //     icons: []
      //   }
      // },
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
