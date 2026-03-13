import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as walletApi from '../api/wallet'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('auth_token') || '')
  const user = ref(null)

  try {
    const raw = localStorage.getItem('user')
    if (raw) {
      const parsed = JSON.parse(raw)
      // Populate token from 'user' object if 'auth_token' was empty (legacy/consistency)
      if (parsed.token && !token.value) {
        token.value = parsed.token
        localStorage.setItem('auth_token', parsed.token)
      } else if (parsed.token) {
        token.value = parsed.token
      }
      
      if (parsed.result) user.value = parsed.result
    }
  } catch (_) {}

  const isLoggedIn = computed(() => !!token.value)

  function setUser(data) {
    if (data?.token) {
      token.value = data.token
      localStorage.setItem('auth_token', data.token)
    }
    if (data?.result) user.value = data.result
    if (data?.token || data?.result) {
      localStorage.setItem('user', JSON.stringify({ 
        result: data.result || user.value, 
        token: data.token || token.value 
      }))
    }
  }

  async function refreshUser() {
    if (!user.value?.id) return
    try {
      const res = await walletApi.getUserHome(user.value.id)
      if (res.data && res.data.length > 0) {
        setUser({ result: res.data[0] })
      }
    } catch (err) {
      console.error('Failed to refresh user:', err)
    }
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('auth_token')
  }

  return { token, user, isLoggedIn, setUser, logout, refreshUser }
})
