<template>
  <div class="app">
    <AppDownloadBanner v-if="route.path === '/'" />
    <router-view />
    <BottomNav v-show="route.meta.showNav && ui.isBottomNavVisible" />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useUiStore } from './stores/ui'
import BottomNav from './components/BottomNav.vue'
import AppDownloadBanner from './components/AppDownloadBanner.vue'
import { onMounted } from 'vue'

const route = useRoute()
const ui = useUiStore()

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    ui.setInstallPrompt(e)
  })
})
</script>

<style scoped>
.app {
  min-height: 100vh;
}
</style>
