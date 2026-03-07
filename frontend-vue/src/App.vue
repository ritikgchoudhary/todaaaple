<template>
  <div class="app">
    <router-view />
    <BottomNav v-show="route.meta.showNav" />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import BottomNav from './components/BottomNav.vue'
const route = useRoute()
</script>

<style scoped>
.app {
  min-height: 100vh;
}
</style>
