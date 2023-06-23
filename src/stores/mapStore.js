
// import * as getters from './app/getters'
// import * as actions from './app/actions'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useAppStore } from './appStore.js'
import { transform } from 'ol/proj.js'
import FormatObservation from '../js/FormatObservation'
import { StatusCodes as STATUS_CODES } from 'http-status-codes'

export const useMapStore = defineStore('map', {
  state: () => ({
    firstViewMap: true,
    indexingOn: false,
    viewbox: [],
    selectedFeature: {},
    titles: {
      mosquito_tiger_confirmed: 'Tiger mosquito',
      mosquito_tiger_probable: 'Tiger mosquito',
      yellow_fever_confirmed: 'Yellow fever mosquito',
      yellow_fever_probable: 'Yellow fever mosquito',
      japonicus_confirmed: 'Japonicus mosquito',
      japonicus_probable: 'Japonicus mosquito',
      culex_confirmed: 'Culex mosquito',
      culex_probable: 'Culex mosquito',
      koreicus_confirmed: 'Koreicus mosquito',
      koreicus_probable: 'Koreicus mosquito',
      albopictus_cretinus: 'Mosquito albopictus/cretinus',
      unidentified: 'Unidentified mosquito',
      other_species: 'Other species',
      conflict: 'Conflict',
      japonicus_koreicus: 'Mosquito japonicus/koreicus',
      not_yet_validated: 'Not_yet_validated',
      trash_layer: 'Trash',
      storm_drain_dry: 'Stormdrain without water',
      storm_drain_water: 'Stormdrain with water',
      breeding_site_not_yet_filtered: 'Breeding_site_not_yet_filtered',
      breeding_site_other: 'Breeding site other',
      bite: 'Bites'
    },
    latinNames: {
      mosquito_tiger_confirmed: 'Aedes albopictus',
      mosquito_tiger_probable: 'Aedes albopictus',
      yellow_fever_confirmed: 'Aedes aegypti',
      yellow_fever_probable: 'Aedes aegypti',
      japonicus_confirmed: 'Aedes japonicus',
      japonicus_probable: 'Aedes japonicus',
      culex_confirmed: 'Culex pipiens',
      culex_probable: 'Culex pipiens',
      koreicus_confirmed: 'Aedes koreicus',
      koreicus_probable: 'Aedes koreicus',
      japonicus_koreicus: 'Aedes japonicus/koreicus',
      albopictus_cretinus: 'Aedes albopictus/cretinus'
    },
    activeLayers: [],
    samplingEffortLoading: false,
    minMaxDates: { min: '', max: '' },
    CURRENTS: {
      ZOOM: 3,
      CENTER: [13.6889, 44.8409],
      MOBILEZOOM: 1
    },
    DEFAULTS: {
      ZOOM: 3,
      CENTER: [13.6889, 44.8409],
      MOBILEZOOM: 1,
      length: 4
    },
    mapDates: { from: '', to: '' },
    maxZoom: 19
  }),

  getters: {
    getViewbox (state) {
      return state.viewbox
    },
    getTitles (state) {
      return state.titles
    },
    getLatinNames (state) {
      return state.latinNames
    },
    getSelectedFeature (state) {
      return state.selectedFeature
    },
    getActiveLayers (state) {
      return state.activeLayers
    },
    getSamplingEffortLoading (state) {
      return this.samplingEffortLoading
    },
    getMapDates (state) {
      return state.mapDates
    },
    getCurrents (state) {
      return state.CURRENTS
    },
    getDefault (state) {
      return state.DEFAULTS
    },
    getMaxZoom (state) {
      return state.maxZoom
    }
  },

  actions: {
    selectFeature (feature) {
      this.selectedFeature = feature
    },
    setLeftMenuToggling (payload) {
      this.leftMenuToggling = payload
    },
    setIndexingOn (value) {
      this.indexingOn = value
    },
    selectOneFeatureMap (id) {
      const root = useAppStore().getBackend
      const titles = this.getTitles
      const latinNames = this.getLatinNames
      const url = root + 'api/get_observation/' + id + '/'

      axios(url, {
        withCredentials: true
      })
        .then(resp => {
          if (resp.status !== STATUS_CODES.OK) {
            useAppStore.setModal({
              id: 'error',
              content: {
                visibility: true,
                msg: resp.data.error
              }
            })
          } else {
            resp.data.coordinates = transform(
              [resp.data.lon, resp.data.lat],
              'EPSG:4326', 'EPSG:3857'
            )
            const formated = new FormatObservation(resp.data, titles, latinNames).format()
            this.selectFeature(formated)
          }
        })
    },
    setMapDates (payload) {
      this.mapDates.from = payload.from
      this.mapDates.to = payload.to
    },
    setCurrents (payload) {
      this.CURRENTS.ZOOM = payload.zoom
      this.CURRENTS.CENTER = payload.center
      this.CURRENTS.MOBILEZOOM = payload.zoom
    },
    setCenter (payload) {
      this.CURRENTS.CENTER = payload.center
    },
    setModelDate (payload) {
      this.modelDate = payload
    },
    setViewbox (payload) {
      this.viewbox = payload.map(Number)
    },
    setFirstViewMap (value) {
      this.firstViewMap = value
    },
    setSamplingEffortLoading (payload) {
      this.samplingEffortLoading = payload.loading
    },
    setMinMaxDates (payload) {
      this.minMaxDates.min = payload.min
      this.minMaxDates.max = payload.max
    },
    setDefaults (payload) {
      this.DEFAULTS.ZOOM = payload.zoom
      this.DEFAULTS.CENTER = payload.center
      this.DEFAULTS.MOBILEZOOM = payload.zoom
    }
  }
})
