<template>
  <div class="lucky-sports-view">
    <div class="mobileContainer">
      <!-- Header -->
      <header class="header">
        <router-link to="/" class="logoWrap">
          <img src="https://img.bzvm68.com/logo/gowin11/deltin7_logo_black.png" alt="DELTIN SPORT" class="headerLogo" />
        </router-link>
        
        <div v-if="auth.isLoggedIn" class="headerBalance">
          <div class="hBalTop">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
            <span>Balance</span>
          </div>
          <div class="hBalBottom">
             <span class="hBalVal">₹{{ (userBalance || 0).toFixed(2) }}</span>
             <button class="hRefreshBtn" @click="fetchBalance" :class="{ 'spinning': isRefreshing }">
               <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
             </button>
          </div>
        </div>
      </header>

      <!-- Game Iframe Container -->
      <div class="iframe-wrap" v-if="iframeUrl">
        <iframe :src="iframeUrl" frameborder="0" allowfullscreen></iframe>
      </div>

      <!-- Loading State -->
      <div v-if="isGameLoading" class="game-loader">
        <div class="spinner"></div>
        <p>Loading Sports...</p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="error-msg">
        <p>{{ error }}</p>
        <button @click="launchSports" class="retry-btn">Retry</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import * as api from '../api/home'
import * as walletApi from '../api/wallet'

const router = useRouter()
const auth = useAuthStore()
const userBalance = ref(0)
const iframeUrl = ref(null)
const isGameLoading = ref(true)
const isRefreshing = ref(false)
const error = ref(null)
let balanceInterval = null

async function fetchBalance() {
  if (!auth.user?.id) return
  isRefreshing.value = true
  try {
    const res = await walletApi.getUserHome(auth.user.id)
    if (res.data && res.data.length > 0) {
      userBalance.value = res.data[0].balance || 0
    }
  } catch (err) {
    console.error('Balance fetch failed')
  } finally {
    setTimeout(() => { isRefreshing.value = false }, 500)
  }
}

async function launchSports() {
  if (!auth.isLoggedIn) {
    router.push('/login')
    return
  }
  
  error.value = null
  isGameLoading.value = true
  
  try {
    const userId = auth.user.id
    const gameId = '7004' // Lucky Sports ID (7004)
    
    const res = await api.launchGame(userId, gameId)
    if (res.data && res.data.success && res.data.url) {
      iframeUrl.value = res.data.url
    } else {
      error.value = 'Failed to launch Sports: ' + (res.data?.msg || res.data?.message || 'Error')
    }
  } catch (err) {
    console.error(err)
    error.value = 'Error launching game: ' + (err.response?.data?.message || err.message)
  } finally {
    isGameLoading.value = false
  }
}

onMounted(() => {
  fetchBalance()
  launchSports()
  
  // Auto-refresh balance every 3 seconds
  balanceInterval = setInterval(() => {
    fetchBalance()
  }, 3000)
})

onUnmounted(() => {
  if (balanceInterval) clearInterval(balanceInterval)
})
</script>

<style scoped>
.lucky-sports-view {
  min-height: 100vh;
  background: #f1f5f9;
  padding-bottom: 60px; /* Space for bottom nav */
}

.mobileContainer {
  max-width: 430px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
}

/* Header */
.header {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  background: #fff;
  border-bottom: 1px solid #f1f5f9;
  z-index: 100;
  flex-shrink: 0;
}
.headerLogo {
  height: 20px;
  object-fit: contain;
}

/* Header Balance */
.headerBalance {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
}
.hBalTop {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.65rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
}
.hBalBottom {
  display: flex;
  align-items: center;
  gap: 6px;
}
.hBalVal {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f172a;
}
.hRefreshBtn {
  background: none;
  border: none;
  color: #05c0b8;
  padding: 2px;
  cursor: pointer;
  display: flex;
}
.hRefreshBtn.spinning {
  animation: spin 1s linear infinite;
}

/* Iframe Wrap */
.iframe-wrap {
  flex: 1;
  width: 100%;
  position: relative;
  overflow: hidden;
}
.iframe-wrap iframe {
  width: 100%;
  height: 100%;
  border: none;
  position: absolute;
  top: 0;
  left: 0;
}

/* Loading/Error */
.game-loader {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
.spinner {
  width: 32px;
  height: 32px;
  border: 4px solid #f1f5f9;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.error-msg {
  padding: 40px 20px;
  text-align: center;
}
.retry-btn {
  margin-top: 12px;
  padding: 8px 24px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
