<template>
  <div class="game-history-page">
    <div class="mobile-container">
      <header class="header">
        <div class="header-content">
          <router-link to="/account" class="back-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </router-link>
          <h1 class="header-title">Game History</h1>
          <div class="header-placeholder"></div>
        </div>
      </header>

      <main class="content">
        <div v-if="loading" class="loader-container">
          <div class="loader"></div>
          <p>Loading...</p>
        </div>

        <div v-else-if="errorMsg" class="error-state">
          <p class="error-text">{{ errorMsg }}</p>
          <button class="retry-btn" @click="fetchHistory">Retry</button>
        </div>

        <div v-else-if="!userId" class="empty-state">
          <p>Please log in to view game history.</p>
          <router-link to="/account" class="back-to-account">Back to Account</router-link>
        </div>

        <div v-else-if="list.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </div>
          <p>No game history yet</p>
          <p class="empty-hint">Your played games will appear here</p>
        </div>

        <div v-else class="history-list">
          <div v-for="(item, idx) in list" :key="item.id || idx" class="history-card">
            <div class="card-row main-row">
              <span class="game-name">{{ item.game || 'Game' }}</span>
              <span v-if="isLaunchEntry(item)" class="amount neutral">Opened</span>
              <span v-else :class="['amount', item.credit ? 'credit' : 'debit']">
                {{ item.credit ? '+' : '-' }}₹{{ formatAmount(item.amount) }}
              </span>
            </div>
            <div class="card-row sub-row">
              <span class="date">{{ formatDate(item.date) }}</span>
              <span v-if="item.note" class="note">{{ formatNote(item.note) }}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import * as walletApi from '../api/wallet'

const auth = useAuthStore()
const loading = ref(true)
const list = ref([])
const errorMsg = ref('')

const userId = computed(() => {
  const id = auth.user?.id
  if (id != null) return id
  try {
    const raw = localStorage.getItem('user')
    if (raw) {
      const parsed = JSON.parse(raw)
      return parsed?.result?.id ?? parsed?.id ?? null
    }
  } catch (_) {}
  return null
})

function formatAmount(val) {
  const n = Number(val)
  return isNaN(n) ? '0.00' : n.toFixed(2)
}

function formatDate(dateVal) {
  if (dateVal == null || dateVal === '') return '—'
  const d = new Date(dateVal)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatNote(note) {
  if (!note || typeof note !== 'string') return ''
  if (note.startsWith('Game Bet:')) return 'Bet: ' + note.replace(/^Game Bet:\s*/i, '').trim()
  if (note.startsWith('Game Win:')) return 'Win: ' + note.replace(/^Game Win:\s*/i, '').trim()
  if (note.startsWith('Game Launched:')) return 'Launched: ' + note.replace(/^Game Launched:\s*/i, '').trim()
  return note
}

function isLaunchEntry(item) {
  const note = item.note && String(item.note)
  return note && note.includes('Game Launched')
}

async function fetchHistory() {
  const uid = userId.value
  errorMsg.value = ''
  if (!uid) {
    loading.value = false
    return
  }
  loading.value = true
  try {
    const res = await walletApi.getUserHomeWithPlayHistory(uid)
    const data = res?.data
    const arr = Array.isArray(data) && data.length > 0 && data[0].playHistory
      ? data[0].playHistory
      : Array.isArray(data)
        ? []
        : []
    list.value = (arr || []).map((item) => ({
      ...item,
      amount: item.amount != null ? Number(item.amount) : 0,
      date: item.date != null ? item.date : 0,
    }))
  } catch (err) {
    console.error('Error fetching game history:', err)
    list.value = []
    const status = err.response?.status
    const msg = err.response?.data?.message || err.response?.data?.msg
    if (status === 401) {
      errorMsg.value = 'Please log in again.'
    } else if (msg) {
      errorMsg.value = msg
    } else {
      errorMsg.value = 'Could not load game history. Check your connection and try again.'
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchHistory()
})
</script>

<style scoped>
.game-history-page {
  min-height: 100vh;
  background-color: #f1f5f9;
  display: flex;
  justify-content: center;
  font-family: 'Inter', -apple-system, sans-serif;
  color: #1e293b;
}

.mobile-container {
  width: 100%;
  max-width: min(430px, 100vw);
  background-color: #fff;
  min-height: 100vh;
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  border-bottom: 1px solid #f1f5f9;
}

.header-content {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.back-link {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  text-decoration: none;
}

.back-link:active { transform: scale(0.9); }

.header-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.header-placeholder { width: 40px; }

.content {
  padding: 16px;
  padding-bottom: 80px;
}

.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  color: #64748b;
}

.loader {
  width: 36px;
  height: 36px;
  border: 3px solid #e2e8f0;
  border-top-color: #0d9488;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.7;
}

.empty-state p {
  margin: 0;
  color: #64748b;
  font-size: 1rem;
}

.empty-hint {
  margin-top: 8px;
  font-size: 0.875rem;
  opacity: 0.8;
}

.error-state {
  text-align: center;
  padding: 32px 24px;
}
.error-text {
  color: #dc2626;
  margin: 0 0 16px;
  font-size: 0.95rem;
}
.retry-btn {
  padding: 10px 20px;
  background: #0d9488;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.retry-btn:active { opacity: 0.9; }
.back-to-account {
  display: inline-block;
  margin-top: 12px;
  color: #0d9488;
  font-weight: 600;
  text-decoration: none;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
}

.card-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.main-row {
  margin-bottom: 6px;
}

.game-name {
  font-weight: 700;
  color: #0f172a;
  font-size: 0.95rem;
}

.amount {
  font-weight: 700;
  font-size: 1rem;
}

.amount.credit { color: #059669; }
.amount.debit { color: #dc2626; }
.amount.neutral { color: #64748b; font-weight: 600; }

.sub-row {
  font-size: 0.8rem;
  color: #64748b;
}

.date { flex-shrink: 0; }
.note { text-align: right; }
</style>
