import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const isBottomNavVisible = ref(true)
  const installPrompt = ref(null)

  function showBottomNav() {
    isBottomNavVisible.value = true
  }

  function hideBottomNav() {
    isBottomNavVisible.value = false
  }

  function setInstallPrompt(prompt) {
    installPrompt.value = prompt
  }

  async function triggerInstallPrompt() {
    if (installPrompt.value) {
      installPrompt.value.prompt()
      const { outcome } = await installPrompt.value.userChoice
      if (outcome === 'accepted') {
        installPrompt.value = null
      }
    }
  }

  return { isBottomNavVisible, showBottomNav, hideBottomNav, installPrompt, setInstallPrompt, triggerInstallPrompt }
})
