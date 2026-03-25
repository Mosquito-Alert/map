import { MetricsApi, Configuration as MetricsConfiguration, RegionsApi } from 'metrics'
import { BoundariesApi, Configuration, ObservationsApi, TaxaApi } from 'mosquito-alert'

const apiConfig = new Configuration({
  ...(import.meta.env.VITE_API_BASE_URL ? { basePath: import.meta.env.VITE_API_BASE_URL } : {}),
  // apiKey: import.meta.env.VITE_API_TOKEN
  //   ? () => import.meta.env.VITE_API_TOKEN as string
  //   : undefined,
})

const metricsConfig = new MetricsConfiguration({
  ...(import.meta.env.VITE_METRICS_BASE_URL
    ? { basePath: import.meta.env.VITE_METRICS_BASE_URL }
    : {}),
})

// Mosquito Alert API
export const taxaApi = new TaxaApi(apiConfig)
export const observationsApi = new ObservationsApi(apiConfig)
export const boundariesApi = new BoundariesApi(apiConfig)

// Metrics API
export const metricsApi = new MetricsApi(metricsConfig)
export const regionsApi = new RegionsApi(metricsConfig)
