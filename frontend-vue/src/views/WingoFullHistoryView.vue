<template>
  <div class="full-history-page">
    <header class="header">
      <div class="header-left" @click="router.back()">
        <span class="back-icon">‹</span>
      </div>
      <div class="header-title">{{ gameMin }} Minutes Bid History</div>
      <div class="header-right"></div>
    </header>

    <div class="content">
      <div v-for="item in myHistory" :key="item.date" class="history-item shadow-sm">
        <div class="history-top d-flex justify-content-between align-items-center mb-2">
          <span class="period text-muted">Period: {{ item.period }}</span>
          <span :class="['status-badge', item.status?.toLowerCase()]">{{ item.status }}</span>
        </div>
        <div class="history-grid">
          <div class="info-box">
            <div class="label">Select</div>
            <div :class="['value', item.select?.toLowerCase()]">{{ item.select }}</div>
          </div>
          <div class="info-box">
            <div class="label">Amount</div>
            <div class="value">₹{{ item.amount }}</div>
          </div>
          <div class="info-box">
            <div class="label">Result</div>
            <div class="value">{{ item.result }}</div>
          </div>
          <div class="info-box">
            <div class="label">Profit</div>
            <div :class="['value', item.winning > 0 ? 'win' : 'lose']">
              {{ item.winning > 0 ? '+' : '' }}₹{{ item.winning }}
            </div>
          </div>
        </div>
        <div class="history-bottom mt-2 pt-2 border-top text-muted small">
          {{ formatDate(item.date) }}
        </div>
      </div>
      <div v-if="myHistory.length === 0" class="empty-state text-center p-5">
        <p class="text-muted">No betting history found.</p>
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
    if (res.data) myHistory.value = res.data
  } catch (err) {
    console.error(err)
  }
}

const formatDate = (ts) => {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleString()
}

onMounted(fetchData)
</script>

<style scoped>
.full-history-page {
  background: #f7f9fc;
  min-height: 100vh;
}
.header {
  height: 50px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid #eee;
}
.back-icon {
  font-size: 30px;
  color: #666;
  cursor: pointer;
}
.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}
.content {
  padding: 15px;
}
.history-item {
  background: #fff;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
  border: 1px solid #edf2f7;
}
.history-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.info-box .label {
  font-size: 11px;
  color: #718096;
  text-transform: uppercase;
  margin-bottom: 2px;
}
.info-box .value {
  font-size: 14px;
  font-weight: 500;
  color: #2d3748;
}
.value.win { color: #48bb78; }
.value.lose { color: #e53e3e; }
.value.success { color: #48bb78; }
.value.fail { color: #e53e3e; }

.status-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 100px;
  font-weight: 600;
  text-transform: uppercase;
}
.status-badge.success { background: #e6fffa; color: #319795; }
.status-badge.fail { background: #fff5f5; color: #c53030; }

.shadow-sm {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}
.border-top { border-top: 1px solid #edf2f7 !important; }
.d-flex { display: flex; }
.justify-content-between { justify-content: space-between; }
.align-items-center { align-items: center; }
.mb-2 { margin-bottom: 8px; }
.mt-2 { margin-top: 8px; }
.pt-2 { padding-top: 8px; }
.text-muted { color: #718096; }
.small { font-size: 11px; }
</style>
