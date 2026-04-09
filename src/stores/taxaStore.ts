import { taxaApi } from '@/services/apiService'
import type { Taxon, TaxonTreeNode } from 'mosquito-alert'
import { defineStore } from 'pinia'
import wdk from 'wikibase-sdk/wikidata.org'
import { summary as wikipediaSummary } from 'wikipedia'

type extendedTaxon = Taxon & { wikidataId?: string; gbifId?: string }

export const mapDiscoveriesIdToTaxon = {
  10: 'culex_pipiens',
  112: 'albopictus',
  113: 'aegypti',
  114: 'japonicus',
  115: 'koreicus',
}
export const mapTaxonToDiscoveriesId = Object.fromEntries(
  Object.entries(mapDiscoveriesIdToTaxon).map(([key, value]) => [value, Number(key)]),
)

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
  getters: {
    // get discoveries taxon id for the currently selected taxon
    discoveriesTaxonId: (state) => {
      // TODO: Do it with the API. At least the ones that are not in the mapDiscoveriesIdToTaxon.
      return mapDiscoveriesIdToTaxon[state.taxonSelected.id as keyof typeof mapDiscoveriesIdToTaxon]
    },
  },
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
    getTaxonNameById(id: number) {
      const findTaxonInTree = (node: TaxonTreeNode): Taxon | null => {
        if (node.id === id) {
          return node
        }
        if (node.children) {
          for (const child of node.children) {
            const result = findTaxonInTree(child)
            if (result) {
              return result
            }
          }
        }
        return null
      }

      if (this.taxaTree) {
        const taxon = findTaxonInTree(this.taxaTree)
        return taxon ? taxon.name : 'Otros'
      }
      return 'Otros'
    },
  },
})
