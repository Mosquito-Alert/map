export default function () {
  let backendUrl = ''
  if (process.env.DEV) {
    backendUrl = 'http://localhost:8000/'
  } else {
    backendUrl = 'https://sigserver4.udg.edu/apps/mosquito2_backend/'
  }

  return {
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
    selectedIcon: require('../../assets/img/marker_selected.svg'),
    layers: {
      observations: { // Mosquito observations
        tiger: {
          categories: ['mosquito_tiger_probable', 'mosquito_tiger_confirmed'],
          common_name: 'tiger mosquito',
          scientific_name: 'Aedes albopictus',
          icon: require('../../assets/img/marker_tiger.svg')
        },
        yellow: {
          categories: ['yellow_fever_probable', 'yellow_fever_confirmed'],
          common_name: 'yellow fever mosquito',
          scientific_name: 'Aedes aegypti',
          icon: require('../../assets/img/marker_yellow.svg')
        },
        japonicus: {
          categories: ['japonicus_probable', 'japonicus_confirmed'],
          common_name: 'japonicus mosquito',
          scientific_name: 'Aedes japonicus',
          icon: require('../../assets/img/marker_japonicus.svg')
        },
        koreicus: {
          categories: ['koreicus_probable', 'koreicus_confirmed'],
          common_name: 'koreicus mosquito',
          scientific_name: 'Aedes koreicus',
          icon: require('../../assets/img/marker_koreicus.svg')
        },
        culex: {
          categories: ['culex_probable', 'culex_confirmed'],
          common_name: 'culex mosquito',
          scientific_name: 'Culex pipens',
          icon: require('../../assets/img/marker_culex.svg'),
          separator: true
        },
        unidentified: {
          categories: ['unidentified'],
          common_name: 'unidentified mosquito',
          icon: require('../../assets/img/marker_unidentified.svg')
        }
      },
      otherObservations: {
        other: {
          categories: ['other_species'],
          common_name: 'other species',
          icon: require('../../assets/img/marker_other.svg')
        }
      },
      bites: { // Bites
        pending: {
          categories: ['breeding_site_not_yet_filtered'],
          icon: 'icons/marker_tiger.svg',
          common_name: 'bites'
        }
      },
      breeding: { // Breeding sites
        with_water: {
          categories: ['storm_drain_water'],
          icon: require('../../assets/img/droplet-solid.svg'),
          faIcon: 'fa-droplet',
          common_name: 'stormdrain with water'
        },
        without_water: {
          categories: ['storm_drain_dry'],
          icon: require('../../assets/img/droplet-slash-solid.svg'),
          faIcon: 'fa-droplet-slash',
          common_name: 'stormdrain without water'
        },
        other: {
          categories: ['breeding_site_other'],
          icon: require('../../assets/img/dharmachakra-solid.svg'),
          faIcon: 'fa-dharmachakra',
          common_name: 'breeding site others'
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
