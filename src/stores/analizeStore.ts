import type { Metric, MetricSeasonality, MetricTrend, PaginatedMetricList } from 'metrics'
import { defineStore } from 'pinia'
import wdk from 'wikibase-sdk/wikidata.org'
import { metricsApi, regionsApi } from '../services/apiService'

export enum toolsEnum {
  CLICK = 'click',
  SEARCH = 'search',
  DRAW = 'draw',
}

export const useAnalizeStore = defineStore('analize', {
  state: () => ({
    toolSelected: toolsEnum.CLICK,
    selectedRegion: {} as GeoJSON.FeatureCollection,
    populationOfSelectedRegion: null as number | null,
    extensionOfSelectedRegion: null as number | null,
    // * For Bite Index Trend */
    dateLoading: false,
    lastDateAvailable: '' as string,
    lastMetricWithPrediction: null as Metric | null,
    metricsDataLoading: false,
    biteIndexMetrics: null as PaginatedMetricList | null,
    trendDataLoading: false,
    biteIndexTrendRaw: null as MetricTrend | null,
    seasonalityDataLoading: false,
    biteIndexSeasonality: null as MetricSeasonality | null,
  }),
  getters: {
    isRegionSelected: (state) => Object.keys(state.selectedRegion).length > 0,
  },
  actions: {
    async getDataOfRegion() {
      const wikidataId = this.selectedRegion.features[0]?.properties?.extratags?.wikidata
      if (!wikidataId) {
        this.populationOfSelectedRegion = null
        return
      }
      // * POPULATION: P1082
      const sparqlQueryPopulation = `SELECT * WHERE { wd:${wikidataId} wdt:P1082 ?population }`

      const responsePopulation = await fetch(wdk.sparqlQuery(sparqlQueryPopulation))
      const dataPopulation = await responsePopulation.json()
      const population = dataPopulation.results.bindings[0]?.population?.value
      this.populationOfSelectedRegion = population ? parseInt(population) : null

      // * EXTENSION: P2046 (km2)
      const sparqlQueryExtension = `SELECT * WHERE { wd:${wikidataId} wdt:P2046 ?extension }`
      const urlExtension = wdk.sparqlQuery(sparqlQueryExtension)

      const responseExtension = await fetch(urlExtension)
      const dataExtension = await responseExtension.json()
      const extension = dataExtension.results.bindings[0]?.extension?.value
      this.extensionOfSelectedRegion = extension ? parseFloat(extension) : null
    },
    clearSelectedRegion() {
      this.selectedRegion = {} as GeoJSON.FeatureCollection
      this.populationOfSelectedRegion = null
      this.extensionOfSelectedRegion = null
    },
    getLastMetricWithPrediction(): Metric | null {
      if (!this.biteIndexMetrics) return null
      // Find the last metric that has a non-null value and a non-null prediction
      for (let i = this.biteIndexMetrics.results.length - 1; i >= 0; i--) {
        const metric = this.biteIndexMetrics.results[i]
        if (metric && metric.value !== null && metric.predicted_value !== null) {
          return metric
        }
      }
      return null
    },
    async fetchLastDate() {
      try {
        this.dateLoading = true
        const response = await metricsApi.lastDateRetrieve()
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
    async fetchBiteIndexMetrics(city: string) {
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
          const metricsResponse = await metricsApi.list({
            regionCode,
            dateFrom: dateFrom.toISOString().split('T')[0], // Format as YYYY-MM-DD
            page: 1,
            pageSize,
            ordering: 'date',
          })
          if (metricsResponse.status === 200 && metricsResponse.data.results.length > 0) {
            this.biteIndexMetrics = metricsResponse.data
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

    async fetchBiteIndexTrend() {
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
        const response = await metricsApi.trendRetrieve({ id })
        if (response.status === 200 && response.data) {
          this.biteIndexTrendRaw = response.data
        } else {
          throw new Error('Failed to fetch trend for the selected region')
        }
      } catch (error) {
        console.error('Error fetching bite index trend:', error)
      } finally {
        this.trendDataLoading = false
      }
    },
    async fetchSelectedMetricSeasonality(): Promise<void> {
      if (!this.lastMetricWithPrediction) {
        console.warn('No metric available to fetch seasonality.')
        return
      }
      try {
        this.seasonalityDataLoading = true
        const response = await metricsApi.seasonalityRetrieve({
          id: this.lastMetricWithPrediction?.id,
        })
        if (response.status === 200 && response.data) {
          this.biteIndexSeasonality = response.data
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
