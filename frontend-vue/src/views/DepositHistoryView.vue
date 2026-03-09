<template>
  <div class="deposit-history-page">
    <div class="mobile-container">
      <!-- Sticky Header -->
      <header class="header">
        <div class="header-content">
          <router-link to="/deposit" class="back-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </router-link>
          <h1 class="header-title">Deposit History</h1>
          <div class="header-placeholder"></div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="content">
        <!-- History List -->
        <div v-if="loading" class="loader-container">
          <div class="loader"></div>
          <p>Loading records...</p>
        </div>

        <div v-else-if="history.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M7 14h.01"/><path d="M17 14h.01"/><path d="M7 18h.01"/><path d="M12 18h.01"/><path d="M17 18h.01"/><path d="M12 14h.01"/></svg>
          </div>
          <p>No deposit records found</p>
          <router-link to="/deposit" class="deposit-now-btn">Deposit Now</router-link>
        </div>

        <div v-else class="history-list">
          <div 
            v-for="(item, idx) in history" 
            :key="idx" 
            class="history-card"
          >
            <div class="card-header">
              <div class="amount-wrap">
                <span class="currency">₹</span>
                <span class="amount">{{ item.amount }}</span>
              </div>
              <div class="status-badge status-success">
                Successful
              </div>
            </div>

            <div class="card-details">
              <div class="detail-row">
                <span class="label">Time</span>
                <span class="value">{{ formatDate(item.date) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Payment Mode</span>
                <span class="value">UPI / Gateway</span>
              </div>
              <div class="detail-row">
                <span class="label">Transaction Type</span>
                <span class="value">Wallet Recharge</span>
              </div>
            </div>
            
            <div class="card-footer">
              <span class="order-id">Status: Verified</span>
              <div class="status-tag">Completed</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import * as walletApi from '../api/wallet'

const router = useRouter()
const auth = useAuthStore()

const loading = ref(true)
const history = ref([])

const fetchHistory = async () => {
  if (!auth.user?.id) return
  loading.value = true
  try {
    const res = await walletApi.getUserHome(auth.user.id)
    if (res.data && res.data.length > 0) {
      const userData = res.data[0]
      if (Array.isArray(userData.rechargeHistory)) {
        history.value = [...userData.rechargeHistory].reverse()
      }
    }
  } catch (err) {
    console.error('Error fetching history:', err)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchHistory()
})
</script>

<style scoped>
.deposit-history-page {
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
  position: relative;
}

/* Header Styles */
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
  transition: all 0.2s;
}

.back-link:active { transform: scale(0.9); }

.header-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.header-placeholder { width: 40px; }

/* History Cards */
.history-list {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.amount-wrap {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.currency {
  font-size: 1.1rem;
  font-weight: 600;
  color: #0d9488;
}

.amount {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0d9488;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.status-success { background: #f0fdf4; color: #16a34a; border: 1px solid #dcfce7; }

.card-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 0;
  border-top: 1px dashed #f1f5f9;
  border-bottom: 1px dashed #f1f5f9;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  font-size: 0.85rem;
  color: #94a3b8;
}

.value {
  font-size: 0.85rem;
  font-weight: 500;
  color: #334155;
}

.card-footer {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-id {
  font-size: 0.75rem;
  color: #94a3b8;
}

.status-tag {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  text-align: center;
}

.empty-icon {
  width: 120px;
  height: 120px;
  background: #f8fafc;
  border-radius: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.empty-state p {
  color: #64748b;
  font-size: 1rem;
  margin-bottom: 24px;
}

.deposit-now-btn {
  padding: 12px 24px;
  background: #0d9488;
  color: #fff;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.2);
}

/* Loader */
.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px;
}

.loader {
  width: 40px;
  height: 40px;
  border: 3px solid #f1f5f9;
  border-top-color: #0d9488;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
