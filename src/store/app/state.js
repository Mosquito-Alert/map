// const worker = new Worker('TheMapWorker.js')
import moment from 'moment'
import { useCookies } from 'vue3-cookies'
import { defaultObservations, observations as publicLayers } from './publicTOC'

export default function () {
  let backendUrl = ''
  let frontendUrl = ''
  let analyticsCode
  const { cookies } = useCookies()
  // const transparency = 'aa'
  function fnBrowserDetect () {
    const userAgent = navigator.userAgent
    let browserName
    if (userAgent.match(/chrome|chromium|crios/i)) {
      browserName = 'chrome'
    } else if (userAgent.match(/firefox|fxios/i)) {
      browserName = 'firefox'
    } else if (userAgent.match(/safari/i)) {
      browserName = 'safari'
    } else if (userAgent.match(/opr\//i)) {
      browserName = 'opera'
    } else if (userAgent.match(/edg/i)) {
      browserName = 'edge'
    } else {
      browserName = 'unknown'
    }
    return browserName
  }

  if (process.env.DEV) {
    backendUrl = 'api_v1_prod/' // See quasar.conf.js for proxy settings.
    frontendUrl = 'http://localhost:8080/'
    analyticsCode = 'GTM-M5PRMJ9'
  } else {
    backendUrl = 'https://api.mosquitoalert.com/v1/map/'
    frontendUrl = 'https://map.mosquitoalert.com/'
    analyticsCode = 'GTM-MQG3F3J'
  }
  // first language is default
  // Array order shows in page
  const allowedLangs = [
    { code: 'ca', label: 'Català' },
    { code: 'es', label: 'Castellano' },
    { code: 'en', label: 'English' }
  ]
  const browserLang = navigator.language.toLowerCase().substring(0, 2)
  let defaultLang
  const langKeys = allowedLangs.map(ele => {
    return ele.code
  })

  if (!cookies.get('lang')) {
    defaultLang = (langKeys.includes(browserLang)) ? browserLang : allowedLangs[0]
    cookies.set('lang', defaultLang)
  } else {
    defaultLang = cookies.get('lang')
  }

  // Add default lang to browser URL
  let currentUrl = document.location.toString()
  if (currentUrl.slice(-1) === '/') {
    currentUrl = currentUrl.slice(0, -1)
  }

  // FORCE SPANISH
  // const defaultLang = (allowedLangs.includes(browserLang)) ? 'es' : allowedLangs[0]

  function getCurrentYearDates () {
    return {
      from: moment(new Date(Date.now())).startOf('year').format('YYYY-MM-DD'),
      to: moment(new Date(Date.now())).format('YYYY-MM-DD')
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
    // Browser name
    allowedLangs: allowedLangs,
    csrfToken: null,
    authorized: false,
    errorMessage: '',
    wmsTabLayers: {},
    selectedWmsLayer: {},
    browser: fnBrowserDetect(),
    // URL to log in the "old" private area. Same domain of current web is required

    // authenticateUrl: '//localhost:8000/login/',
    logoutUrl: '//localhost:8000/logout/',

    // URL of the public old web
    authenticateUrl: 'https://webserver.mosquitoalert.com/tigapublic/ajax_login/',

    // URL of the public old web
    registeredWebUrl: 'https://webserver.mosquitoalert.com/',

    // URL of model_manifest.csv file. This files includes a relation of available pregenerated models
    modelsManifestUrl: 'https://webserver.mosquitoalert.com/static/models/global_minimal_model_estimates/model_manifest.csv',

    // URL where models are available
    modelsUrl: 'https://webserver.mosquitoalert.com/static/models/global_minimal_model_estimates/',

    // URL of vector tiles
    mapserverUrl: 'https://mapserver-ifca.mosquitoalert.com/geoserver/',
    tilesUrl: 'https://mapserver-ifca.mosquitoalert.com/geoserver/gwc/service/tms/1.0.0/',

    // Grid size of cell format models
    gridsize: 0.025,

    // Google Analytics code
    googleTagManagerId: analyticsCode,

    cookiesComply: compliance(),

    // Info about models.
    modelsProperties: {
      gadm0: {
        minZoom: undefined,
        maxZoom: 2,
        id: 'ID_0', // id column name
        est: 'est', // estimation column name
        se: 'se' // uncertainty column name
      },
      gadm1: {
        minZoom: undefined,
        maxZoom: 5,
        id: 'gid_1',
        est: 'est',
        se: 'se'
      },
      gadm2: {
        minZoom: 5,
        maxZoom: 6,
        id: 'gid_2',
        est: 'est',
        se: 'se'
      },
      gadm3: {
        minZoom: 6,
        maxZoom: 9,
        id: 'gid_3',
        est: 'est',
        se: 'se'
      },
      gadm4: {
        minZoom: 9,
        maxZoom: 19,
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
      sampling_effort: false,
      observations: defaultObservations,
      dates: [getCurrentYearDates()],
      hashtags: [],
      report_id: [],
      locations: [],

      // Colors of selected administration boundaries
      fillLocationColor: 'rgb(239, 165, 1, 0.5)',
      strokeLocationColor: 'orange'
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
      share: { visibility: false, url: '', error: '' },
      report: { visibility: false, n: 0 },
      error: { visibility: false, msg: '', link: '', redirection: false },
      wait: { visibility: false, seamless: false },
      login: { visibility: false },
      confirmLogout: { visibility: false },
      logos: { visibility: false }
    },

    // File locations of map selected icons
    selectedIcons: {
      mosquito_tiger_confirmed: require('../../assets/img/marker_tiger_selected.svg'),
      mosquito_tiger_probable: require('../../assets/img/marker_tiger_selected.svg'),
      albopictus_cretinus: require('../../assets/img/marker_tiger_selected.svg'),
      yellow_fever_confirmed: require('../../assets/img/marker_yellow_selected.svg'),
      yellow_fever_probable: require('../../assets/img/marker_yellow_selected.svg'),
      japonicus_confirmed: require('../../assets/img/marker_japonicus_selected.svg'),
      japonicus_probable: require('../../assets/img/marker_japonicus_selected.svg'),
      culex_confirmed: require('../../assets/img/marker_culex_selected.svg'),
      culex_probable: require('../../assets/img/marker_culex_selected.svg'),
      koreicus_confirmed: require('../../assets/img/marker_koreicus_selected.svg'),
      koreicus_probable: require('../../assets/img/marker_koreicus_selected.svg'),
      unidentified: require('../../assets/img/marker_unidentified_selected.svg'),
      other_species: require('../../assets/img/marker_other_selected.svg'),
      japonicus_koreicus: require('../../assets/img/marker_japonicus_koreicus_selected.svg'),
      trash_layer: require('../../assets/img/marker_selected.svg'),
      storm_drain_water: require('../../assets/img/storm_drain_water_selected.svg'),
      storm_drain_dry: require('../../assets/img/storm_drain_dry_selected.svg'),
      breeding_site_other: require('../../assets/img/breeding_other_selected.svg'),
      breeding_site_not_yet_filtered: require('../../assets/img/breeding_not_validated_selected.svg'),
      bite: require('../../assets/img/marker_bite_selected.svg')
    },

    // Info related with citizen observations (raw data)
    possibleCategories: ['tiger', 'yellow', 'japonicus', 'koreicus', 'culex'],
    confirmed_probable: ['tiger', 'culex', 'koreicus', 'japonicus'],
    layers: publicLayers,

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
        scientific_name: 'Culex pipiens',
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
    },
    // Early Warning
    earlyWarning: {
      specieCode: undefined,
      mapserverLayerName: 'mosquito_alert:early_warning'
    },
    encounterProbability: {
      specieCode: undefined,
      date: undefined,
      filters: {
        certaintyRange: {
          min: 0,
          max: 1
        }
      }
    }
  }
}
