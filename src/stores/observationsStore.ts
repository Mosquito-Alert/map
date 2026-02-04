import { defineStore } from 'pinia'
import type { Observation } from 'mosquito-alert'
import { observationsApi } from '../services/apiService'
import { culicidaeTaxon, useTaxaStore } from './taxaStore'

export const useObservationsStore = defineStore('observations', {
  state: () => ({
    // observations: {} as any,
    dataProcessed: false,
    near_observations: [] as Observation[],
    dateFilter: {
      start: null as string | null,
      end: null as string | null,
    } as { start: string | null; end: string | null },
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
          identificationTaxonIds: [taxaStore.taxonSelected.id.toString()],
        })
        if (response.data.results) {
          this.near_observations = response.data.results
        }
      } catch (error) {
        console.error('Failed to fetch observations near me:', error)
        throw error
      }
    },
    async fetchObservations() {
      const taxaStore = useTaxaStore()
      try {
        const response = await observationsApi.geoList({
          format: 'geojson',
          identificationTaxonIds: [taxaStore.taxonSelected.id.toString()],
          identificationTaxonIdsLookup: 'is_tree_of',
        })
        if (response.data) {
          return response.data as any
        }
      } catch (error) {
        console.error('Failed to fetch observations:', error)
        throw error
      }
    },
  },
})
