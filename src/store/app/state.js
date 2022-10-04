// const worker = new Worker('TheMapWorker.js')
import moment from 'moment'
import { useCookies } from 'vue3-cookies'

export default function () {
  let backendUrl = ''
  let frontendUrl = ''
  let analyticsCode
  const { cookies } = useCookies()

  if (process.env.DEV) {
    backendUrl = 'http://localhost:8000/'
    frontendUrl = 'http://localhost:8080/'
    analyticsCode = 'G-RT6ZXWX8PS'
  } else {
    backendUrl = 'https://sigserver4.udg.edu/apps/mosquito2_backend/'
    frontendUrl = 'https://sigserver4.udg.edu/mos/spa/'
    analyticsCode = 'G-ZLD12V4W3V'
  }
  // first language is default
  const allowedLangs = ['en', 'es', 'ca']
  const browserLang = navigator.language.toLowerCase().substring(0, 2)
  let defaultLang

  if (!cookies.get('lang')) {
    defaultLang = (allowedLangs.includes(browserLang)) ? browserLang : allowedLangs[0]
  } else {
    defaultLang = cookies.get('lang')
  }
  // FORCE SPANISH
  // const defaultLang = (allowedLangs.includes(browserLang)) ? 'es' : allowedLangs[0]

  function getCurrentYearDates () {
    return {
      from: moment().startOf('year').format('YYYY-MM-DD'),
      to: moment().format('YYYY-MM-DD')
    }
  }
  const mobile = () => {
    if (screen.width <= 760) {
      return true
    } else {
      return false
    }
  }

  const compliance = () => {
    if (cookies.get('cookie-comply')) {
      return true
    } else {
      return false
    }
  }

  return {
    // URL to log in the "old" private area. Same domain of current web is required
    authenticateUrl: '//sigserver4.udg.edu/apps/mosquito/tigapublic/ajax_login/',

    // URL of the public old web
    registeredWebUrl: 'https://sigserver4.udg.edu/mosquito/',

    // URL of model_manifest.csv file. This files includes a relation of available pregenerated models
    modelsManifestUrl: '//webserver.mosquitoalert.com/static/models/global_minimal_model_estimates/model_manifest.csv',

    // URL where models are available
    modelsUrl: '//webserver.mosquitoalert.com/static/models/global_minimal_model_estimates/',

    // URL of vector tiles
    tilesUrl: '//sigserver4.udg.edu/apps/mosquito2_backend/api/tiles',
    // tilesUrl: '//localhost:8000/api/tiles',

    // Grid size of cell format models
    gridsize: 0.025,

    // Google Analytics code
    analyticsId: analyticsCode,

    cookiesComply: compliance(),

    // Info about models.
    modelsProperties: {
      gadm0: {
        minZoom: 0,
        maxZoom: 0,
        id: 'ID_0', // id column name
        est: 'est', // estimation column name
        se: 'se' // uncertainty column name
      },
      gadm1: {
        minZoom: 0,
        maxZoom: 2,
        id: 'gid_1',
        est: 'est',
        se: 'se'
      },
      gadm2: {
        minZoom: 2,
        maxZoom: 4,
        id: 'gid_2',
        est: 'est',
        se: 'se'
      },
      gadm3: {
        minZoom: 4,
        maxZoom: 6,
        id: 'gid_3',
        est: 'est',
        se: 'se'
      },
      gadm4: {
        minZoom: 6,
        maxZoom: 9,
        id: 'gid_4',
        est: 'est',
        se: 'se'
      },
      grid: {
        minZoom: 9,
        maxZoom: 19,
        lon: 'lon',
        lat: 'lat',
        est: 'est',
        se: 'se'
      }
    },
    calendarSubtitle: '',
    isMobile: mobile(),
    pendingView: { extent: null },
    leftDrawerStatus: !mobile(),

    // Max number of reports available per request
    reportsLimit: 300,
    lang: defaultLang,
    isFilteringTag: false,
    DEFAULTS: {
      sampling_effort: true,
      observations: [
        { type: 'observations', code: 'tiger' },
        { type: 'observations', code: 'culex' }
      ],
      dates: [getCurrentYearDates()],
      hashtags: [],

      // Colors of selected administration boundaries
      fillLocationColor: 'rgb(239, 165, 1, 0.5)',
      strokeLocationColor: 'orange',

      // Default values for selected models
      model: {
        vector: '',
        year: '',
        month: '',
        estimation: true,
        uncertainty: true,
        // 0 - 100 values
        estimationTransparency: 0,
        uncertaintyTransparency: 75,
        // 0 - 1 values
        estimationOpacity: 1,
        uncertaintyOpacity: 0.25,
        // Default uncertainty color
        uncertaintyColor: '#191919',
        estimationColors: ['#fde725', '#9fda3a', '#4ac16d', '#1fa187', '#277f8e', '#365c8d'],
        modelsCsv: [],
        centroidsUrls: [],
        estimationPalettes: [
          // DIVERGENTS
          ['#fde725', '#9fda3a', '#4ac16d', '#1fa187', '#277f8e', '#365c8d'],
          ['#3288bd', '#99d594', '#e6f598', '#fee08b', '#fc8d59', '#d53e4f'],
          ['#1b7837', '#7fbf7b', '#d9f0d3', '#e7d4e8', '#af8dc3', '#762a83'],
          ['#1a9850', '#91cf60', '#d9ef8b', '#fee08b', '#fc8d59', '#d73027'],
          // GRADIENTS
          ['#fef0d9', '#fdd49e', '#fdbb84', '#fc8d59', '#e34a33', '#b30000'],
          ['#edf8e9', '#c7e9c0', '#a1d99b', '#74c476', '#31a354', '#006d2c']
        ]
      }
    },
    BACKEND: backendUrl,
    FRONTEND: frontendUrl,
    trans: {},

    // Default values for all modal windows
    modals: {
      cookieSettings: { visibility: false },
      cookiePolicy: { visibility: false },
      first: { visibility: !cookies.get('ma-visited') },
      info: { visibility: false },
      help: { visibility: false },
      download: { visibility: false, n: 0 },
      share: { visibility: false },
      report: { visibility: false, n: 0 },
      error: { visibility: false, msg: '', link: '' },
      wait: { visibility: false, seamless: false },
      login: { visibility: false }
    },

    // File locations of map selected icons
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
      trash_layer: require('../../assets/img/marker_selected.svg'),
      storm_drain_water: require('../../assets/img/storm_drain_water_selected.svg'),
      storm_drain_dry: require('../../assets/img/storm_drain_dry_selected.svg'),
      breeding_site_other: require('../../assets/img/breeding_other_selected.svg'),
      bite: require('../../assets/img/marker_bite_selected.svg')
    },

    // Info related with citizen observations (raw data)
    layers: {
      observations: { // Mosquito observations
        tiger: {
          categories: ['mosquito_tiger_probable', 'mosquito_tiger_confirmed'],
          common_name: 'Tiger mosquito',
          scientific_name: 'Aedes albopictus',
          icon: require('../../assets/img/marker_tiger.svg'),
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
          icon: require('../../assets/img/marker_unidentified.svg'),
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
    },

    // Info related with species and models
    models: {
      tiger: {
        categories: ['mosquito_tiger_probable', 'mosquito_tiger_confirmed'],
        common_name: 'Tiger mosquito',
        scientific_name: 'Aedes albopictus',
        icon: require('../../assets/img/marker_tiger.svg'),
        color: '#4d4d4d',
        modelName: 'albopictus'
      },
      yellow: {
        categories: ['yellow_fever_probable', 'yellow_fever_confirmed'],
        common_name: 'Yellow fever mosquito',
        scientific_name: 'Aedes aegypti',
        icon: require('../../assets/img/marker_yellow.svg'),
        color: '#ffdd19',
        modelName: 'aegypti'
      },
      japonicus: {
        categories: ['japonicus_probable', 'japonicus_confirmed', 'japonicus_koreicus'],
        common_name: 'Japonicus mosquito',
        scientific_name: 'Aedes japonicus',
        icon: require('../../assets/img/marker_japonicus.svg'),
        iconConflict: require('../../assets/img/marker_japonicus_koreicus.svg'),
        color: '#49a999',
        modelName: 'japonicus'
      },
      koreicus: {
        categories: ['koreicus_probable', 'koreicus_confirmed', 'japonicus_koreicus'],
        common_name: 'Koreicus mosquito',
        scientific_name: 'Aedes koreicus',
        icon: require('../../assets/img/marker_koreicus.svg'),
        iconConflict: require('../../assets/img/marker_japonicus_koreicus.svg'),
        color: '#499fff',
        modelName: 'koreicus'
      },
      culex: {
        categories: ['culex_probable', 'culex_confirmed'],
        common_name: 'Common mosquito',
        scientific_name: 'Culex pipens',
        icon: require('../../assets/img/marker_culex.svg'),
        color: '#aa4499',
        modelName: 'culex',
        separator: true
      },
      bites: { // Bites
        categories: ['bite'],
        icon: require('../../assets/img/marker_bite.svg'),
        faIcon: 'fa-solid fa-child-reaching bites',
        common_name: 'Bites',
        color: '#cc6677',
        modelName: 'biting'
      }
    }
  }
}
