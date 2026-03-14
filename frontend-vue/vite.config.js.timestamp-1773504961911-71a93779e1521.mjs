// vite.config.js
import { defineConfig } from "file:///www/wwwroot/rushpay.online/frontend-vue/node_modules/vite/dist/node/index.js";
import vue from "file:///www/wwwroot/rushpay.online/frontend-vue/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { VitePWA } from "file:///www/wwwroot/rushpay.online/frontend-vue/node_modules/vite-plugin-pwa/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true
      },
      manifest: {
        name: "Wynn Online Casino",
        short_name: "Wynn Casino",
        description: "Play and win big!",
        start_url: "/",
        theme_color: "#00bfa5",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "https://img.bzvm68.com/logo/gowin11/deltin7_logo_black.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "https://img.bzvm68.com/logo/gowin11/deltin7_logo_black.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      }
    })
  ],
  server: {
    port: 3001,
    proxy: {
      "/user": { target: "http://localhost:4001", changeOrigin: true },
      "/getUser": { target: "http://localhost:4001", changeOrigin: true },
      "/getProviders": { target: "http://localhost:4001", changeOrigin: true },
      "/carousel": { target: "http://localhost:4001", changeOrigin: true },
      "/site-settings": { target: "http://localhost:4001", changeOrigin: true },
      "/getNotice": { target: "http://localhost:4001", changeOrigin: true },
      "/gamesCatalog": { target: "http://localhost:4001", changeOrigin: true },
      "/getUserHome": { target: "http://localhost:4001", changeOrigin: true },
      "/game": { target: "http://localhost:4001", changeOrigin: true },
      "/sendOTP": { target: "http://localhost:4001", changeOrigin: true },
      "/admin-api": { target: "http://localhost:4001", changeOrigin: true },
      "/api": { target: "http://localhost:4001", changeOrigin: true },
      "/data": { target: "http://localhost:4001", changeOrigin: true }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvd3d3L3d3d3Jvb3QvcnVzaHBheS5vbmxpbmUvZnJvbnRlbmQtdnVlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvd3d3L3d3d3Jvb3QvcnVzaHBheS5vbmxpbmUvZnJvbnRlbmQtdnVlL3ZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy93d3cvd3d3cm9vdC9ydXNocGF5Lm9ubGluZS9mcm9udGVuZC12dWUvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSAndml0ZS1wbHVnaW4tcHdhJ1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgdnVlKCksXG4gICAgVml0ZVBXQSh7XG4gICAgICByZWdpc3RlclR5cGU6ICdhdXRvVXBkYXRlJyxcbiAgICAgIGRldk9wdGlvbnM6IHtcbiAgICAgICAgZW5hYmxlZDogdHJ1ZVxuICAgICAgfSxcbiAgICAgIG1hbmlmZXN0OiB7XG4gICAgICAgIG5hbWU6ICdXeW5uIE9ubGluZSBDYXNpbm8nLFxuICAgICAgICBzaG9ydF9uYW1lOiAnV3lubiBDYXNpbm8nLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1BsYXkgYW5kIHdpbiBiaWchJyxcbiAgICAgICAgc3RhcnRfdXJsOiAnLycsXG4gICAgICAgIHRoZW1lX2NvbG9yOiAnIzAwYmZhNScsXG4gICAgICAgIGJhY2tncm91bmRfY29sb3I6ICcjZmZmZmZmJyxcbiAgICAgICAgZGlzcGxheTogJ3N0YW5kYWxvbmUnLFxuICAgICAgICBpY29uczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogJ2h0dHBzOi8vaW1nLmJ6dm02OC5jb20vbG9nby9nb3dpbjExL2RlbHRpbjdfbG9nb19ibGFjay5wbmcnLFxuICAgICAgICAgICAgc2l6ZXM6ICcxOTJ4MTkyJyxcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxuICAgICAgICAgICAgcHVycG9zZTogJ2FueSBtYXNrYWJsZSdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogJ2h0dHBzOi8vaW1nLmJ6dm02OC5jb20vbG9nby9nb3dpbjExL2RlbHRpbjdfbG9nb19ibGFjay5wbmcnLFxuICAgICAgICAgICAgc2l6ZXM6ICc1MTJ4NTEyJyxcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxuICAgICAgICAgICAgcHVycG9zZTogJ2FueSBtYXNrYWJsZSdcbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH1cbiAgICB9KVxuICBdLFxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiAzMDAxLFxuICAgIHByb3h5OiB7XG4gICAgICAnL3VzZXInOiB7IHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NDAwMScsIGNoYW5nZU9yaWdpbjogdHJ1ZSB9LFxuICAgICAgJy9nZXRVc2VyJzogeyB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjQwMDEnLCBjaGFuZ2VPcmlnaW46IHRydWUgfSxcbiAgICAgICcvZ2V0UHJvdmlkZXJzJzogeyB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjQwMDEnLCBjaGFuZ2VPcmlnaW46IHRydWUgfSxcbiAgICAgICcvY2Fyb3VzZWwnOiB7IHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NDAwMScsIGNoYW5nZU9yaWdpbjogdHJ1ZSB9LFxuICAgICAgJy9zaXRlLXNldHRpbmdzJzogeyB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjQwMDEnLCBjaGFuZ2VPcmlnaW46IHRydWUgfSxcbiAgICAgICcvZ2V0Tm90aWNlJzogeyB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjQwMDEnLCBjaGFuZ2VPcmlnaW46IHRydWUgfSxcbiAgICAgICcvZ2FtZXNDYXRhbG9nJzogeyB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjQwMDEnLCBjaGFuZ2VPcmlnaW46IHRydWUgfSxcbiAgICAgICcvZ2V0VXNlckhvbWUnOiB7IHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NDAwMScsIGNoYW5nZU9yaWdpbjogdHJ1ZSB9LFxuICAgICAgJy9nYW1lJzogeyB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjQwMDEnLCBjaGFuZ2VPcmlnaW46IHRydWUgfSxcbiAgICAgICcvc2VuZE9UUCc6IHsgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDo0MDAxJywgY2hhbmdlT3JpZ2luOiB0cnVlIH0sXG4gICAgICAnL2FkbWluLWFwaSc6IHsgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDo0MDAxJywgY2hhbmdlT3JpZ2luOiB0cnVlIH0sXG4gICAgICAnL2FwaSc6IHsgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDo0MDAxJywgY2hhbmdlT3JpZ2luOiB0cnVlIH0sXG4gICAgICAnL2RhdGEnOiB7IHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NDAwMScsIGNoYW5nZU9yaWdpbjogdHJ1ZSB9LFxuICAgIH0sXG4gIH0sXG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUEwUyxTQUFTLG9CQUFvQjtBQUN2VSxPQUFPLFNBQVM7QUFDaEIsU0FBUyxlQUFlO0FBRXhCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLElBQUk7QUFBQSxJQUNKLFFBQVE7QUFBQSxNQUNOLGNBQWM7QUFBQSxNQUNkLFlBQVk7QUFBQSxRQUNWLFNBQVM7QUFBQSxNQUNYO0FBQUEsTUFDQSxVQUFVO0FBQUEsUUFDUixNQUFNO0FBQUEsUUFDTixZQUFZO0FBQUEsUUFDWixhQUFhO0FBQUEsUUFDYixXQUFXO0FBQUEsUUFDWCxhQUFhO0FBQUEsUUFDYixrQkFBa0I7QUFBQSxRQUNsQixTQUFTO0FBQUEsUUFDVCxPQUFPO0FBQUEsVUFDTDtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFlBQ04sU0FBUztBQUFBLFVBQ1g7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsWUFDTixTQUFTO0FBQUEsVUFDWDtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ0wsU0FBUyxFQUFFLFFBQVEseUJBQXlCLGNBQWMsS0FBSztBQUFBLE1BQy9ELFlBQVksRUFBRSxRQUFRLHlCQUF5QixjQUFjLEtBQUs7QUFBQSxNQUNsRSxpQkFBaUIsRUFBRSxRQUFRLHlCQUF5QixjQUFjLEtBQUs7QUFBQSxNQUN2RSxhQUFhLEVBQUUsUUFBUSx5QkFBeUIsY0FBYyxLQUFLO0FBQUEsTUFDbkUsa0JBQWtCLEVBQUUsUUFBUSx5QkFBeUIsY0FBYyxLQUFLO0FBQUEsTUFDeEUsY0FBYyxFQUFFLFFBQVEseUJBQXlCLGNBQWMsS0FBSztBQUFBLE1BQ3BFLGlCQUFpQixFQUFFLFFBQVEseUJBQXlCLGNBQWMsS0FBSztBQUFBLE1BQ3ZFLGdCQUFnQixFQUFFLFFBQVEseUJBQXlCLGNBQWMsS0FBSztBQUFBLE1BQ3RFLFNBQVMsRUFBRSxRQUFRLHlCQUF5QixjQUFjLEtBQUs7QUFBQSxNQUMvRCxZQUFZLEVBQUUsUUFBUSx5QkFBeUIsY0FBYyxLQUFLO0FBQUEsTUFDbEUsY0FBYyxFQUFFLFFBQVEseUJBQXlCLGNBQWMsS0FBSztBQUFBLE1BQ3BFLFFBQVEsRUFBRSxRQUFRLHlCQUF5QixjQUFjLEtBQUs7QUFBQSxNQUM5RCxTQUFTLEVBQUUsUUFBUSx5QkFBeUIsY0FBYyxLQUFLO0FBQUEsSUFDakU7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
