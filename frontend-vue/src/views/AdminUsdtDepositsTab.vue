<template>
  <div class="usdt-deposits-view">
    <div class="section-header">
      <h2>USDT Deposits – Manual Approve</h2>
      <p class="hint">Pending Upay/USDT deposits. Approve after confirming payment received.</p>
      <button class="refresh-btn" @click="fetchList" :disabled="loading">
        {{ loading ? 'Loading...' : 'Refresh' }}
      </button>
    </div>

    <div v-if="loading && !list.length" class="loader">
      <div class="spinner"></div>
      <p>Loading pending deposits...</p>
    </div>

    <div v-else-if="!list.length" class="no-data">
      <span class="no-data-icon">✓</span>
      <p>No pending USDT deposits</p>
    </div>

    <div v-else class="table-container">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>User ID</th>
            <th>Amount (₹)</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in list" :key="row.id">
            <td class="bold">{{ row.id }}</td>
            <td>{{ row.userId }}</td>
            <td class="amount success">₹{{ (row.amount || 0).toLocaleString('en-IN') }}</td>
            <td>{{ formatDate(row.date) }}</td>
            <td>
              <button
                class="action-btn success"
                :disabled="approvingId === row.id"
                @click="approve(row.id)"
              >
                {{ approvingId === row.id ? 'Approving...' : 'Approve' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as adminApi from '../api/admin'

const ADMIN_API_KEY = '0f58faf1-20ea-489b-ad86-948cbdc9b7a3'
const list = ref([])
const loading = ref(false)
const approvingId = ref(null)

const formatDate = (ts) => {
  if (!ts) return '-'
  const d = new Date(ts)
  return d.toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await adminApi.getUsdtDepositsPending(ADMIN_API_KEY)
    if (res.data && res.data.success) list.value = res.data.data || []
    else list.value = []
  } catch (err) {
    list.value = []
  } finally {
    loading.value = false
  }
}

const approve = async (transactionId) => {
  if (!confirm('Approve this USDT deposit and credit user balance?')) return
  approvingId.value = transactionId
  try {
    const res = await adminApi.approveUsdtDeposit(ADMIN_API_KEY, transactionId)
    if (res.data && res.data.success) {
      alert(res.data.message || 'Approved successfully')
      await fetchList()
    } else {
      alert(res.data?.message || 'Approve failed')
    }
  } catch (err) {
    alert(err.response?.data?.message || 'Approve failed')
  } finally {
    approvingId.value = null
  }
}

onMounted(fetchList)
</script>

<style scoped>
.usdt-deposits-view {
  padding: 0;
  font-family: var(--font-app);
}
.section-header {
  margin-bottom: 24px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}
.section-header h2 {
  font-size: 1.35rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 4px 0;
}
.section-header .hint {
  width: 100%;
  color: #64748b;
  margin: 0;
  font-size: 0.9rem;
}
.refresh-btn {
  padding: 10px 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #fff;
  font-weight: 700;
  cursor: pointer;
}
.refresh-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.loader, .no-data {
  text-align: center;
  padding: 48px 16px;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #edf2f7;
}
.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #f1f5f9;
  border-top-color: #38bdf8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 12px;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.no-data-icon {
  font-size: 2rem;
  color: #10b981;
  display: block;
  margin-bottom: 8px;
}
.no-data p, .loader p {
  margin: 0;
  color: #64748b;
}
.table-container {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #edf2f7;
  overflow-x: auto;
}
.admin-table {
  width: 100%;
  border-collapse: collapse;
}
.admin-table th {
  background: #f8fafc;
  padding: 14px 16px;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
}
.admin-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9rem;
}
.bold { font-weight: 700; color: #0f172a; }
.amount.success { color: #10b981; font-weight: 800; }
.action-btn.success {
  background: #22c55e;
  color: #fff;
  border: none;
  padding: 8px 14px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.85rem;
}
.action-btn.success:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
@media (max-width: 767px) {
  .admin-table th, .admin-table td { padding: 10px 12px; font-size: 0.8rem; }
  .action-btn.success { padding: 6px 12px; font-size: 0.8rem; }
}
</style>
