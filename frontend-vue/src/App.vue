<template>
  <div class="app">
    <router-view />
    <BottomNav v-show="route.meta.showNav && ui.isBottomNavVisible" />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useUiStore } from './stores/ui'
import BottomNav from './components/BottomNav.vue'

const route = useRoute()
const ui = useUiStore()
</script>

<style scoped>
.app {
  min-height: 100vh;
}
</style>
