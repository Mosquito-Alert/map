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
          common_name: 'Mosquito tiger',
          scientific_name: 'Aedes albopictus'
        },
        yellow: {
          categories: ['yellow_fever_probable', 'yellow_fever_confirmed'],
          common_name: 'Mosquito yellow',
          scientific_name: 'Aedes aegypti'
        },
        japonicus: {
          categories: ['japonicus_probable', 'japonicus_confirmed'],
          common_name: 'Mosquito japonicus',
          scientific_name: 'Aedes japonicus'
        },
        koreicus: {
          categories: ['koreicus_probable', 'koreicus_confirmed'],
          common_name: 'Mosquito koreicus',
          scientific_name: 'Aedes koreicus'
        },
        culex: {
          categories: ['culex_probable', 'culex_confirmed'],
          common_name: 'Mosquito culex',
          scientific_name: 'Culex pipens',
          separator: true
        },
        unidentified: {
          categories: ['unidentified'],
          common_name: 'Mosquito unidentified'
        }
      },
      other_observations: {
        other: {
          categories: ['other_species'],
          common_name: 'Mosquito others'
        }
        // pending: {
        //   categories: ['not_yet_validated'],
        //   icon: 'icons/marker_pending.svg',
        //   common_name: 'Mosquito pending'
        // },
        // trash: {
        //   categories: ['trash_layer'],
        //   icon: 'icons/marker_trash.svg',
        //   common_name: 'mosquito trash'
        // }
      },
      bites: { // Breeding sites
        pending: {
          categories: ['breeding_site_not_yet_filtered'],
          icon: 'icons/marker_tiger.svg',
          common_name: 'bites'
        }
      },
      breeding: { // Breeding sites
        with_water: {
          categories: ['breeding_site_not_yet_filtered'],
          icon: 'fa-droplet',
          common_name: 'Pending'
        },
        without_water: {
          categories: ['breeding_site_not_yet_filtered'],
          icon: 'fa-droplet-slash',
          common_name: 'Pending'
        },
        other: {
          categories: ['breeding_site_other'],
          icon: 'fa-dharmachakra',
          common_name: 'Other'
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
