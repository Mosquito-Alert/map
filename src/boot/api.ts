import { boot } from 'quasar/wrappers';

import {
  Configuration,
  BitesApi,
  BreedingSitesApi,
  ObservationsApi,
  TaxaApi,
} from 'mosquito-alert';

const apiConfig = new Configuration({
  ...(import.meta.env.VITE_API_BASE_URL ? { basePath: import.meta.env.VITE_API_BASE_URL } : {}),
});

const taxaApi = new TaxaApi(apiConfig);
const bitesApi = new BitesApi(apiConfig);
const breedingSitesApi = new BreedingSitesApi(apiConfig);
const observationsApi = new ObservationsApi(apiConfig);

export default boot(({ app }) => {
  // Make available in Options API components as this.$api...
  app.config.globalProperties.$api = {
    taxaApi,
    bitesApi,
    breedingSitesApi,
    observationsApi,
  };
});

export { taxaApi, bitesApi, breedingSitesApi, observationsApi };
