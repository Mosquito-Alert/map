export default function () {
  return {
    DEFAULTS: {
      LAYERS: [
        { type: 'observations', code: 'tiger' }
        // {type: 'observations', code: 'other'}
      ],
      INFO_OPEN: true
    },
    BACKEND: 'http://localhost:8000/',
    trans: {},
    modals: {
      info: false
    },
    layers: {
      observations: { // Mosquito observations
        tiger: {
          categories: ['mosquito_tiger_probable', 'mosquito_tiger_confirmed'],
          common_name: 'tiger mosquito',
          scientific_name: 'Aedes albopictus',
          icon: 'icons/marker_tiger.svg'
        },
        yellow: {
          categories: ['yellow_fever_probable', 'yellow_fever_confirmed'],
          common_name: 'yellow fever mosquito',
          scientific_name: 'Aedes aegypti',
          icon: 'icons/marker_yellow.svg'
        },
        japonicus: {
          categories: ['japonicus_probable', 'japonicus_confirmed'],
          common_name: 'japonicus mosquito',
          scientific_name: 'Aedes japonicus',
          icon: 'icons/marker_japonicus.svg'
        },
        koreicus: {
          categories: ['koreicus_probable', 'koreicus_confirmed'],
          common_name: 'koreicus mosquito',
          scientific_name: 'Aedes koreicus',
          icon: 'icons/marker_koreicus.svg'
        },
        culex: {
          categories: ['culex_probable', 'culex_confirmed'],
          common_name: 'culex mosquito',
          scientific_name: 'Culex pipens',
          icon: 'icons/marker_culex.svg',
          separator: true
        },
        unidentified: {
          categories: ['unidentified'],
          common_name: 'unidentified mosquito',
          icon: 'icons/marker_unidentified.svg'
        }
      },
      other_observations: {
        other: {
          categories: ['other_species'],
          common_name: 'other species'
        }
      },
      bites: { // Bites
        pending: {
          categories: ['breeding_site_not_yet_filtered'],
          icon: 'icons/marker_tiger.svg',
          common_name: 'bites',
          separator: true
        }
      },
      breeding: { // Breeding sites
        with_water: {
          categories: ['breeding_site_not_yet_filtered'],
          icon: 'fa-droplet',
          common_name: 'stormdrain with water'
        },
        without_water: {
          categories: ['breeding_site_not_yet_filtered'],
          icon: 'fa-droplet-slash',
          common_name: 'stormdrain without water'
        },
        other: {
          categories: ['breeding_site_other'],
          icon: 'fa-dharmachakra',
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
