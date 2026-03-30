import { defineStore } from 'pinia'
import { useAnalizeStore } from './analizeStore'
import { metricsApi } from '../services/apiService'

export const useRM0Store = defineStore('rm0', {
  state: () => ({
    metricsDataLoading: false,
    metrics: null as any, // TODO: Type
  }),
  actions: {
    async fetchRM0Data() {
      // TODO: Fetch it from api endpoint
      const rm0MetricId = 1
      const analizeStore = useAnalizeStore()
      const selectedBoundaryGeometry = analizeStore.selectedRegion?.features[0]?.geometry

      try {
        this.metricsDataLoading = true
        const response = await metricsApi.valuesAggregateByGeometry({
          id: rm0MetricId,
          geoJSONModelRequest: {
            geometry: selectedBoundaryGeometry,
          },
        })

        if (response.status === 200 && response.data) {
          this.metrics = response.data
        } else {
          throw new Error('Failed to fetch RM0 data')
        }
      } catch (error) {
        console.error('Error fetching RM0 data:', error)
      } finally {
        this.metricsDataLoading = false
      }
    },
  },
})
