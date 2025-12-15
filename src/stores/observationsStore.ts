import { defineStore } from 'pinia'
import type { Observation } from 'mosquito-alert'
import { observationsApi } from '../services/apiService'
import { useTaxaStore } from './taxaStore'

export const useObservationsStore = defineStore('observations', {
  state: () => ({
    observations: [] as any[],
    near_observations: [] as Observation[],
    datesFilterPercentage: { start: 0, end: 100 } as { start: number; end: number },
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
          identificationTaxonIds: taxaStore.taxonSelected
            ? [taxaStore.taxonSelected.id]
            : undefined,
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
      try {
        const data = 'http://localhost:5173/observations_culicidae.json'
        const response = await fetch(data).then((resp) => resp.json())
        this.observations = response as any[]
      } catch (error) {
        console.error('Failed to fetch observations:', error)
        throw error
      }
    },
  },
})
