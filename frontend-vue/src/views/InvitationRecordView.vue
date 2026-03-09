<template>
  <div class="invitation-record-page">
    <div class="mobile-container">
      <!-- Header -->
      <header class="header">
        <div class="header-content">
          <router-link to="/invitationBonus" class="back-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </router-link>
          <h1 class="header-title">Invitation Record</h1>
          <div class="header-placeholder"></div>
        </div>
      </header>

      <!-- Content -->
      <main class="content">
        <!-- Stats Row -->
        <div class="stats-row">
          <div class="stat-card">
            <span class="stat-value">{{ totalInvites }}</span>
            <span class="stat-label">Total Invites</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ qualifiedInvites }}</span>
            <span class="stat-label">Qualified</span>
          </div>
        </div>

        <!-- Table Card -->
        <div class="record-card shadow-premium">
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <span>Loading records...</span>
          </div>
          
          <div v-else-if="records.length === 0" class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <p>No invitations found yet.</p>
            <router-link to="/invite" class="invite-now-btn">Invite Now</router-link>
          </div>

          <table v-else class="record-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Join Date</th>
                <th class="text-right">Recharge</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(record, index) in records" :key="index">
                <td class="user-id">{{ record.name }}</td>
                <td class="join-date">{{ record.dateInvited }}</td>
                <td class="recharge text-right" :class="{ 'has-recharge': record.totalRecharge !== '₹0' }">
                  {{ record.totalRecharge }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination or Load More if needed (kept simple for now) -->
        <div v-if="records.length > 0" class="list-end">
          <span>End of records</span>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getInviteRecord } from '../api/bonus'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const records = ref([])
const loading = ref(true)

const totalInvites = computed(() => records.value.length)
const qualifiedInvites = computed(() => {
  return records.value.filter(r => r.totalRecharge !== '₹0').length
})

const fetchRecords = async () => {
  loading.value = true
  try {
    const userId = auth.user?.id
    if (!userId) return
    const res = await getInviteRecord(userId)
    records.value = res.data
  } catch (err) {
    console.error('Failed to fetch invitation records:', err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchRecords)
</script>

<style scoped>
.invitation-record-page {
  min-height: 100vh;
  background-color: #f8fafc;
  display: flex;
  justify-content: center;
  font-family: 'Inter', sans-serif;
}

.mobile-container {
  width: 100%;
  max-width: min(430px, 100vw);
  background-color: #fff;
  min-height: 100vh;
}

/* Header */
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
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

.header-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
}
.header-placeholder { width: 40px; }

/* Content */
.content {
  padding: 16px;
}

.stats-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0d9488;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Record Card */
.record-card {
  background: #fff;
  border-radius: 20px;
  border: 1px solid #f1f5f9;
  overflow: hidden;
  min-height: 300px;
}

.record-table {
  width: 100%;
  border-collapse: collapse;
}

.record-table th {
  text-align: left;
  padding: 12px 16px;
  background: #f8fafc;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #f1f5f9;
}

.record-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f8fafc;
  font-size: 0.85rem;
  color: #334155;
}

.user-id {
  font-weight: 600;
  color: #0f172a;
}

.join-date {
  color: #94a3b8;
  font-size: 0.8rem;
}

.recharge {
  font-weight: 700;
  color: #cbd5e1;
}

.recharge.has-recharge {
  color: #10b981;
}

.text-right { text-align: right; }

/* States */
.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f1f5f9;
  border-top-color: #0d9488;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.empty-state p {
  color: #94a3b8;
  font-size: 0.9rem;
}

.invite-now-btn {
  background: #0d9488;
  color: white;
  text-decoration: none;
  padding: 10px 24px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 700;
  transition: all 0.2s;
}

.list-end {
  text-align: center;
  padding: 24px;
  color: #cbd5e1;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.shadow-premium {
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
}
</style>
