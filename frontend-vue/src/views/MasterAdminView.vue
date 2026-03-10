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
            <span class="brand-brand">RUSH</span>
            <span class="brand-text">PAY ADMIN</span>
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
            
            <div class="full-card welcome-card shadow-premium">
              <div class="welcome-icon">⚡</div>
              <h3>System Overview Active</h3>
              <p>Welcome back, Master Admin. All systems are operational.</p>
            </div>
          </div>

          <!-- USER MANAGEMENT -->
          <div v-if="activeTab === 'users'" class="admin-view">
            <div class="action-bar">
              <div class="search-wrap">
                <input v-model="userSearch" placeholder="Search by phone or UID..." />
              </div>
              <button @click="fetchUsers" class="refresh-btn">Refresh Users</button>
            </div>
            
            <div class="table-container shadow-premium">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>UID</th>
                    <th>Phone</th>
                    <th>Name</th>
                    <th>Balance</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in filteredUsers" :key="user.id">
                    <td>#{{ user.id }}</td>
                    <td class="bold">{{ user.phone }}</td>
                    <td>{{ user.username || 'Member' }}</td>
                    <td class="amount">₹{{ user.balance?.toFixed(2) }}</td>
                    <td>
                      <span :class="['status-badge', user.block ? 'blocked' : 'active']">
                        {{ user.block ? 'Blocked' : 'Active' }}
                      </span>
                    </td>
                    <td>{{ new Date(user.date).toLocaleDateString() }}</td>
                    <td>
                      <button @click="openEditUser(user)" class="action-btn edit">Update</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- WITHDRAWALS -->
          <div v-if="activeTab === 'withdrawals'" class="admin-view">
            <div class="action-bar tabs-filter">
              <div class="filter-group">
                <button v-for="s in ['All', 'Placed', 'Success', 'Rejected']" :key="s" 
                  :class="['filter-btn', { active: withdrawalFilter === s }]"
                  @click="withdrawalFilter = s"
                >
                  {{ s }}
                </button>
              </div>
              <button @click="fetchWithdrawals" class="refresh-btn">Refresh</button>
            </div>
            
            <div class="table-container shadow-premium">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>UID</th>
                    <th>Amount</th>
                    <th>Fee</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="w in filteredWithdrawals" :key="w._id">
                    <td>{{ w.id }}</td>
                    <td>#{{ w.userId }}</td>
                    <td class="amount danger">₹{{ w.amount }}</td>
                    <td>₹{{ w.withdrawalFee || 0 }}</td>
                    <td>
                      <span :class="['status-badge', w.status?.toLowerCase()]">{{ w.status }}</span>
                    </td>
                    <td>{{ new Date(w.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) }}</td>
                    <td>
                      <div v-if="w.status === 'Placed'" class="action-set">
                        <button @click="updateWithdrawal(w, 'Success')" class="action-btn success">Approve</button>
                        <button @click="updateWithdrawal(w, 'Rejected')" class="action-btn reject">Reject</button>
                      </div>
                      <span v-else class="text-mute">-</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- TRANSACTIONS (Recharges) -->
          <div v-if="activeTab === 'transactions'" class="admin-view">
             <div class="action-bar">
               <h3>Cumulative Transaction Stream</h3>
               <button @click="fetchTransactions" class="refresh-btn">Fetch Recent</button>
             </div>
             
             <div class="table-container shadow-premium">
               <table class="admin-table">
                 <thead>
                   <tr>
                     <th>Order ID</th>
                     <th>UID</th>
                     <th>Amount</th>
                     <th>Gateway</th>
                     <th>Status</th>
                     <th>Time</th>
                   </tr>
                 </thead>
                 <tbody>
                   <tr v-for="t in transactions" :key="t._id">
                     <td>{{ t.id }}</td>
                     <td>#{{ t.userId }}</td>
                     <td class="amount success">₹{{ t.amount }}</td>
                     <td>{{ t.gateway }}</td>
                     <td>
                        <span :class="['status-badge', t.status?.toLowerCase()]">{{ t.status || 'Pending' }}</span>
                     </td>
                     <td>{{ new Date(t.date || t.createDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) }}</td>
                   </tr>
                 </tbody>
               </table>
             </div>
          </div>

          <!-- SITE SETTINGS -->
          <div v-if="activeTab === 'settings'" class="settings-view">
             <div class="settings-grid">
               <!-- Logo & Branding -->
               <div class="config-card shadow-premium">
                  <h3>Branding & Logo</h3>
                  <div class="logo-preview-box">
                    <img v-if="siteSettings.siteLogoUrl" :src="siteSettings.siteLogoUrl" alt="Site Logo" />
                    <div v-else class="no-logo">No Logo Uploaded</div>
                  </div>
                  <div class="upload-zone">
                    <input type="file" ref="logoInput" @change="handleLogoUpload" hidden />
                    <button @click="() => $refs.logoInput.click()" class="action-btn edit" :disabled="uploading">
                      {{ uploading ? 'Uploading...' : 'Change Logo' }}
                    </button>
                  </div>
               </div>

               <!-- Support Links -->
               <div class="config-card shadow-premium">
                  <h3>Support & Channels</h3>
                  <div class="form-group">
                    <label>Telegram Group/Channel</label>
                    <input v-model="siteSettings.telegramLink" placeholder="https://t.me/..." />
                  </div>
                  <div class="form-group">
                    <label>Live Customer Service Link</label>
                    <input v-model="siteSettings.customerServiceLink" placeholder="https://tawk.to/..." />
                  </div>
                   <div class="form-group">
                    <label>WhatsApp Link (Optional)</label>
                    <input v-model="siteSettings.whatsappLink" placeholder="https://wa.me/..." />
                  </div>
                  <button @click="saveSiteSettings" class="save-btn small" :disabled="saving">
                    {{ saving ? 'Saving...' : 'Update Links' }}
                  </button>
               </div>

               <!-- Carousel Manager -->
               <div class="config-card shadow-premium full-width">
                  <h3>Home Page Carousel</h3>
                  <div class="carousel-list">
                    <div v-for="(img, idx) in carouselImages" :key="idx" class="carousel-item-admin">
                      <img :src="img" />
                      <button @click="removeCarousel(img)" class="remove-c-btn">×</button>
                    </div>
                    <div class="carousel-uploader" @click="() => $refs.carouselInput.click()">
                      <input type="file" ref="carouselInput" @change="handleCarouselUpload" hidden />
                      <span v-if="!uploadingCarousel">+ Add Image</span>
                      <span v-else>...</span>
                    </div>
                  </div>
                  <p class="hint">Recommended size: 1200x400 (Aspect Ratio 3:1)</p>
               </div>
             </div>
          </div>
        </section>
      </main>
    </div>

    <!-- Edit User Modal -->
    <div v-if="editingUser" class="modal-overlay" @click.self="editingUser = null">
      <div class="modal-card animate-pop">
        <h3>Edit User: {{ editingUser.phone }}</h3>
        <p class="modal-hint">Updating UID: #{{ editingUser.id }}</p>
        <div class="form-group">
          <label>New Balance (₹)</label>
          <input v-model.number="editForm.balance" type="number" step="0.01" />
        </div>
        <div class="form-group">
          <label>Restrict Account Access</label>
          <select v-model="editForm.block">
            <option :value="false">Grant Full Access</option>
            <option :value="true">Block Login Access</option>
          </select>
        </div>
        <div class="modal-actions">
          <button @click="editingUser = null" class="cancel-btn">Discard</button>
          <button @click="saveUserEdit" class="save-btn" :disabled="saving">
            {{ saving ? 'Updating...' : 'Apply Changes' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import * as adminApi from '../api/admin'

const isAuthenticated = ref(localStorage.getItem('admin_authenticated') === 'true')
const adminPassword = ref('')
const loading = ref(false)
const error = ref('')

const tabs = [
  { id: 'dashboard', label: 'Summary', icon: '<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><rect x=\"3\" y=\"3\" width=\"7\" height=\"7\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\"/><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\"/><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\"/></svg>' },
  { id: 'users', label: 'Users', icon: '<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M17 21v-2a4 4 0 0 0-3-3.87\"/><path d=\"M9 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/><path d=\"M23 21v-2a4 4 0 0 0-3-3.87\"/><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"/></svg>' },
  { id: 'withdrawals', label: 'Withdraw Requests', icon: '<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2\"/><path d=\"M18 12h4\"/></svg>' },
  { id: 'transactions', label: 'Transaction Audit', icon: '<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"21 12 14 12 11 18 8 6 5 12 3 12\"/></svg>' },
  { id: 'settings', label: 'System Preferences', icon: '<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z\"/></svg>' },
]
const activeTab = ref('dashboard')
const activeTabLabel = computed(() => tabs.find(t => t.id === activeTab.value)?.label)

const stats = ref({})
const users = ref([])
const withdrawals = ref([])
const transactions = ref([])
const siteSettings = ref({ siteLogoUrl: '', telegramLink: '', customerServiceLink: '', whatsappLink: '' })
const carouselImages = ref([])

const userSearch = ref('')
const withdrawalFilter = ref('All')

const isMobile = ref(false)
const showSidebar = ref(false)
const ADMIN_API_KEY = '0f58faf1-20ea-489b-ad86-948cbdc9b7a3'

const editingUser = ref(null)
const editForm = ref({ balance: 0, block: false })
const saving = ref(false)
const uploading = ref(false)
const uploadingCarousel = ref(false)

const handleLogin = () => {
  if (adminPassword.value === 'Master@Rush2024') {
    isAuthenticated.value = true
    localStorage.setItem('admin_authenticated', 'true')
    error.value = ''
    refreshAll()
  } else {
    error.value = 'Administrative authentication failed.'
    adminPassword.value = ''
  }
}

const handleLogout = () => {
  isAuthenticated.value = false
  localStorage.removeItem('admin_authenticated')
}

const refreshAll = () => {
  fetchDashboard()
  fetchUsers()
  fetchWithdrawals()
  fetchTransactions()
  fetchSiteSettings()
  fetchCarousel()
}

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

const fetchWithdrawals = async () => {
  try {
    const res = await adminApi.getAllWithdrawals(ADMIN_API_KEY)
    if (res.data.success) withdrawals.value = res.data.data
  } catch (err) {}
}

const fetchTransactions = async () => {
  try {
    const res = await adminApi.getAdminTransactions(ADMIN_API_KEY)
    if (res.data.success) transactions.value = res.data.data
  } catch (err) {}
}

const fetchSiteSettings = async () => {
  try {
    const res = await adminApi.getSiteSettings(ADMIN_API_KEY)
    siteSettings.value = res.data
  } catch (err) {}
}

const fetchCarousel = async () => {
  try {
    const res = await adminApi.getCarousel(ADMIN_API_KEY)
    carouselImages.value = res.data.images
  } catch (err) {}
}

const filteredUsers = computed(() => {
  const q = userSearch.value.toLowerCase()
  return users.value.filter(u => 
    u.phone.toString().includes(q) || u.id.toString().includes(q)
  )
})

const filteredWithdrawals = computed(() => {
  if (withdrawalFilter.value === 'All') return withdrawals.value
  return withdrawals.value.filter(w => w.status === withdrawalFilter.value)
})

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
  } catch (err) {} finally { saving.value = false }
}

const updateWithdrawal = async (withdraw, status) => {
  if (!confirm(`Are you sure you want to mark this withdrawal as ${status}?`)) return
  try {
    const res = await adminApi.updateWithdrawal(ADMIN_API_KEY, {
        _id: withdraw._id,
        id: withdraw.id,
        userId: withdraw.userId,
        amount: withdraw.amount,
        status: status
    })
    
    if (res.data.success) {
      alert(res.data.message)
      fetchWithdrawals()
      fetchDashboard()
    }
  } catch (err) {
    alert('Operation failed')
  }
}

const handleLogoUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  uploading.value = true
  const fd = new FormData()
  fd.append('logo', file)
  try {
    const res = await adminApi.uploadLogo(ADMIN_API_KEY, fd)
    siteSettings.value.siteLogoUrl = res.data.siteLogoUrl
    alert('Logo updated successfully')
  } catch (err) {
    alert('Upload failed')
  } finally { uploading.value = false }
}

const saveSiteSettings = async () => {
  saving.value = true
  try {
    await adminApi.updateSiteSettings(ADMIN_API_KEY, {
      telegramLink: siteSettings.value.telegramLink,
      customerServiceLink: siteSettings.value.customerServiceLink,
      whatsappLink: siteSettings.value.whatsappLink
    })
    alert('Settings saved')
  } catch (err) {} finally { saving.value = false }
}

const handleCarouselUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  uploadingCarousel.value = true
  const fd = new FormData()
  fd.append('image', file)
  try {
    const res = await adminApi.uploadCarousel(ADMIN_API_KEY, fd)
    carouselImages.value = res.data.images
  } catch (err) {
    alert('Carousel upload failed')
  } finally { uploadingCarousel.value = false }
}

const removeCarousel = async (url) => {
  if (!confirm('Remove this carousel image?')) return
  try {
    const res = await adminApi.deleteCarousel(ADMIN_API_KEY, url)
    carouselImages.value = res.data.images
  } catch (err) {}
}

const formatStatKey = (key) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
const formatStatVal = (val, key) => (key.includes('Recharge') || key.includes('Withdrawal')) ? `₹${val.toLocaleString()}` : val

const checkRes = () => isMobile.value = window.innerWidth < 1024

onMounted(() => {
  checkRes()
  window.addEventListener('resize', checkRes)
  if (isAuthenticated.value) refreshAll()
})

watch(activeTab, (newTab) => {
  if (newTab === 'dashboard') fetchDashboard()
  if (newTab === 'users') fetchUsers()
  if (newTab === 'withdrawals') fetchWithdrawals()
  if (newTab === 'transactions') fetchTransactions()
  if (newTab === 'settings') { fetchSiteSettings(); fetchCarousel(); }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

.master-admin-container {
  min-height: 100vh;
  background-color: #f0f4f8;
  color: #334155;
  font-family: 'Outfit', sans-serif;
  letter-spacing: -0.01em;
}

/* Auth Flow */
.admin-login-overlay {
  position: fixed; inset: 0;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000; padding: 20px;
}
.login-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  width: 100%; max-width: 420px;
  padding: 50px; border-radius: 32px;
  text-align: center; border: 1px solid rgba(255, 255, 255, 0.1);
}
.login-card h2 { color: #fff; font-size: 1.75rem; font-weight: 800; margin-bottom: 12px; }
.login-card p { color: #94a3b8; margin-bottom: 35px; }

.input-group input {
  width: 100%; padding: 18px; border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff; font-size: 1.1rem; margin-bottom: 20px; outline: none;
}
.input-group button {
  width: 100%; padding: 18px; border-radius: 16px;
  background: #38bdf8; color: #0f172a; font-weight: 800; font-size: 1.1rem;
  border: none; cursor: pointer; transition: all 0.3s;
}
.input-group button:hover { background: #7dd3fc; transform: translateY(-2px); }

/* Layout */
.admin-layout { display: flex; height: 100vh; }

/* Sidebar Premium */
.sidebar {
  width: 280px; background: #0f172a;
  color: #fff; display: flex; flex-direction: column;
}
.sidebar-header { padding: 40px 30px; }
.brand-brand { color: #38bdf8; font-weight: 900; font-size: 1.5rem; letter-spacing: 0.1em; }
.brand-text { color: #fff; font-weight: 400; font-size: 0.9rem; margin-left: 5px; opacity: 0.6; }

.sidebar-nav { flex: 1; padding: 0 15px; display: flex; flex-direction: column; gap: 8px; }
.nav-item {
  display: flex; align-items: center; gap: 15px;
  padding: 16px 20px; border-radius: 16px; border: none;
  background: transparent; color: #64748b; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
}
.nav-item:hover { background: rgba(255,255,255,0.03); color: #fff; }
.nav-item.active { background: rgba(56, 189, 248, 0.1); color: #38bdf8; }

.sidebar-footer { padding: 30px; }
.logout-btn {
  width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
  padding: 14px; border-radius: 14px; background: rgba(239, 68, 68, 0.1);
  color: #f87171; border: none; font-weight: 700; cursor: pointer;
}

/* Content Area */
.main-content { flex: 1; overflow-y: auto; background: #f8fafc; }
.content-header {
  padding: 0 40px; height: 90px; background: #fff;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid #e2e8f0; sticky: top; z-index: 10;
}
.content-header h1 { font-size: 1.6rem; font-weight: 800; color: #1e293b; }

.tab-view { padding: 40px; max-width: 1400px; margin: 0 auto; width: 100%; }

/* Stats Widgets */
.dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; }
.stat-card {
  background: #fff; padding: 30px; border-radius: 28px;
  border: 1px solid #edf2f7; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
}
.stat-title { font-size: 0.9rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 15px; display: block; }
.stat-value { font-size: 2.2rem; font-weight: 800; color: #0f172a; }

.welcome-card { grid-column: 1/-1; background: #fff; padding: 60px; text-align: center; }
.welcome-icon { font-size: 4rem; margin-bottom: 20px; }

/* Table System */
.action-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 30px; gap: 20px; }
.search-wrap { flex: 1; position: relative; }
.search-wrap input { width: 100%; padding: 15px 25px; border-radius: 18px; border: 1px solid #e2e8f0; font-size: 1rem; outline: none; }
.refresh-btn { padding: 12px 24px; border-radius: 14px; background: #fff; border: 1px solid #e2e8f0; font-weight: 700; cursor: pointer; }

.filter-group { display: flex; background: #fff; padding: 6px; border-radius: 16px; border: 1px solid #e2e8f0; }
.filter-btn { padding: 8px 20px; border-radius: 12px; border: none; background: none; font-weight: 700; color: #64748b; cursor: pointer; }
.filter-btn.active { background: #334155; color: #fff; }

.table-container { background: #fff; border-radius: 30px; border: 1px solid #edf2f7; overflow: hidden; }
.admin-table { width: 100%; border-collapse: collapse; }
.admin-table th { background: #f8fafc; padding: 20px 25px; text-align: left; color: #94a3b8; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; }
.admin-table td { padding: 20px 25px; border-bottom: 1px solid #f8fafc; font-size: 0.95rem; }

.bold { font-weight: 700; color: #0f172a; }
.amount { font-weight: 800; font-family: monospace; font-size: 1.1rem; }
.amount.success { color: #10b981; }
.amount.danger { color: #f43f5e; }

.status-badge { padding: 6px 14px; border-radius: 10px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; }
.status-badge.active { background: #f0fdf4; color: #22c55e; }
.status-badge.blocked { background: #fff1f2; color: #f43f5e; }
.status-badge.placed { background: #eff6ff; color: #3b82f6; }
.status-badge.success { background: #f0fdf4; color: #22c55e; }
.status-badge.rejected { background: #fff1f2; color: #f43f5e; }

.action-btn { padding: 8px 16px; border-radius: 10px; border: none; font-weight: 700; cursor: pointer; transition: 0.2s; }
.action-btn.edit { background: #f1f5f9; color: #475569; }
.action-btn.success { background: #22c55e; color: #fff; }
.action-btn.reject { background: #f43f5e; color: #fff; margin-left: 8px; }

/* Settings System */
.settings-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; }
.config-card { background: #fff; padding: 40px; border-radius: 30px; border: 1px solid #edf2f7; }
.config-card h3 { margin-bottom: 25px; font-weight: 800; font-size: 1.3rem; }
.config-card.full-width { grid-column: 1/-1; }

.logo-preview-box {
  width: 100%; height: 160px; background: #f8fafc; border-radius: 20px;
  display: flex; align-items: center; justify-content: center; margin-bottom: 25px; border: 2px dashed #e2e8f0;
}
.logo-preview-box img { max-height: 80%; max-width: 80%; object-fit: contain; }
.upload-zone { text-align: center; }

.save-btn.small { width: auto; padding: 12px 30px; margin-top: 10px; }

.carousel-list { display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 20px; }
.carousel-item-admin { position: relative; width: 220px; height: 100px; border-radius: 15px; overflow: hidden; border: 1px solid #e2e8f0; }
.carousel-item-admin img { width: 100%; height: 100%; object-fit: cover; }
.remove-c-btn {
  position: absolute; top: 5px; right: 5px; width: 24px; height: 24px; border-radius: 50%;
  background: rgba(244, 63, 94, 0.9); color: #fff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px;
}
.carousel-uploader {
  width: 220px; height: 100px; border: 2px dashed #e2e8f0; border-radius: 15px;
  display: flex; align-items: center; justify-content: center; color: #94a3b8; font-weight: 700; cursor: pointer; transition: 0.2s;
}
.carousel-uploader:hover { background: #f8fafc; border-color: #38bdf8; color: #38bdf8; }

.hint { font-size: 0.85rem; color: #94a3b8; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
.modal-card { background: #fff; width: 100%; max-width: 480px; padding: 45px; border-radius: 35px; }
.modal-card h3 { font-size: 1.5rem; font-weight: 800; margin-bottom: 5px; }
.modal-hint { color: #94a3b8; font-size: 0.9rem; margin-bottom: 30px; }

.form-group { margin-bottom: 25px; }
.form-group label { display: block; font-size: 0.9rem; font-weight: 800; color: #64748b; margin-bottom: 10px; }
.form-group input, .form-group select { width: 100%; padding: 15px; border-radius: 15px; border: 1.5px solid #e2e8f0; font-size: 1.1rem; outline: none; }

.modal-actions { display: flex; gap: 15px; margin-top: 40px; }
.cancel-btn { flex: 1; padding: 16px; border-radius: 16px; border: none; background: #f1f5f9; font-weight: 700; cursor: pointer; }
.save-btn { flex: 2; padding: 16px; border-radius: 16px; border: none; background: #0f172a; color: #fff; font-weight: 700; cursor: pointer; }

.animate-pop { animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes pop { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }

.shadow-premium { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08); }

@media (max-width: 1024px) {
  .sidebar { position: fixed; left: 0; top: 0; bottom: 0; z-index: 1000; width: 100%; }
  .settings-grid { grid-template-columns: 1fr; }
}
</style>
