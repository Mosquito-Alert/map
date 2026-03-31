import { defineStore } from 'pinia'
import { useAnalizeStore } from './analizeStore'
import { metricsApi } from '../services/apiService'
import type { MetricValueMean } from 'metrics-dev'

export const useRM0Store = defineStore('rm0', {
  state: () => ({
    metricsDataLoading: false,
    metrics: null as MetricValueMean[] | null,
    h3_indexes: null as string[] | null,
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

        if (response.status === 200 && response.data && response.data.values) {
          this.metrics = response.data.values
          this.h3_indexes = response.data.h3_indexes
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
