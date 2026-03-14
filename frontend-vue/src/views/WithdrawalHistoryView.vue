<template>
  <div class="withdrawal-history-page">
    <div class="mobile-container">
      <!-- Sticky Header -->
      <header class="header">
        <div class="header-content">
          <router-link to="/withdrawal" class="back-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </router-link>
          <h1 class="header-title">Withdrawal History</h1>
          <div class="header-placeholder"></div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="content">
        <!-- Date Filter -->
        <div class="date-filter-wrap">
          <label class="date-filter-label">Date</label>
          <div class="date-filter-options">
            <button 
              v-for="opt in dateOptions" 
              :key="opt.value"
              :class="['date-btn', { active: dateFilter === opt.value }]"
              @click="dateFilter = opt.value"
            >
              {{ opt.label }}
            </button>
          </div>
          <!-- Custom date range (From - To) when Custom is selected -->
          <div v-if="dateFilter === 'custom'" class="calendar-row">
            <div class="calendar-field">
              <label class="calendar-label">From</label>
              <input type="date" v-model="calendarFrom" class="calendar-input" />
            </div>
            <div class="calendar-field">
              <label class="calendar-label">To</label>
              <input type="date" v-model="calendarTo" class="calendar-input" />
            </div>
          </div>
        </div>

        <!-- Status Filter Tabs -->
        <div class="filter-tabs">
          <button 
            v-for="tab in tabs" 
            :key="tab.value"
            :class="['tab-btn', { active: activeTab === tab.value }]"
            @click="activeTab = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- History List -->
        <div v-if="loading" class="loader-container">
          <div class="loader"></div>
          <p>Loading records...</p>
        </div>

        <div v-else-if="filteredHistory.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M7 14h.01"/><path d="M17 14h.01"/><path d="M7 18h.01"/><path d="M12 18h.01"/><path d="M17 18h.01"/><path d="M12 14h.01"/></svg>
          </div>
          <p>No withdrawal records found</p>
          <router-link to="/withdrawal" class="withdraw-now-btn">Withdraw Now</router-link>
        </div>

        <div v-else class="history-list">
          <div 
            v-for="item in filteredHistory" 
            :key="item._id" 
            class="history-card"
          >
            <div class="card-header">
              <div class="amount-wrap">
                <span class="currency">₹</span>
                <span class="amount">{{ item.amount }}</span>
              </div>
              <div :class="['status-badge', getStatusClass(item.status)]">
                {{ item.status }}
              </div>
            </div>

            <div class="card-details">
              <div class="detail-row">
                <span class="label">Time</span>
                <span class="value">{{ formatDate(item.date) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Type</span>
                <span class="value">{{ item.type || 'Bank Transfer' }}</span>
              </div>
              <div v-if="item.accountNumber" class="detail-row">
                <span class="label">Account</span>
                <span class="value">****{{ item.accountNumber.slice(-4) }}</span>
              </div>
              <div v-if="item.rejectReason && item.status !== 'Success' && item.status !== 'Pending' && item.status !== 'Placed'" class="reject-box">
                <span class="label">Reason:</span>
                <span class="reason">{{ item.rejectReason }}</span>
              </div>
              <div v-else-if="item.status && item.status !== 'Success' && item.status !== 'Pending' && item.status !== 'Placed'" class="reject-box">
                <span class="label">Status:</span>
                <span class="reason">{{ item.status }}</span>
              </div>
            </div>
            
            <div class="card-footer">
              <span class="order-id">ID: {{ item.orderId || item._id.slice(-12) }}</span>
              <div class="fees" v-if="item.fees">Fee: ₹{{ item.fees }}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import * as walletApi from '../api/wallet'

const router = useRouter()
const auth = useAuthStore()

const loading = ref(true)
const history = ref([])
const activeTab = ref('all')
const dateFilter = ref('all')

const dateOptions = [
  { label: 'All', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Custom', value: 'custom' }
]

const calendarFrom = ref('')
const calendarTo = ref('')

const tabs = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Success', value: 'Success' },
  { label: 'Rejected', value: 'Rejected' }
]

function isInDateRange(itemDate, range) {
  if (range === 'all') return true
  const d = new Date(itemDate)
  d.setHours(0, 0, 0, 0)
  const now = new Date()
  now.setHours(23, 59, 59, 999)
  if (range === 'today') {
    const today = new Date(now)
    today.setHours(0, 0, 0, 0)
    return d.getTime() >= today.getTime()
  }
  if (range === '7d') {
    const start = new Date(now)
    start.setDate(start.getDate() - 7)
    start.setHours(0, 0, 0, 0)
    return d.getTime() >= start.getTime()
  }
  if (range === 'custom') {
    if (!calendarFrom.value && !calendarTo.value) return true
    const from = calendarFrom.value ? new Date(calendarFrom.value) : null
    const to = calendarTo.value ? new Date(calendarTo.value) : null
    if (from && d.getTime() < from.getTime()) return false
    if (to) {
      const toEnd = new Date(to)
      toEnd.setHours(23, 59, 59, 999)
      if (d.getTime() > toEnd.getTime()) return false
    }
    return true
  }
  return true
}

const fetchHistory = async () => {
  if (!auth.user?.id) return
  loading.value = true
  try {
    const res = await walletApi.getWithdrawalHistory(auth.user.id)
    if (res.data && Array.isArray(res.data)) {
      // Sort by date descending
      history.value = res.data.sort((a, b) => new Date(b.date) - new Date(a.date))
    }
  } catch (err) {
    console.error('Error fetching history:', err)
  } finally {
    loading.value = false
  }
}

const filteredHistory = computed(() => {
  let list = history.value
  list = list.filter(item => isInDateRange(item.date, dateFilter.value))
  if (activeTab.value === 'all') return list
  if (activeTab.value === 'Rejected') {
    return list.filter(item => !['Success', 'Pending', 'Placed'].includes(item.status))
  }
  return list.filter(item => item.status === activeTab.value)
})

const getStatusClass = (status) => {
  if (status === 'Success') return 'status-success'
  if (status === 'Pending' || status === 'Placed') return 'status-pending'
  return 'status-rejected'
}

const formatDate = (dateStr) => {
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
.withdrawal-history-page {
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

/* Date Filter */
.date-filter-wrap {
  padding: 12px 16px 0;
}
.date-filter-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 8px;
}
.date-filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.date-btn {
  padding: 8px 14px;
  border-radius: 20px;
  background: #f8fafc;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid #e2e8f0;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
}
.date-btn.active {
  background: #0f172a;
  color: #fff;
  border-color: #0f172a;
}

.calendar-row {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  flex-wrap: wrap;
}
.calendar-field {
  flex: 1;
  min-width: 120px;
}
.calendar-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 4px;
}
.calendar-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.9rem;
  color: #0f172a;
  background: #fff;
}
.calendar-input:focus {
  outline: none;
  border-color: #0d9488;
  box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.15);
}

/* Filter Tabs */
.filter-tabs {
  display: flex;
  padding: 16px;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
}

.filter-tabs::-webkit-scrollbar { display: none; }

.tab-btn {
  padding: 8px 16px;
  border-radius: 20px;
  background: #f8fafc;
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 600;
  border: 1px solid #e2e8f0;
  white-space: nowrap;
  transition: all 0.2s;
  cursor: pointer;
}

.tab-btn.active {
  background: #0d9488;
  color: #fff;
  border-color: #0d9488;
  box-shadow: 0 4px 10px rgba(13, 148, 136, 0.2);
}

/* History Cards */
.history-list {
  padding: 0 16px 40px;
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
  color: #0f172a;
}

.amount {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.status-pending { background: #fff7ed; color: #ea580c; border: 1px solid #ffedd5; }
.status-success { background: #f0fdf4; color: #16a34a; border: 1px solid #dcfce7; }
.status-rejected { background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2; }

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

.reject-box {
  margin-top: 4px;
  padding: 8px 12px;
  background: #fff1f2;
  border-radius: 8px;
  font-size: 0.8rem;
}

.reject-box .label { color: #be123c; font-weight: 600; margin-right: 4px; }
.reason { color: #e11d48; }

.card-footer {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-id {
  font-size: 0.75rem;
  color: #94a3b8;
  font-family: monospace;
}

.fees {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
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

.withdraw-now-btn {
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
