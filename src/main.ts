import Aura from '@primeuix/themes/aura'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import { createApp } from 'vue'

import App from './App.vue'
import router from './router'

import Tooltip from 'primevue/tooltip'
import { definePreset } from '@primeuix/themes'
import '@/assets/css/tailwind.css'
import 'material-icons/iconfont/material-icons.css'

const app = createApp(App)

app.use(createPinia())
app.directive('tooltip', Tooltip)
app.use(router)

const MosquitoAlertPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{yellow.50}',
      100: '{yellow.100}',
      200: '{yellow.200}',
      300: '{yellow.300}',
      400: '{yellow.400}',
      500: '{yellow.500}',
      600: '{yellow.600}',
      700: '{yellow.700}',
      800: '{yellow.800}',
      900: '{yellow.900}',
      950: '{yellow.950}',
    },
  },
})

app.use(PrimeVue, {
  theme: {
    preset: MosquitoAlertPreset,
    options: {
      darkModeSelector: false || 'none',
      cssLayer: {
        name: 'primevue',
        order: 'theme, base, primevue',
      },
    },
  },
})

app.mount('#app')
