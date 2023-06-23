// import * as getters from './app/getters'
// import * as actions from './app/actions'
import moment from 'moment'
import { useCookies } from 'vue3-cookies'
import { defineStore } from 'pinia'
import axios from 'axios'
import { defaultObservations as privateDefaultObservations, observations as privateLayers } from './app/privateTOC'
import { defaultObservations as publicDefaultObservations, observations as publicLayers } from './app/publicTOC'

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
  backendUrl = 'http://localhost:8000/'
  frontendUrl = 'http://localhost:8080/'
  // backendUrl = 'http://be.example.com:8000/'
  // frontendUrl = 'http://fe.example.com:8080/'
  analyticsCode = 'GTM-M5PRMJ9'
} else {
  backendUrl = 'https://sigserver4.udg.edu/apps/mosquito2_backend/'
  frontendUrl = 'https://sigserver4.udg.edu/mos/spa/'
  analyticsCode = 'GTM-M5PRMJ9'
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

if (langKeys.indexOf(currentUrl.toLowerCase().slice(-2)) === -1) {
  const nextURL = currentUrl + '/' + defaultLang
  const nextTitle = 'MosquitoAlert'
  const nextState = { additionalInformation: 'Updated the URL with JS' }
  window.history.pushState(nextState, nextTitle, nextURL)
  window.history.replaceState(nextState, nextTitle, nextURL)
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

export const useAppStore = defineStore('app', {
  state: () => ({
    mobile,
    browser: fnBrowserDetect(),
    pendingView: { extent: null },
    googleTagManagerId: analyticsCode,
    csrfToken: '',
    layers: publicLayers,
    trans: {},
    allowedLangs,
    lang: defaultLang,
    leftMenuTabs: {},
    backend: backendUrl,
    frontend: frontendUrl,
    authorized: false,
    cookiesComply: compliance(),
    leftDrawerStatus: !mobile(),
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
    isFilteringTag: false,
    possibleCategories: ['tiger', 'yellow', 'japonicus', 'koreicus', 'culex'],
    confirmed_probable: ['tiger', 'culex', 'koreicus', 'japonicus'],
    DEFAULTS: {
      sampling_effort: false,
      observations: publicDefaultObservations,
      dates: [getCurrentYearDates()],
      hashtags: [],
      report_id: [],
      locations: [],

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
        estimationColors: ['#3288bd', '#99d594', '#e6f598', '#fee08b', '#fc8d59', '#d53e4f'],
        modelsCsv: [],
        centroidsUrls: [],
        estimationPalettes: [
          // DIVERGENTS
          ['#3288bd', '#99d594', '#e6f598', '#fee08b', '#fc8d59', '#d53e4f'],
          ['#fde725', '#9fda3a', '#4ac16d', '#1fa187', '#277f8e', '#365c8d'],
          ['#1b7837', '#7fbf7b', '#d9f0d3', '#e7d4e8', '#af8dc3', '#762a83'],
          ['#1a9850', '#91cf60', '#d9ef8b', '#fee08b', '#fc8d59', '#d73027'],
          // GRADIENTS
          ['#fef0d9', '#fdd49e', '#fdbb84', '#fc8d59', '#e34a33', '#b30000'],
          ['#edf8e9', '#c7e9c0', '#a1d99b', '#74c476', '#31a354', '#006d2c']
        ]
      },
      calendarSubtitle: ''
    },
    selectedIcons: {
      mosquito_tiger_confirmed: new URL(`/src/assets/img/marker_tiger_selected.svg`, import.meta.url).href,
      mosquito_tiger_probable: new URL(`/src/assets/img/marker_tiger_selected.svg`, import.meta.url).href,
      albopictus_cretinus: new URL(`/src/assets/img/marker_tiger_selected.svg`, import.meta.url).href,
      yellow_fever_confirmed: new URL(`/src/assets/img/marker_yellow_selected.svg`, import.meta.url).href,
      yellow_fever_probable: new URL(`/src/assets/img/marker_yellow_selected.svg`, import.meta.url).href,
      japonicus_confirmed: new URL(`/src/assets/img/marker_japonicus_selected.svg`, import.meta.url).href,
      japonicus_probable: new URL(`/src/assets/img/marker_japonicus_selected.svg`, import.meta.url).href,
      culex_confirmed: new URL(`/src/assets/img/marker_culex_selected.svg`, import.meta.url).href,
      culex_probable: new URL(`/src/assets/img/marker_culex_selected.svg`, import.meta.url).href,
      koreicus_confirmed: new URL(`/src/assets/img/marker_koreicus_selected.svg`, import.meta.url).href,
      koreicus_probable: new URL(`/src/assets/img/marker_koreicus_selected.svg`, import.meta.url).href,
      unidentified: new URL(`/src/assets/img/marker_unidentified_selected.svg`, import.meta.url).href,
      other_species: new URL(`/src/assets/img/marker_other_selected.svg`, import.meta.url).href,
      japonicus_koreicus: new URL(`/src/assets/img/marker_japonicus_koreicus_selected.svg`, import.meta.url).href,
      trash_layer: new URL(`/src/assets/img/marker_selected.svg`, import.meta.url).href,
      storm_drain_water: new URL(`/src/assets/img/marker_selected.svg`, import.meta.url).href,
      storm_drain_dry: new URL(`/src/assets/img/storm_drain_dry_selected.svg`, import.meta.url).href,
      breeding_site_other: new URL(`/src/assets/img/breeding_other_selected.svg`, import.meta.url).href,
      breeding_site_not_yet_filtered: new URL(`/src/assets/img/breeding_not_validated_selected.svg`, import.meta.url).href,
      bite: new URL(`/src/assets/img/marker_bite_selected.svg`, import.meta.url).href
    },
    // Info related with species and models
    logoutUrl: '//localhost:8000/logout/',

    // URL of the public old web
    authenticateUrl: 'https://sigserver4.udg.edu/apps/mosquito_tigatrapp/tigapublic/ajax_login/',

    // URL of the public old web
    registeredWebUrl: 'https://sigserver4.udg.edu/mosquito/',

    // URL of model_manifest.csv file. This files includes a relation of available pregenerated models
    modelsManifestUrl: '//webserver.mosquitoalert.com/static/models/global_minimal_model_estimates/model_manifest.csv',

    // URL where models are available
    modelsUrl: '//webserver.mosquitoalert.com/static/models/global_minimal_model_estimates/',

    // URL of vector tiles
    tilesUrl: 'https://sigserver4.udg.edu/apps/mosquito2_backend/api/tiles',
    // tilesUrl: '//localhost:8000/api/tiles',

    // Grid size of cell format models
    gridsize: 0.025,
    models: {
      tiger: {
        categories: ['mosquito_tiger_probable', 'mosquito_tiger_confirmed'],
        common_name: 'Tiger mosquito',
        scientific_name: 'Aedes albopictus',
        icon: new URL('/src/assets/img/marker_tiger.svg', import.meta.url).href,
        color: '#4d4d4d',
        modelName: 'albopictus'
      },
      yellow: {
        categories: ['yellow_fever_probable', 'yellow_fever_confirmed'],
        common_name: 'Yellow fever mosquito',
        scientific_name: 'Aedes aegypti',
        icon: new URL('/src/assets/img/marker_yellow.svg', import.meta.url).href,
        color: '#ffdd19',
        modelName: 'aegypti'
      },
      japonicus: {
        categories: ['japonicus_probable', 'japonicus_confirmed', 'japonicus_koreicus'],
        common_name: 'Japonicus mosquito',
        scientific_name: 'Aedes japonicus',
        icon: new URL('/src/assets/img/marker_japonicus.svg', import.meta.url).href,
        iconConflict: new URL('/src/assets/img/marker_japonicus_koreicus.svg', import.meta.url).href,
        color: '#49a999',
        modelName: 'japonicus'
      },
      koreicus: {
        categories: ['koreicus_probable', 'koreicus_confirmed', 'japonicus_koreicus'],
        common_name: 'Koreicus mosquito',
        scientific_name: 'Aedes koreicus',
        icon: new URL('/src/assets/img/marker_koreicus.svg', import.meta.url).href,
        iconConflict: new URL('/src/assets/img/marker_japonicus_koreicus.svg', import.meta.url).href,
        color: '#499fff',
        modelName: 'koreicus'
      },
      culex: {
        categories: ['culex_probable', 'culex_confirmed'],
        common_name: 'Common mosquito',
        scientific_name: 'Culex pipiens',
        icon: new URL('/src/assets/img/marker_culex.svg', import.meta.url).href,
        color: '#aa4499',
        modelName: 'culex',
        separator: true
      },
      bites: { // Bites
        categories: ['bite'],
        icon: new URL('/src/assets/img/marker_bite.svg', import.meta.url).href,
        faIcon: 'fa-solid fa-child-reaching bites',
        common_name: 'Bites',
        color: '#cc6677',
        modelName: 'biting'
      }
    },
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
    // WMS RELATED
    getWmsDataFromServer: true,
    // SAMPLE STRUCTURE FOR wmswms: {
    // {

    //   tiger: [         // For every species
    //     {             // For every year
    //       id: 1, wms_id: 1, wms_url: "https://montesdata.creaf.cat/geoserver/SIPAN/wms",
    //       year: 2023, layer: "MASSA_AIGUA", visible: true, transparency: 0.0
    //     },....
    //   ],
    //   yellow[
    //     {....},
    //     {....},
    //   ]
    // }
    WMS: [],
    currentWMSView: {},
    wmsNumberOfVisibleLayers: 0,
    legendData: {}
  }),

  getters: {
    getGoogleTagManagerId (state) {
      return state.googleTagManagerId
    },
    getIsMobile (state) {
      return state.isMobile
    },
    getText (state) {
      return (text) => state.trans[text]
    },
    getLang (state) {
      return state.lang
    },
    getAllowedLangs (state) {
      return state.allowedLangs
    },
    getFrontend (state) {
      return state.frontend
    },
    getBackend (state) {
      return state.backend
    },
    getAuthorized (state) {
      return state.authorized
    },
    getLayers (state) {
      return state.layers
    },
    getModals (state) {
      return state.modals
    },
    getCsrfToken (state) {
      return state.csrfToken
    },
    getPossibleCategories (state) {
      return state.possibleCategories
    },
    getDefaults (state) {
      return state.DEFAULTS
    },
    getCookiesComply (state) {
      return state.cookiesComply
    },
    getLeftDrawerStatus (state) {
      return state.leftDrawerStatus
    },
    getPendingView (state) {
      return state.pendingView
    },
    getLeftMenuTabs (state) {
      return state.leftMenuTabs
    },
    getIsFilteringTag (state) {
      return state.isFilteringTag
    },
    getSelectedIcons (state) {
      return state.selectedIcons
    },
    getWmsData (state) {
      return state.WMS
    },
    getCurrentWMSView (state) {
      return state.currentWMSView
    },
    getModelDefaults (state) {
      return state.DEFAULTS.model
    },
    getEstimationColors (state) {
      return state.DEFAULTS.model.estimationColors
    },
    getUncertaintyColor (state) {
      return state.DEFAULTS.model.uncertaintyColor
    },
    getEstimationPalettes (state) {
      return state.DEFAULTS.model.estimationPalettes
    },
    getModels (state) {
      return state.models
    },
    getModelsUrl (state) {
      return state.modelsUrl
    },
    getModelsProperties (state) {
      return state.modelsProperties
    },
    getModelsManifestUrl (state) {
      return state.modelsManifestUrl
    },
    getTilesUrl (state) {
      return state.tilesUrl
    }
  },

  actions: {
    setInitData (lang) {
      this.lang = lang
      this.setTranslations()
    },
    setCsrfToken (token) {
      this.csrfToken = token
    },
    async setTranslations () {
      const _this = this
      const url = this.getBackend + 'translations/' + this.getLang + '/'
      await axios(url, {
        withCredentials: true
      }).then(function (resp) {
        _this.trans = resp.data.trans
        _this.leftMenuTabs = resp.data.config.tabs
        if (_this.getWmsDataFromServer) {
          _this.WMS = resp.data.config.wms
        }

        const key = Object.keys(resp.data.config.wms)[0]
        const layer = resp.data.config.wms[key][0]
        _this.legendData = {
          wms_url: layer.wms_url,
          layer: layer.layer
        }
        const registered = ('registered-user' in resp.data) ? resp.data['registered-user'] : false
        _this.authorized = registered
      })

      if (this.getAuthorized) {
        this.layers = privateLayers
        this.DEFAULTS.observations = privateDefaultObservations
      } else {
        this.layers = publicLayers
        this.DEFAULTS.observations = publicDefaultObservations
      }
    },
    setCookiesComply (value) {
      this.cookiesComply = value
    },
    setModal (payload) {
      this.modals[payload.id] = payload.content
    },
    setLayers (payload) {
      this.layers = payload
    },
    toggleLeftDrawerStatus () {
      this.leftDrawerStatus = !this.getLeftDrawerStatus
    },
    setFilteringTag (payload) {
      this.isFilteringTag = payload.value
    },
    setActiveLayer (payload) {
      this.layers[payload.type][payload.code].active = payload.active
    },
    setCalendarSubtitle (payload) {
      this.calendarSubtitle = payload
    },
    setDefaultSamplingEffort (payload) {
      this.DEFAULTS.sampling_effort = payload
    },
    setDefaultObservations (payload) {
      this.DEFAULTS.observations = payload
    },
    setDefaultDates (payload) {
      this.DEFAULTS.dates = payload
    },
    setDefaults (payload) {
      this.DEFAULTS.observations = payload.observations
      this.DEFAULTS.dates = payload.dates
      this.DEFAULTS.hashtags = payload.hashtags
    },
    setCurrentWMSView (payload) {
      this.currentWMSView = payload
    },
    wmsNumberOfVisibleLayers (state) {
      return this.wmsNumberOfVisibleLayers
    },
    legendData (state) {
      return state.legendData
    },
    setWmsNumberOfVisibleLayers (n) {
      this.wmsNumberOfVisibleLayers = n
    },
    increaseWmsNumberOfVisibleLayers () {
      this.wmsNumberOfVisibleLayers += 1
    },
    decreaseWmsNumberOfVisibleLayers () {
      this.wmsNumberOfVisibleLayers -= 1
    },
    setLegendData (payload) {
      this.legendData = payload
    },
    setWMSLayers (payload) {
      this.WMS[payload.species] = payload.layers
    },
    setModelDefaults (payload) {
      this.DEFAULTS.model = payload
    },
    setModelEstimation (payload) {
      this.DEFAULTS.model.estimation = payload
    },
    setModelUncertainty (payload) {
      this.DEFAULTS.model.uncertainty = payload
    },
    setUncertaintyColor (payload) {
      this.DEFAULTS.model.uncertaintyColor = payload
    },
    setEstimationTransparency (payload) {
      this.DEFAULTS.model.estimationTransparency = payload
      this.DEFAULTS.model.estimationOpacity = 1 - (payload / 100)
    },
    setUncertaintyTransparency (payload) {
      this.DEFAULTS.model.uncertaintyTransparency = payload
      this.DEFAULTS.model.uncertaintyOpacity = 1 - (payload / 100)
    },
    setEstimationColors (payload) {
      this.DEFAULTS.model.estimationColors = payload
    },
    deactivateLayerIcon (payload) {
      this.layers[payload.type][payload.code].active = false
    },
    setWmsProperties (payload) {
      const index = this.currentWMSView.years.findIndex((e) => {
        return e.id === payload.id
      })
      this.currentWMSView.years[index][payload.property] = payload.value
      this.WMS[payload.species][index][payload.property] = payload.value
    }
  }
})
