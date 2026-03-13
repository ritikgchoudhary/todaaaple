import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'Wynn Online Casino',
        short_name: 'Wynn Casino',
        description: 'Play and win big!',
        start_url: '/',
        theme_color: '#00bfa5',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'https://img.bzvm68.com/logo/gowin11/deltin7_logo_black.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'https://img.bzvm68.com/logo/gowin11/deltin7_logo_black.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
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
