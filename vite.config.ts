import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'
  return {
    server: {
      host: true, // allows access from LAN/public IP
      port: 5173, // or any port
      strictPort: false, // lets Vite pick another port if needed
      cors: true, // optional: enables CORS
      ...(isDev && {
        proxy: {
          '/api': {
            target: 'https://apidev.mosquitoalert.com/v1/',
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path.replace(/^\/api/, ''),
          },
          '/metrics_v1': {
            target: 'https://metrics.mosquitoalert.com/api/v1/',
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path.replace(/^\/metrics_v1/, ''),
          },
          '/metrics': {
            target: 'http://localhost:8000/api/v2/',
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path.replace(/^\/metrics/, ''),
          },
          '/geoserver': {
            target: 'https://mapserver.mosquitoalert.com/',
            changeOrigin: true,
            secure: false,
          },
        },
      }),
    },
    plugins: [vue(), vueDevTools(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
