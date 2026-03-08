<template>
  <div class="lucky-sports-view">
    <div class="mobileContainer">
      <!-- Header -->
      <header class="header">
        <router-link to="/" class="logoWrap">
          <img src="https://img.bzvm68.com/logo/gowin11/deltin7_logo_black.png" alt="DELTIN SPORT" class="headerLogo" />
        </router-link>
        <div class="headerActions">
          <button class="btnLogout" @click="handleLogout" title="Logout">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </header>

      <!-- Balance Widget -->
      <div v-if="auth.isLoggedIn" class="balanceWidget">
        <div class="huLeft">
          <div class="huWalletLabel">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>
            <span>Wallet balance</span>
          </div>
          <div class="huBalContainer">
             <div class="huBal">₹{{ (userBalance || 0).toFixed(2) }}</div>
             <button class="huRefreshBtn" @click="fetchBalance" :class="{ 'spinning': isRefreshing }">
               <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
             </button>
          </div>
        </div>
      </div>

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
import { ref, onMounted } from 'vue'
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

function handleLogout() {
  auth.logout()
  router.push('/login')
}

onMounted(() => {
  fetchBalance()
  launchSports()
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
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: #fff;
  border-bottom: 1px solid #f1f5f9;
  z-index: 100;
  flex-shrink: 0;
}
.headerLogo {
  height: 28px;
  object-fit: contain;
}
.btnLogout {
  background: #f1f5f9;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
}

/* Balance Widget */
.balanceWidget {
  padding: 8px 16px;
  background: #fff;
  border-bottom: 1px solid #f1f5f9;
  flex-shrink: 0;
}
.huWalletLabel {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.7rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 2px;
}
.huBalContainer {
  display: flex;
  align-items: center;
  gap: 8px;
}
.huBal {
  font-size: 1.1rem;
  font-weight: 800;
  color: #0f172a;
}
.huRefreshBtn {
  background: none;
  border: none;
  color: #05c0b8;
  padding: 4px;
  cursor: pointer;
  display: flex;
}
.huRefreshBtn.spinning {
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
