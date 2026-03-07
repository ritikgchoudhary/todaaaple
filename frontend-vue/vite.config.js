import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3001,
    proxy: {
      '/user': { target: 'http://localhost:4001', changeOrigin: true },
      '/getUser': { target: 'http://localhost:4001', changeOrigin: true },
      '/getProviders': { target: 'http://localhost:4001', changeOrigin: true },
      '/carousel': { target: 'http://localhost:4001', changeOrigin: true },
      '/site-settings': { target: 'http://localhost:4001', changeOrigin: true },
      '/getNotice': { target: 'http://localhost:4001', changeOrigin: true },
      '/gamesCatalog': { target: 'http://localhost:4001', changeOrigin: true },
      '/getUserHome': { target: 'http://localhost:4001', changeOrigin: true },
      '/game': { target: 'http://localhost:4001', changeOrigin: true },
      '/sendOTP': { target: 'http://localhost:4001', changeOrigin: true },
      '/admin-api': { target: 'http://localhost:4001', changeOrigin: true },
      '/api': { target: 'http://localhost:4001', changeOrigin: true },
      '/data': { target: 'http://localhost:4001', changeOrigin: true },
    },
  },
})
