<template>
  <div class="full-history-page">
    <div class="mobile-container">
      <header class="header">
        <div class="header-left" @click="router.back()">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </div>
        <div class="header-title">{{ gameMin }} Minutes Bid History</div>
        <div class="header-right"></div>
      </header>

      <div class="content">
        <div v-for="item in myHistory" :key="item.date" class="history-item">
          <div class="history-top">
            <span class="period">Period: {{ item.period }}</span>
            <span :class="['status-badge', item.status?.toLowerCase()]">{{ item.status }}</span>
          </div>
          
          <div class="history-grid">
            <div class="info-box">
              <div class="label">Select</div>
              <div :class="['value', item.select?.toLowerCase()]">{{ item.select }}</div>
            </div>
            <div class="info-box">
              <div class="label">Amount</div>
              <div class="value amount-text">₹{{ item.amount }}</div>
            </div>
            <div class="info-box">
              <div class="label">Result</div>
              <div class="value">{{ item.result }}</div>
            </div>
            <div class="info-box">
              <div class="label">Profit</div>
              <div :class="['value-profit', item.winning > 0 ? 'win' : 'lose']">
                {{ item.winning > 0 ? '+' : '' }}₹{{ item.winning.toFixed(2) }}
              </div>
            </div>
          </div>
          
          <div class="history-bottom">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>{{ formatDate(item.date) }}</span>
          </div>
        </div>
        
        <div v-if="myHistory.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <p>No betting history found.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import * as wingoApi from '../api/wingo'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const myHistory = ref([])
const gameId = computed(() => route.params.id || '1')
const gameMin = computed(() => gameId.value)

const fetchData = async () => {
  if (!auth.user?.id) return
  try {
    const res = await wingoApi.getFullHistory(gameId.value, auth.user.id)
    if (res.data) {
      // Sort by date descending
      myHistory.value = res.data.sort((a, b) => new Date(b.date) - new Date(a.date))
    }
  } catch (err) {
    console.error(err)
  }
}

const formatDate = (ts) => {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(fetchData)
</script>

<style scoped>
.full-history-page {
  background: #f1f5f9;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  font-family: 'Inter', -apple-system, sans-serif;
}

.mobile-container {
  width: 100%;
  max-width: min(430px, 100vw);
  background: #fff;
  min-height: 100vh;
  position: relative;
}

.header {
  height: 60px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid #f1f5f9;
}

.header-left {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}
.header-left:active { transform: scale(0.9); }

.header-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
}
.header-right { width: 40px; }

.content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.history-item {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01);
}

.history-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.period {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
}

.status-badge {
  font-size: 0.7rem;
  padding: 4px 10px;
  border-radius: 8px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}
.status-badge.success { background: #f0fdf4; color: #16a34a; }
.status-badge.fail { background: #fef2f2; color: #dc2626; }

.history-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 12px 0;
  border-top: 1px dashed #f1f5f9;
  border-bottom: 1px dashed #f1f5f9;
}

.info-box .label {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-bottom: 4px;
}

.info-box .value {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
}

.amount-text { color: #0f172a !important; }

.value-profit {
  font-size: 1rem;
  font-weight: 800;
}
.value-profit.win { color: #10b981; }
.value-profit.lose { color: #ef4444; }

.value.green, .value.big { color: #10b981; }
.value.red, .value.small { color: #ef4444; }
.value.violet { color: #8b5cf6; }

.history-bottom {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: #f8fafc;
  border-radius: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.empty-state p {
  color: #64748b;
  font-size: 1rem;
}
</style>
