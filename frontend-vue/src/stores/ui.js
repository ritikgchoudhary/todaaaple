import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const isBottomNavVisible = ref(true)

  function showBottomNav() {
    isBottomNavVisible.value = true
  }

  function hideBottomNav() {
    isBottomNavVisible.value = false
  }

  return { isBottomNavVisible, showBottomNav, hideBottomNav }
})
