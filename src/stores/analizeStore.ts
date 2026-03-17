import { defineStore } from 'pinia'

export enum toolsEnum {
  CLICK = 'click',
  SEARCH = 'search',
  DRAW = 'draw',
}

export const useAnalizeStore = defineStore('analize', {
  state: () => ({
    toolSelected: toolsEnum.CLICK,
    selectedRegion: {} as GeoJSON.FeatureCollection,
  }),
  actions: {},
})
