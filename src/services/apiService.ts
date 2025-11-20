import { Configuration, ObservationsApi, TaxaApi } from 'mosquito-alert'

const apiConfig = new Configuration({
  ...(import.meta.env.VITE_API_BASE_URL ? { basePath: import.meta.env.VITE_API_BASE_URL } : {}),
  apiKey: import.meta.env.VITE_API_TOKEN
    ? () => import.meta.env.VITE_API_TOKEN as string
    : undefined,
})

export const taxaApi = new TaxaApi(apiConfig)
export const observationsApi = new ObservationsApi(apiConfig)
