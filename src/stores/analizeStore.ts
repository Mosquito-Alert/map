import { defineStore } from 'pinia'
import wdk from 'wikibase-sdk/wikidata.org'

export enum toolsEnum {
  CLICK = 'click',
  SEARCH = 'search',
  DRAW = 'draw',
}

export const useAnalizeStore = defineStore('analize', {
  state: () => ({
    toolSelected: toolsEnum.CLICK,
    selectedRegion: {} as GeoJSON.FeatureCollection,
    populationOfSelectedRegion: null as number | null,
    extensionOfSelectedRegion: null as number | null,
  }),
  getters: {
    isRegionSelected: (state) => Object.keys(state.selectedRegion).length > 0,
  },
  actions: {
    async getDataOfRegion() {
      const wikidataId = this.selectedRegion.features[0]?.properties?.extratags?.wikidata
      if (!wikidataId) {
        this.populationOfSelectedRegion = null
        return
      }
      // * POPULATION: P1082
      const sparqlQueryPopulation = `SELECT * WHERE { wd:${wikidataId} wdt:P1082 ?population }`

      const responsePopulation = await fetch(wdk.sparqlQuery(sparqlQueryPopulation))
      const dataPopulation = await responsePopulation.json()
      const population = dataPopulation.results.bindings[0]?.population?.value
      this.populationOfSelectedRegion = population ? parseInt(population) : null

      // * EXTENSION: P2046 (km2)
      const sparqlQueryExtension = `SELECT * WHERE { wd:${wikidataId} wdt:P2046 ?extension }`
      const urlExtension = wdk.sparqlQuery(sparqlQueryExtension)

      const responseExtension = await fetch(urlExtension)
      const dataExtension = await responseExtension.json()
      const extension = dataExtension.results.bindings[0]?.extension?.value
      this.extensionOfSelectedRegion = extension ? parseFloat(extension) : null
    },
    clearSelectedRegion() {
      this.selectedRegion = {} as GeoJSON.FeatureCollection
      this.populationOfSelectedRegion = null
      this.extensionOfSelectedRegion = null
    },
  },
})
