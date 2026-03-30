import type { Metric, MetricSeasonality, MetricTrend, PaginatedMetricList } from 'metrics'
import { defineStore } from 'pinia'
import { metricsV1Api, regionsApi } from '../services/apiService'

export const useBiteIndexStore = defineStore('biteIndex', {
  state: () => ({
    dateLoading: false,
    lastDateAvailable: '' as string,
    lastMetricWithPrediction: null as Metric | null,
    metricsDataLoading: false,
    metrics: null as PaginatedMetricList | null,
    trendDataLoading: false,
    trendRaw: null as MetricTrend | null,
    seasonalityDataLoading: false,
    seasonality: null as MetricSeasonality | null,
  }),
  actions: {
    getLastMetricWithPrediction(): Metric | null {
      if (!this.metrics) return null
      // Find the last metric that has a non-null value and a non-null prediction
      for (let i = this.metrics.results.length - 1; i >= 0; i--) {
        const metric = this.metrics.results[i]
        if (metric && metric.value !== null && metric.predicted_value !== null) {
          return metric
        }
      }
      return null
    },
    async fetchLastDate() {
      try {
        this.dateLoading = true
        const response = await metricsV1Api.lastDateRetrieve()
        if (response.status === 200 && response.data) {
          this.lastDateAvailable = response.data.date
          this.dateLoading = false
        } else {
          throw new Error('Failed to fetch last date')
        }
      } catch (error) {
        console.error('Error fetching last date:', error)
      }
    },
    async fetchMetrics(city: string) {
      try {
        this.metricsDataLoading = true
        const response = await regionsApi.list({
          regionName: city,
          pageSize: 1,
          ordering: 'name',
        })
        const regionCode = response.data?.results[0]?.code
        if (regionCode) {
          const pageSize = 10000000 // Large page size to fetch all the metrics
          const daysSince = 10 * 365 // 10 years
          const dateFrom = new Date()
          dateFrom.setDate(dateFrom.getDate() - daysSince)
          const metricsResponse = await metricsV1Api.list({
            regionCode,
            dateFrom: dateFrom.toISOString().split('T')[0], // Format as YYYY-MM-DD
            page: 1,
            pageSize,
            ordering: 'date',
          })
          if (metricsResponse.status === 200 && metricsResponse.data.results.length > 0) {
            this.metrics = metricsResponse.data
            this.lastMetricWithPrediction = this.getLastMetricWithPrediction()
          } else {
            throw new Error('No metrics data found for the selected region.')
          }
        } else {
          throw new Error('Region code not found for the selected region.')
        }
      } catch (error) {
        console.error('Error fetching metrics data:', error)
      } finally {
        this.metricsDataLoading = false
      }
    },

    async fetchTrend() {
      if (!this.lastMetricWithPrediction) {
        console.warn('No metric with prediction available to fetch the trend.')
        return
      }
      try {
        this.trendDataLoading = true
        const id = this.lastMetricWithPrediction?.id || ''
        if (!id) {
          throw new Error('No valid metric found to fetch the trend.')
        }
        const response = await metricsV1Api.trendRetrieve({ id })
        if (response.status === 200 && response.data) {
          this.trendRaw = response.data
        } else {
          throw new Error('Failed to fetch trend for the selected region')
        }
      } catch (error) {
        console.error('Error fetching bite index trend:', error)
      } finally {
        this.trendDataLoading = false
      }
    },
    async fetchSeasonality(): Promise<void> {
      if (!this.lastMetricWithPrediction) {
        console.warn('No metric available to fetch seasonality.')
        return
      }
      try {
        this.seasonalityDataLoading = true
        const response = await metricsV1Api.seasonalityRetrieve({
          id: this.lastMetricWithPrediction?.id,
        })
        if (response.status === 200 && response.data) {
          this.seasonality = response.data
        } else {
          throw new Error('Failed to fetch seasonality for the selected region')
        }
      } catch (error) {
        console.error('Error fetching selected region seasonality:', error)
      } finally {
        this.seasonalityDataLoading = false
      }
    },
  },
})
