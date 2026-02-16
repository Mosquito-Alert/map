import { defineStore } from 'pinia'
import type { Observation } from 'mosquito-alert'
import { observationsApi } from '../services/apiService'
import { useTaxaStore } from './taxaStore'

export const useObservationsStore = defineStore('observations', {
  state: () => ({
    // observations: {} as any,
    dataProcessed: false,
    near_observations: [] as Observation[],
    dateFilter: {
      start: null as string | null,
      end: null as string | null,
    } as { start: string | null; end: string | null },
    // This state tells the observation that is currently shown in the drawer to see its details
    observationInDrawer: null as Observation | null,
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
        const response = await observationsApi.geoList(
          {
            identificationTaxonIds: [taxaStore.taxonSelected.id.toString()],
            identificationTaxonIdsLookup: 'is_tree_of',
          },
          { headers: { Accept: 'application/geo+json' } },
        )
        if (response.data) {
          return response.data as any
        }
      } catch (error) {
        console.error('Failed to fetch observations:', error)
        throw error
      }
    },
    async fetchObservationById(uuid: string) {
      try {
        // TODO: Accept-language header
        const response = await observationsApi.retrieve({ uuid })
        if (response.data) {
          this.observationInDrawer = response.data as Observation
          return response.data as any
        }
      } catch (error) {
        console.error('Failed to fetch observation by ID:', error)
        throw error
      }
    },
  },
})
