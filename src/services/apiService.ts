import {
  MetricsApi as MetricsV1Api,
  Configuration as MetricsV1Configuration,
  RegionsApi,
} from 'metrics'
import { MetricsApi, Configuration as MetricsConfiguration } from 'metrics-dev'
import { BoundariesApi, Configuration, ObservationsApi, TaxaApi } from 'mosquito-alert'

const apiConfig = new Configuration({
  ...(import.meta.env.VITE_API_BASE_URL ? { basePath: import.meta.env.VITE_API_BASE_URL } : {}),
  // apiKey: import.meta.env.VITE_API_TOKEN
  //   ? () => import.meta.env.VITE_API_TOKEN as string
  //   : undefined,
})

const metricsV1Config = new MetricsV1Configuration({
  ...(import.meta.env.VITE_METRICS_V1_BASE_URL
    ? { basePath: import.meta.env.VITE_METRICS_V1_BASE_URL }
    : {}),
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

// Metrics V1 API
export const metricsV1Api = new MetricsV1Api(metricsV1Config)
export const regionsApi = new RegionsApi(metricsV1Config)
// Metrics API
export const metricsApi = new MetricsApi(metricsConfig)
