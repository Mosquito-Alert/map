import { boot } from 'quasar/wrappers';
import axios from 'axios';

import {
  Configuration,
  BitesApi,
  BreedingSitesApi,
  ObservationsApi,
  TaxaApi,
  BoundariesApi,
  AuthApi,
  UsersApi,
} from 'mosquito-alert';
import { BASE_PATH } from 'mosquito-alert/base';
import { attachAuthInterceptor } from 'mosquito-alert/interceptors';
import { useAuthStore } from 'src/stores/authStore';

const apiConfig = new Configuration({
  ...(import.meta.env.VITE_API_BASE_URL ? { basePath: import.meta.env.VITE_API_BASE_URL } : {}),
  // accessToken: localStorage.getItem('access_token') ?? undefined, // () => localStorage.getItem('access_token') || undefined
});

const apiUrl = apiConfig.basePath || BASE_PATH;

const axiosInstance = axios.create({});

const taxaApi = new TaxaApi(apiConfig, undefined, axiosInstance);
const bitesApi = new BitesApi(apiConfig, undefined, axiosInstance);
const breedingSitesApi = new BreedingSitesApi(apiConfig, undefined, axiosInstance);
const observationsApi = new ObservationsApi(apiConfig, undefined, axiosInstance);
const boundariesApi = new BoundariesApi(apiConfig, undefined, axiosInstance);
const authApi = new AuthApi(apiConfig, undefined, axiosInstance);
const userApi = new UsersApi(apiConfig, undefined, axiosInstance);

export default boot(({ app }) => {
  const i18n = app.config.globalProperties.$i18n;

  axiosInstance.interceptors.request.use((config) => {
    config.headers = config.headers || {};

    if (i18n?.locale) {
      config.headers['Accept-Language'] = i18n.locale;
    }

    return config;
  });

  attachAuthInterceptor(axiosInstance, {
    configuration: apiConfig,
    refreshToken: () => localStorage.getItem('refresh_token') || '',
    updateAccessToken: (newAccessToken) => {
      localStorage.setItem('access_token', newAccessToken);
      // Also update the store to maintain reactivity
      const authStore = useAuthStore();
      authStore.accessToken = newAccessToken;
    },
  });

  // Make available in Options API components as this.$api...
  app.config.globalProperties.$api = {
    taxaApi,
    bitesApi,
    breedingSitesApi,
    observationsApi,
    boundariesApi,
    authApi,
    userApi,
  };
});

export {
  apiUrl,
  taxaApi,
  bitesApi,
  breedingSitesApi,
  observationsApi,
  boundariesApi,
  authApi,
  userApi,
};
