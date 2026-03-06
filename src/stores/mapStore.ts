import { cellToBoundary, latLngToCell } from 'h3-js'
import { defineStore } from 'pinia'
import { MosquitoLayersEnum, VariablesLayersEnum } from '../utils/constants'
import type { BasemapType } from '../utils/mapControls/MapBaseLayerControl'
import { markRaw, shallowRef } from 'vue'
import type { Map } from 'maplibre-gl'

export const useMapStore = defineStore('map', {
  state: () => ({
    map: shallowRef<Map | null>(null), // Shallow ref to optimize performance of deep reactivity
    showDiscoveries: false,
    showLegend: false,
    mapLoaded: false,
    baselayer: {} as BasemapType,
    globeView: true,
    layerSelected: MosquitoLayersEnum.observations as MosquitoLayersEnum,
    variablesSelected: [] as VariablesLayersEnum[],
    hex_data: {} as Record<string, any>,
    dataDateCount: {} as Record<string, number>,
    // Map config
    resolutionsAvailable: [4, 5, 6],
    observationsPointsSourceId: 'observationsSource',
    observationsPointsLayerId: 'observationPointsLayer',
    nearObservationsCircleSourceId: 'radius-near-observations',
    nearObservationsCircleLayerId: 'radius-near-observations-layer',
    centerSourceId: 'radius-center-point',
    centerLayerId: 'radius-center-point-layer',
  }),
  getters: {
    getH3SourceId: (state) => (resolution: number) => `h3-res-${resolution}`,
    getH3LayerId: (state) => (resolution: number) => `h3-layer-res-${resolution}`,
    getGbifSourceId: (state) => (gbifId: string) => `distribution-${gbifId}`,
    getGbifLayerId: (state) => (gbifId: string) => `distribution-layer-${gbifId}`,
  },
  actions: {
    setMap(instance: Map) {
      this.map = markRaw(instance)
    },
  },
})
