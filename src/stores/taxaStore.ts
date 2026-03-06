import { defineStore } from 'pinia'
import { taxaApi } from '@/services/apiService'
import type { Taxon, TaxonTreeNode } from 'mosquito-alert'
import { summary as wikipediaSummary } from 'wikipedia'
import wdk from 'wikibase-sdk/wikidata.org'

type extendedTaxon = Taxon & { wikidataId?: string; gbifId?: string }

export const culicidaeTaxon = {
  id: 7,
  name: 'Culicidae',
  italicize: false,
  wikidataId: 'Q7367',
  gbifId: '3346',
} as extendedTaxon

export const useTaxaStore = defineStore('taxa', {
  state: () => ({
    taxaTree: null as TaxonTreeNode | null,
    relevantTaxa: [
      {
        id: 112,
        name: 'Aedes albopictus',
        italicize: true,
        wikidataId: 'Q477918',
        gbifId: '1651430',
      },
      {
        id: 113,
        name: 'Aedes aegypti',
        italicize: true,
        wikidataId: 'Q1148004',
        gbifId: '1651891',
      },
      {
        id: 114,
        name: 'Aedes japonicus',
        italicize: true,
        wikidataId: 'Q727942',
        gbifId: '1652212',
      },
      {
        id: 115,
        name: 'Aedes koreicus',
        italicize: true,
        wikidataId: 'Q9584686',
        gbifId: '1652150',
      },
      { id: 10, name: 'Culex', italicize: true, wikidataId: 'Q276595', gbifId: '1497010' },
    ] as extendedTaxon[],
    taxonSelected: culicidaeTaxon as extendedTaxon,
  }),
  actions: {
    async fetchCulicidaeTaxaTree() {
      try {
        const response = await taxaApi.treeRetrieve({ id: culicidaeTaxon.id })
        this.taxaTree = response.data
      } catch (error) {
        console.error('Failed to fetch Culicidae taxa tree:', error)
        throw error
      }
    },
    async getGbifIdForSelectedTaxon() {
      let { gbifId, wikidataId, name } = this.taxonSelected

      if (!gbifId) {
        if (!wikidataId) {
          const title = name.toLowerCase().replace(/ /g, '_')
          const summary = await wikipediaSummary(title)
          wikidataId = summary.wikibase_item as string
          this.taxonSelected.wikidataId = wikidataId
        }

        // P846 is the property for GBIF taxon ID in Wikidata
        const sparqlQuery = `SELECT * WHERE { wd:${wikidataId} wdt:P846 ?gbifId }`
        const url = wdk.sparqlQuery(sparqlQuery)

        const response = await fetch(url)
        const data = await response.json()
        gbifId = data.results.bindings[0]?.gbifId?.value

        this.taxonSelected.gbifId = gbifId
      }
      return gbifId
    },
  },
})
