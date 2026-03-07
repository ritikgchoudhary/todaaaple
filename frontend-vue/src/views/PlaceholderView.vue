<template>
  <div class="placeholder">
    <header class="header">
      <button type="button" class="backBtn" @click="router.back()">← Back</button>
      <h1 class="title">{{ route.meta?.title || 'Page' }}</h1>
    </header>
    <p class="message">Coming soon.</p>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()
</script>

<style scoped>
.placeholder { padding: 20px; min-height: 100vh; background: #f5f5f5; }
.header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.backBtn { padding: 8px 12px; background: #fff; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; }
.title { margin: 0; font-size: 1.25rem; }
.message { color: #666; }
</style>
