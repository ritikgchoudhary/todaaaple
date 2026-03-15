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
          <router-link 
            v-for="tab in tabs" 
            :key="tab.id" 
            :to="{ name: tab.routeName }"
            :class="['nav-item', { active: activeTab === tab.id }]"
            @click="showSidebar = false"
          >
            <span v-html="tab.icon"></span>
            {{ tab.label }}
          </router-link>
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
          <router-view />
        </section>
      </main>
    </div>

    <!-- Edit User Modal -->
    <div v-if="editingUser" class="modal-overlay" @click.self="editingUser = null">
      <div class="modal-card animate-pop">
        <h3>Edit User: {{ editingUser.phone }}</h3>
        <p class="modal-hint">Updating UID: #{{ editingUser.id }}</p>
        <div class="modal-body scrollable">
          <div class="form-group">
            <label>Update User Balance (Current: ₹{{ editingUser.balance?.toFixed(2) }})</label>
            <input type="number" v-model="editForm.balance" placeholder="Enter new balance..." />
          </div>
          
          <div class="form-group">
            <label>Account Status</label>
            <select v-model="editForm.block">
              <option :value="false">Grant Full Access</option>
              <option :value="true">Block Login Access</option>
            </select>
          </div>

          <div class="user-details-grid">
            <div class="detail-item">
              <label>Bank Info</label>
              <div v-if="editingUser.bank?.length" class="detail-box">
                <p><strong>Name:</strong> {{ editingUser.bank[0].name }}</p>
                <p><strong>Bank:</strong> {{ editingUser.bank[0].bankName }}</p>
                <p><strong>Account:</strong> {{ editingUser.bank[0].bankAccount }}</p>
                <p><strong>IFSC:</strong> {{ editingUser.bank[0].ifsc }}</p>
              </div>
              <div v-else class="detail-box empty">No Bank Added</div>
            </div>

            <div class="detail-item">
              <label>KYC Address</label>
              <div v-if="editingUser.address?.length" class="detail-box">
                <p>{{ editingUser.address[0].address }}, {{ editingUser.address[0].city }}</p>
                <p>{{ editingUser.address[0].state }} - {{ editingUser.address[0].zip }}</p>
              </div>
              <div v-else class="detail-box empty">No Address Added</div>
            </div>

            <div class="detail-item">
              <label>Account Info</label>
              <div class="detail-box">
                <p><strong>UPI:</strong> {{ editingUser.upi || '-' }}</p>
                <p><strong>Agent:</strong> {{ editingUser.isAgent ? 'YES' : 'NO' }}</p>
                <p><strong>First Recharge:</strong> {{ editingUser.firstRecharge ? 'YES' : 'NO' }}</p>
              </div>
            </div>

            <div class="detail-item">
               <label>Lineage (Uplines)</label>
               <div class="upline-chips">
                 <span v-for="(up, i) in editingUser.upLine" :key="i" class="up-chip">L{{ i+1 }}: {{ up }}</span>
                 <span v-if="!editingUser.upLine?.length">No Uplines</span>
               </div>
            </div>
          </div>
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
import { useRoute, useRouter } from 'vue-router'
import * as adminApi from '../api/admin'
import AdminGamesView from './AdminGamesView.vue'

const route = useRoute()
const router = useRouter()

const isAuthenticated = ref(localStorage.getItem('admin_authenticated') === 'true')
const adminPassword = ref('')
const loading = ref(false)
const error = ref('')

const tabs = [
  { id: 'games', label: 'Manage Games', routeName: 'MasterAdminGames', icon: '<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M6 12h4m-2-2v4m5-2h.01M18 10h.01M15 19a3 3 0 0 1-3-3v-4a3 3 0 0 1 3-3h3a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3h-3z\"/></svg>' },
  { id: 'settings', label: 'System Preferences', routeName: 'MasterAdminSettings', icon: '<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z\"/></svg>' },
]
const activeTab = computed(() => route.meta.tab || 'games')
const activeTabLabel = computed(() => tabs.find(t => t.id === activeTab.value)?.label)

const stats = ref({
  today: { recharge: 0, withdrawal: 0, rechargeCount: 0, withdrawalCount: 0 },
  yesterday: { recharge: 0, withdrawal: 0, rechargeCount: 0, withdrawalCount: 0 },
  total: { recharge: 0, withdrawal: 0 },
  totalUsers: 0,
  activeUsers: 0,
  newUsersToday: 0,
  totalBalances: 0,
  pendingWithdrawals: 0
})

const snapshotItems = [
  { key: 'totalUsers', label: 'Total Users', color: '#3b82f6', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
  { key: 'activeUsers', label: 'Active Sessions', color: '#10b981', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/></svg>' },
  { key: 'newUsersToday', label: 'New Today', color: '#8b5cf6', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg>' },
  { key: 'totalBalances', label: 'User Balances', color: '#f59e0b', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' },
];

const users = ref([])
const withdrawals = ref([])
const transactions = ref([])
const siteSettings = ref({ siteLogoUrl: '', telegramLink: '', customerServiceLink: '', whatsappLink: '', usdtAddress: '' })
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
  if (adminPassword.value === 'Aman@123') {
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
      whatsappLink: siteSettings.value.whatsappLink,
      usdtAddress: siteSettings.value.usdtAddress
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

const formatStatKey = (key) => {
  const result = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
  if (result === 'Active Users') return 'Online/Active Users'
  if (result === 'Total Balances') return 'Total User Funds'
  return result
}
const formatStatVal = (val, key) => {
  if (typeof val !== 'number') return val
  if (key.toLowerCase().includes('recharge') || key.toLowerCase().includes('withdrawal') || key.toLowerCase().includes('balance')) {
    return `₹${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return val.toLocaleString()
}

const checkRes = () => isMobile.value = window.innerWidth < 1024

onMounted(() => {
  checkRes()
  window.addEventListener('resize', checkRes)
  if (isAuthenticated.value) refreshAll()
})

watch(activeTab, (newTab) => {
  if (newTab === 'games') { /* AdminGamesView handles its own fetching usually or on mount */ }
  if (newTab === 'settings') { fetchSiteSettings(); fetchCarousel(); }
})
</script>

<style scoped>
.master-admin-container {
  min-height: 100vh;
  background-color: #f0f4f8;
  color: #334155;
  font-family: var(--font-app);
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
.dashboard-wrapper { display: flex; flex-direction: column; gap: 40px; }
.stats-section-title { font-size: 1.1rem; font-weight: 800; color: #1e293b; margin-bottom: -10px; }
.dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }

/* Comparison Grid */
.comparison-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.comparison-card { background: #fff; border-radius: 28px; border: 1px solid #edf2f7; overflow: hidden; }
.comp-header { background: #f8fafc; padding: 15px 25px; font-size: 0.75rem; font-weight: 800; color: #94a3b8; border-bottom: 1px solid #f1f5f9; }
.comp-body { padding: 25px; }
.comp-item { display: flex; flex-direction: column; margin-bottom: 20px; }
.comp-item:last-child { margin-bottom: 0; }
.comp-label { font-size: 0.85rem; color: #64748b; font-weight: 600; margin-bottom: 5px; }
.comp-val { font-size: 1.4rem; font-weight: 800; color: #0f172a; }
.comp-val.success { color: #10b981; }
.comp-val.danger { color: #f43f5e; }
.comp-count { font-size: 0.75rem; color: #94a3b8; font-weight: 700; margin-top: 2px; }

/* User List Deep */
.user-cell { display: flex; flex-direction: column; gap: 4px; }
.uid { font-size: 0.75rem; color: #94a3b8; font-weight: 700; }
.phone { font-weight: 800; color: #0f172a; font-size: 1rem; }
.uname { font-size: 0.85rem; color: #64748b; font-weight: 500; }

.fin-cell { display: flex; flex-direction: column; gap: 6px; }
.kyc-cell { display: flex; flex-direction: column; gap: 4px; font-size: 0.85rem; }
.bank-name { font-weight: 700; color: #334155; }
.upi-id { color: #94a3b8; font-size: 0.8rem; }

.conn-cell { display: flex; flex-direction: column; gap: 6px; font-size: 0.85rem; }
.tag { width: fit-content; padding: 4px 8px; border-radius: 6px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
.f-recharge { background: #e0f2fe; color: #0369a1; }
.agent-tag { background: #fef3c7; color: #92400e; }

/* Modal Advance */
.modal-body.scrollable { max-height: 60vh; overflow-y: auto; padding-right: 15px; }
.user-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 30px; }
.detail-item label { font-size: 0.75rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 8px; display: block; }
.detail-box { background: #f8fafc; padding: 15px; border-radius: 14px; font-size: 0.9rem; line-height: 1.5; color: #1e293b; }
.detail-box.empty { font-style: italic; color: #cbd5e1; text-align: center; }
.upline-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.up-chip { background: #f1f5f9; padding: 5px 10px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; color: #475569; }

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
.mini-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.8rem;
}
.usdt-tag {
  background: #f59e0b;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: bold;
  width: fit-content;
}
.address-copy {
  background: #f1f5f9;
  padding: 4px;
  border-radius: 4px;
  word-break: break-all;
  font-family: monospace;
  max-width: 150px;
}
.acc-num {
  color: #64748b;
}
.hint {
  font-size: 0.7rem;
  opacity: 0.7;
  margin: 0;
}
</style>
