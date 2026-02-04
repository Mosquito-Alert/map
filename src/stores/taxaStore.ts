import { defineStore } from 'pinia'
import { taxaApi } from '@/services/apiService'
import type { Taxon, TaxonTreeNode } from 'mosquito-alert'

export const culicidaeTaxon = { id: 7, name: 'Culicidae', italicize: false }

export const useTaxaStore = defineStore('taxa', {
  state: () => ({
    taxaTree: null as TaxonTreeNode | null,
    relevantTaxa: [
      { id: 112, name: 'Aedes albopictus', italicize: true },
      { id: 113, name: 'Aedes aegypti', italicize: true },
      { id: 114, name: 'Aedes japonicus', italicize: true },
      { id: 115, name: 'Aedes koreicus', italicize: true },
      { id: 10, name: 'Culex', italicize: true },
    ] as Taxon[],
    taxonSelected: culicidaeTaxon as Taxon,
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
  },
})
