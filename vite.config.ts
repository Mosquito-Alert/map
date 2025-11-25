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
            target: 'https://webdev.mosquitoalert.com/api/v1/',
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path.replace(/^\/api/, ''),
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
