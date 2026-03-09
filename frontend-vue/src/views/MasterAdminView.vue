<template>
  <div class="master-admin-container">
    <!-- Login Screen -->
    <div v-if="!isAuthenticated" class="admin-login-overlay">
      <div class="login-card shadow-premium">
        <div class="admin-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0d9488" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <h2>Master Admin Login</h2>
        <p>Enter administrative password to proceed</p>
        <div class="input-group">
          <input 
            type="password" 
            v-model="adminPassword" 
            placeholder="Admin Password" 
            @keyup.enter="handleLogin"
            autofocus
          />
          <button @click="handleLogin" :disabled="loading">
            {{ loading ? 'Verifying...' : 'Login' }}
          </button>
        </div>
        <p v-if="error" class="error-text">{{ error }}</p>
      </div>
    </div>

    <!-- Admin Panel -->
    <div v-else class="admin-layout">
      <!-- Sidebar -->
      <aside v-if="!isMobile || showSidebar" class="sidebar">
        <div class="sidebar-header">
          <div class="admin-brand">
            <span class="brand-text">Master Admin</span>
          </div>
          <button v-if="isMobile" @click="showSidebar = false" class="close-sidebar">×</button>
        </div>
        
        <nav class="sidebar-nav">
          <button 
            v-for="tab in tabs" 
            :key="tab.id" 
            :class="['nav-item', { active: activeTab === tab.id }]"
            @click="activeTab = tab.id; showSidebar = false"
          >
            <span v-html="tab.icon"></span>
            {{ tab.label }}
          </button>
        </nav>

        <div class="sidebar-footer">
          <button @click="handleLogout" class="logout-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            Logout
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <header class="content-header">
          <div class="header-left">
            <button v-if="isMobile" @click="showSidebar = true" class="menu-trigger">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <h1>{{ activeTabLabel }}</h1>
          </div>
          <div class="header-right">
            <div class="status-indicator">
              <span class="dot"></span>
              Live System
            </div>
          </div>
        </header>

        <section class="tab-view">
          <!-- DASHBOARD -->
          <div v-if="activeTab === 'dashboard'" class="dashboard-grid">
            <div class="stat-card" v-for="(val, key) in stats" :key="key">
              <span class="stat-title">{{ formatStatKey(key) }}</span>
              <span class="stat-value">{{ formatStatVal(val, key) }}</span>
            </div>
            
            <div class="full-card chart-placeholder">
              <h3>Real-time Activity Summary</h3>
              <p>System monitoring active. No anomalies detected.</p>
            </div>
          </div>

          <!-- USER MANAGEMENT -->
          <div v-if="activeTab === 'users'" class="users-view">
            <div class="action-bar">
              <div class="search-wrap">
                <input v-model="userSearch" placeholder="Search by phone or ID..." />
              </div>
              <button @click="fetchUsers" class="refresh-btn">Refresh List</button>
            </div>
            
            <div class="table-wrap shadow-premium">
              <table>
                <thead>
                  <tr>
                    <th>UID</th>
                    <th>Phone</th>
                    <th>Name</th>
                    <th>Balance</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in filteredUsers" :key="user.id">
                    <td>{{ user.id }}</td>
                    <td>{{ user.phone }}</td>
                    <td>{{ user.username || 'Member' }}</td>
                    <td>₹{{ user.balance?.toFixed(2) }}</td>
                    <td>{{ new Date(user.date).toLocaleDateString() }}</td>
                    <td>
                      <span :class="['status-badge', user.block ? 'blocked' : 'active']">
                        {{ user.block ? 'Blocked' : 'Active' }}
                      </span>
                    </td>
                    <td class="actions">
                      <button @click="openEditUser(user)" class="edit-btn">Edit</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- GAME MANAGEMENT -->
          <div v-if="activeTab === 'games'" class="games-view">
            <div class="info-banner">
              <p>Consolidated Game Manager. Control which games appear on the home screen and sidebar.</p>
              <router-link to="/admin/games" class="legacy-link">Go to Full Game Editor</router-link>
            </div>
            <!-- More game controls can be added here -->
          </div>

          <!-- COMMISSION -->
          <div v-if="activeTab === 'commission'" class="commission-view">
             <div class="config-card shadow-premium">
                <h3>Agent Commission Tiers</h3>
                <div v-if="commLoading" class="local-loader">Loading configs...</div>
                <div v-else class="comm-list">
                   <div v-for="config in commConfigs" :key="config._id" class="comm-item">
                      <span>{{ config.type }} Layer</span>
                      <input v-model="config.percentage" type="number" step="0.1" />
                      <span>%</span>
                   </div>
                   <button class="save-comm-btn" @click="saveCommission">Update Tiers</button>
                </div>
             </div>
          </div>
        </section>
      </main>
    </div>

    <!-- Edit User Modal -->
    <div v-if="editingUser" class="modal-overlay" @click.self="editingUser = null">
      <div class="modal-card shadow-premium">
        <h3>Edit User: {{ editingUser.phone }}</h3>
        <div class="form-group">
          <label>Wallet Balance (₹)</label>
          <input v-model.number="editForm.balance" type="number" />
        </div>
        <div class="form-group">
          <label>Account Status</label>
          <select v-model="editForm.block">
            <option :value="false">Active (Normal)</option>
            <option :value="true">Blocked (No Login)</option>
          </select>
        </div>
        <div class="modal-actions">
          <button @click="editingUser = null" class="cancel-btn">Cancel</button>
          <button @click="saveUserEdit" class="save-btn" :disabled="saving">
            {{ saving ? 'Saving...' : 'Save User' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import * as adminApi from '../api/admin'

// Auth State
const isAuthenticated = ref(localStorage.getItem('admin_authenticated') === 'true')
const adminPassword = ref('')
const loading = ref(false)
const error = ref('')

// Tabs
const tabs = [
  { id: 'dashboard', label: 'Overview', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>' },
  { id: 'users', label: 'User Manager', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-3-3.87"/><path d="M9 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
  { id: 'games', label: 'Game Panel', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>' },
  { id: 'commission', label: 'Commission', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' },
]
const activeTab = ref('dashboard')
const activeTabLabel = computed(() => tabs.find(t => t.id === activeTab.value)?.label)

// Main Data
const stats = ref({})
const users = ref([])
const userSearch = ref('')
const commConfigs = ref([])
const commLoading = ref(false)

// UI State
const isMobile = ref(false)
const showSidebar = ref(false)
const ADMIN_API_KEY = '0f58faf1-20ea-489b-ad86-948cbdc9b7a3'

// User Editing
const editingUser = ref(null)
const editForm = ref({ balance: 0, block: false })
const saving = ref(false)

// Auth Logic
const handleLogin = () => {
  if (adminPassword.value === 'Master@Rush2024') {
    isAuthenticated.value = true
    localStorage.setItem('admin_authenticated', 'true')
    error.value = ''
    fetchDashboard()
  } else {
    error.value = 'Invalid administrative password.'
  }
}

const handleLogout = () => {
  isAuthenticated.value = false
  localStorage.removeItem('admin_authenticated')
}

// Data Fetching
const fetchDashboard = async () => {
  try {
    const res = await adminApi.getAdminStats(ADMIN_API_KEY)
    stats.value = res.data.data
  } catch (err) {}
}

const fetchUsers = async () => {
  try {
    const res = await adminApi.getAllUsers(ADMIN_API_KEY)
    users.value = res.data.data
  } catch (err) {}
}

const fetchCommission = async () => {
  commLoading.value = true
  try {
    const res = await adminApi.getCommissionConfigs(ADMIN_API_KEY)
    commConfigs.value = res.data.data
  } catch (err) {} finally { commLoading.value = false }
}

const filteredUsers = computed(() => {
  if (!userSearch.value) return users.value
  const q = userSearch.value.toLowerCase()
  return users.value.filter(u => 
    u.phone.toString().includes(q) || 
    u.id.toString().includes(q) ||
    u.username?.toLowerCase().includes(q)
  )
})

// Edit User
const openEditUser = (user) => {
  editingUser.value = user
  editForm.value = { balance: user.balance, block: user.block }
}

const saveUserEdit = async () => {
  saving.value = true
  try {
    await adminApi.updateUser(ADMIN_API_KEY, {
      userId: editingUser.value.id,
      ...editForm.value
    })
    editingUser.value = null
    fetchUsers()
  } catch (err) {
    alert('Failed to update user')
  } finally { saving.value = false }
}

const saveCommission = () => {
  alert('Commission saving logic connected. (Mock for now)')
}

// Helpers
const formatStatKey = (key) => {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
}
const formatStatVal = (val, key) => {
  if (key.includes('Recharge') || key.includes('Withdrawal')) return `₹${val.toLocaleString()}`
  return val
}

// Lifecycle & Responsiveness
const checkRes = () => {
  isMobile.value = window.innerWidth < 1024
}

onMounted(() => {
  checkRes()
  window.addEventListener('resize', checkRes)
  if (isAuthenticated.value) {
    fetchDashboard()
    fetchUsers()
    fetchCommission()
  }
})

watch(activeTab, (newTab) => {
  if (newTab === 'users' && users.value.length === 0) fetchUsers()
  if (newTab === 'commission' && commConfigs.value.length === 0) fetchCommission()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.master-admin-container {
  min-height: 100vh;
  background-color: #f8fafc;
  color: #1e293b;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

/* Login Overlay */
.admin-login-overlay {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at top right, #f0fdfa, #f8fafc);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.login-card {
  background: #fff;
  width: 100%;
  max-width: 400px;
  padding: 40px;
  border-radius: 24px;
  text-align: center;
  border: 1px solid #f1f5f9;
}

.admin-icon {
  width: 80px;
  height: 80px;
  background: #f0fdfa;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.login-card h2 { font-size: 1.5rem; font-weight: 800; margin-bottom: 8px; color: #0f172a; }
.login-card p { color: #64748b; font-size: 0.9rem; margin-bottom: 32px; }

.input-group { display: flex; flex-direction: column; gap: 16px; }
.input-group input { 
  padding: 16px; 
  border-radius: 12px; 
  border: 1.5px solid #e2e8f0; 
  font-size: 1rem; 
  outline: none;
  transition: all 0.2s;
}
.input-group input:focus { border-color: #0d9488; box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.1); }
.input-group button {
  background: #0d9488;
  color: #fff;
  padding: 16px;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.2);
}

.error-text { color: #ef4444; font-size: 0.85rem; font-weight: 600; margin-top: 16px; }

/* Admin Layout */
.admin-layout {
  display: flex;
  height: 100vh;
}

/* Sidebar */
.sidebar {
  width: 280px;
  background: #0f172a;
  color: #fff;
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

.sidebar-header {
  padding: 32px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand-text { font-size: 1.25rem; font-weight: 800; letter-spacing: -0.02em; color: #2dd4bf; }

.sidebar-nav { flex: 1; padding: 0 12px; display: flex; flex-direction: column; gap: 4px; }
.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-weight: 600;
  font-size: 0.95rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-item:hover { background: rgba(255,255,255,0.05); color: #fff; }
.nav-item.active { background: #0d9488; color: #fff; }

.sidebar-footer { padding: 24px; border-top: 1px solid rgba(255,255,255,0.05); }
.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
  border: none;
  padding: 12px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
}

/* Main Content */
.main-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.content-header {
  height: 80px;
  background: #fff;
  border-bottom: 1px solid #f1f5f9;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 900;
}

.header-left { display: flex; align-items: center; gap: 16px; }
.header-left h1 { font-size: 1.5rem; font-weight: 800; color: #0f172a; margin: 0; }

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f0fdf4;
  color: #166534;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 8px #22c55e; }

.tab-view { padding: 32px; }

/* Dashboard Cards */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
}

.stat-card {
  background: #fff;
  padding: 24px;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
}

.stat-title { font-size: 0.85rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.02em; }
.stat-value { font-size: 1.75rem; font-weight: 800; color: #0f172a; }

.full-card { 
  grid-column: 1 / -1; 
  background: #fff; 
  padding: 32px; 
  border-radius: 24px; 
  border: 1px solid #f1f5f9; 
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

/* User Table */
.action-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 16px;
}

.search-wrap { flex: 1; max-width: 400px; }
.search-wrap input { width: 100%; padding: 12px 16px; border-radius: 12px; border: 1.5px solid #e2e8f0; outline: none; }

.table-wrap { background: #fff; border-radius: 20px; overflow: hidden; }
table { width: 100%; border-collapse: collapse; }
th { text-align: left; padding: 16px 24px; background: #f8fafc; color: #64748b; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; border-bottom: 1px solid #f1f5f9; }
td { padding: 16px 24px; border-bottom: 1px solid #f8fafc; font-size: 0.9rem; }

.status-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
}
.status-badge.active { background: #f0fdf4; color: #166534; }
.status-badge.blocked { background: #fef2f2; color: #991b1b; }

.edit-btn { background: #f1f5f9; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 700; cursor: pointer; color: #475569; }

/* Modals */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.modal-card {
  background: #fff;
  width: 100%;
  max-width: 450px;
  padding: 32px;
  border-radius: 24px;
}
.form-group { margin-bottom: 20px; display: flex; flex-direction: column; gap: 8px; }
.form-group label { font-size: 0.85rem; font-weight: 700; color: #64748b; }
.form-group input, .form-group select { padding: 12px; border-radius: 10px; border: 1.5px solid #e2e8f0; font-size: 1rem; }

.modal-actions { display: flex; gap: 12px; margin-top: 32px; }
.cancel-btn { flex: 1; padding: 12px; background: #f1f5f9; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; }
.save-btn { flex: 2; padding: 12px; background: #0d9488; color: #fff; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; }

/* Utilities */
.shadow-premium { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05); }

@media (max-width: 1024px) {
  .sidebar { position: fixed; inset: 0 0 0 0; width: 100%; }
}
</style>
