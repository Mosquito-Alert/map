import { defineStore } from 'pinia'
import { MosquitoLayersEnum, VariablesLayersEnum } from '../utils/constants'

export const useMapStore = defineStore('map', {
  state: () => ({
    showDiscoveries: false,
    layerSelected: MosquitoLayersEnum.observations as MosquitoLayersEnum,
    variablesSelected: [] as VariablesLayersEnum[],
  }),
})
