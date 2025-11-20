import { defineStore } from 'pinia'
import type { Observation } from 'mosquito-alert'
import { observationsApi } from '../services/apiService'
import { useTaxaStore } from './taxaStore'

export const useObservationsStore = defineStore('observations', {
  state: () => ({
    observations: [] as Observation[],
  }),
  actions: {
    async fetchObservationsNearMe(
      numberOfObservations: number,
      latitude: number,
      longitude: number,
    ) {
      try {
        const taxaStore = useTaxaStore()
        // TODO: Implement latitude and longitude ordering when supported by the API
        // TODO: Filter by species
        const response = await observationsApi.list({
          pageSize: numberOfObservations,
          hasPhotos: true,
          identificationTaxonIds: taxaStore.taxonSelected
            ? [taxaStore.taxonSelected.id]
            : undefined,
        })
        if (response.data.results) {
          this.observations = response.data.results
        }
      } catch (error) {
        console.error('Failed to fetch observations near me:', error)
        throw error
      }
    },
  },
})
