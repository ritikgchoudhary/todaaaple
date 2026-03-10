<template>
  <div class="deposit-page">
    <div class="header">
      <div class="header-left" @click="router.back()">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </div>
      <h1 class="header-title">Deposit</h1>
      <router-link to="/depositHistory" class="header-right">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
      </router-link>
    </div>

    <div class="mobile-container">
      <!-- Balance Card -->
      <div class="glass-card balance-card">
        <div class="card-glow"></div>
        <div class="balance-info">
          <div class="label-row">
            <span class="label">Available Balance</span>
            <button class="refresh-btn" @click="fetchData" :class="{ 'spinning': fetching }">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>
          </div>
          <div class="amount-row">
            <span class="currency">₹</span>
            <span class="amount">{{ (userBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
          </div>
        </div>
        <div class="card-footer">
          <div class="user-id">ID: {{ auth.user?.id || '----' }}</div>
          <div class="secure-tag">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>Verified Secure</span>
          </div>
        </div>
      </div>

      <!-- Payment Methods -->
      <div class="channel-header">
        <div class="channel-icon">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
        </div>
        <div class="section-title">Select channel</div>
      </div>
      
      <div class="methods-grid">
        <div 
          v-for="gateway in gatewayList" 
          :key="gateway" 
          class="method-item" 
          :class="{ 'active': selectedGateway === gateway.toLowerCase() }"
          @click="selectedGateway = gateway.toLowerCase()"
        >
          <div class="item-inner">
            <div class="name">{{ GATEWAY_LABELS[gateway.toLowerCase()] || gateway }}</div>
            <div class="limit">Balance:{{ getLimits(gateway) }}</div>
          </div>
        </div>
        
        <!-- USDT Placeholder -->
        <div class="method-item" @click="showToast('USDT coming soon!')">
          <div class="item-inner">
            <div class="name">USDT-TRC20</div>
            <div class="limit">Balance:500 - 1M</div>
          </div>
        </div>
      </div>

      <!-- Amount Section -->
      <div class="section-title">Deposit Amount</div>
      <div class="amount-card glass-card">
        <div class="input-container">
          <span class="prefix">₹</span>
          <input 
            type="number" 
            v-model.number="amount" 
            placeholder="Min. 200" 
            @focus="focused = true" 
            @blur="focused = false"
            class="amount-input"
          />
          <button v-if="amount" class="clear-btn" @click="amount = null">×</button>
        </div>

        <div class="chips-container">
          <button 
            v-for="val in [200, 500, 2000, 10000, 20000, 50000, 100000]" 
            :key="val" 
            class="chip"
            :class="{ 'active': amount === val }"
            @click="amount = val"
          >
            ₹{{ val >= 1000 ? (val/1000) + 'K' : val }}
          </button>
        </div>
        
        <button class="deposit-btn inline-btn" :disabled="loading || !amount || amount < 200" @click="handleRecharge">
          <span v-if="loading" class="btn-spinner"></span>
          <span v-else>Deposit ₹{{ (amount || 0).toLocaleString() }}</span>
        </button>
      </div>

      <!-- Instruction Details -->
      <div class="details-section">
        <div class="details-card">
          <h3>Payment Steps</h3>
          <ul class="instruction-list">
            <li>
              <span class="num">1</span>
              <p>Select your preferred UPI method and enter amount.</p>
            </li>
            <li>
              <span class="num">2</span>
              <p>Click <b>Deposit</b> to initiate secure payment request.</p>
            </li>
            <li>
              <span class="num">3</span>
              <p>Complete payment on the gateway page via any UPI App.</p>
            </li>
            <li>
              <span class="num">4</span>
              <p>Wealth reflects in your wallet within <b>1-5 minutes</b>.</p>
            </li>
          </ul>
        </div>
      </div>

      <!-- Recent History Section -->
      <div id="history-section" ref="historySection" class="history-section">
        <div class="section-header">
           <h2 class="section-title">Recent Deposits</h2>
           <router-link to="/depositHistory" class="view-all">View All</router-link>
        </div>
        
        <div v-if="rechargeHistory.length > 0" class="history-list">
          <div v-for="(item, idx) in rechargeHistory.slice(0, 10)" :key="idx" class="history-item glass-card">
            <div class="h-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </div>
            <div class="h-info">
              <div class="h-type">Recharge</div>
              <div class="h-date">{{ formatDate(item.date) }}</div>
            </div>
            <div class="h-amount">
              <div class="amt-val">+₹{{ item.amount }}</div>
              <div class="amt-status">Successful</div>
            </div>
          </div>
        </div>
        <div v-else class="empty-history glass-card">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <p>No deposit history available yet.</p>
        </div>
      </div>
    </div>

    <!-- Notification Dialog -->
    <div v-if="dialog.open" class="modal-overlay" @click="dialog.open = false">
      <div class="modal-content shadow-premium" @click.stop>
        <div class="modal-icon">!</div>
        <h3 class="modal-title">Important Notice</h3>
        <p class="modal-body">{{ dialog.body }}</p>
        <button class="modal-btn" @click="dialog.open = false">I Understand</button>
      </div>
    </div>

    <!-- Full Page Loader -->
    <div v-if="loading" class="global-loader">
      <div class="loader-content">
        <div class="loader-circle"></div>
        <div class="loader-text pulse">Processing...</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import * as walletApi from '../api/wallet'

const router = useRouter()
const auth = useAuthStore()

const amount = ref(500)
const loading = ref(false)
const fetching = ref(false)
const userBalance = ref(0)
const rechargeHistory = ref([])
const focused = ref(false)
const historySection = ref(null)
const selectedGateway = ref('watchpay')
const gatewayList = ref(['watchpay', 'lgpay', 'rupeerush', 'auto', 'manual'])
const dialog = reactive({ open: false, body: '' })

const GATEWAY_LABELS = {
  auto: "UPI Gateway",
  manual: "QR Pay",
  lgpay: "LG Pay",
  watchpay: "Watch Pay",
  rupeerush: "Rupee Rush",
}

function getLimits(gateway) {
    const g = gateway.toLowerCase()
    if (g === 'lgpay') return '100 - 100K'
    if (g === 'watchpay') return '100 - 100K'
    if (g === 'rupeerush') return '200 - 100K'
    return '100 - 10K'
}

async function fetchData() {
    if (!auth.user?.id) return
    fetching.value = true
    try {
        const res = await walletApi.getUserHome(auth.user.id)
        if (res.data && res.data.length > 0) {
            const userData = res.data[0]
            userBalance.value = userData.balance || 0
            rechargeHistory.value = Array.isArray(userData.rechargeHistory) ? [...userData.rechargeHistory].reverse() : []
        }
    } catch (err) {
        console.error('Data fetch failed')
    } finally {
        setTimeout(() => fetching.value = false, 800)
    }
}

function scrollToHistory() {
  if (historySection.value) {
    historySection.value.scrollIntoView({ behavior: 'smooth' })
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleString('en-IN', { 
    day: '2-digit', month: 'short', 
    hour: '2-digit', minute: '2-digit' 
  })
}

function showToast(msg) {
    dialog.body = msg
    dialog.open = true
}

async function handleRecharge() {
    if (!amount.value || amount.value < 200) {
        showToast("Minimum amount for deposit is ₹200")
        return
    }
    loading.value = true
    try {
        const payload = {
            amount: amount.value,
            customer_name: auth.user.username || 'User',
            customer_mobile: auth.user.phone || '',
            userId: auth.user.id
        }
        
        let res
        if (selectedGateway.value === 'watchpay') res = await walletApi.watchPayCreateOrder(auth.user.id, payload)
        else if (selectedGateway.value === 'lgpay') res = await walletApi.lgPayCreateOrder(auth.user.id, payload)
        else if (selectedGateway.value === 'rupeerush') res = await walletApi.rupeeRushCreateOrder(auth.user.id, payload)
        else {
            showToast(`${GATEWAY_LABELS[selectedGateway.value] || selectedGateway.value} gateway is unavailable. Try another method.`)
            loading.value = false
            return
        }

        if (res.data?.payment_url || res.data?.payUrl || res.data?.url) {
            window.location.href = res.data.payment_url || res.data.payUrl || res.data.url
        } else {
            throw new Error("Invalid response from payment server")
        }
    } catch (err) {
        const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to initiate. Check your connection."
        showToast(errorMsg)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchData()
    walletApi.getCurrentGateway().then(res => {
        if (res.data?.gateway) selectedGateway.value = res.data.gateway.toLowerCase()
        if (res.data?.gatewayList && Array.isArray(res.data.gatewayList)) {
            const working = ['watchpay', 'lgpay', 'rupeerush']
            const filtered = res.data.gatewayList
                .filter(g => working.includes(g.toLowerCase()))
                .sort((a, b) => working.indexOf(a.toLowerCase()) - working.indexOf(b.toLowerCase()))
            
            gatewayList.value = filtered
            
            // Ensure one is selected
            if (filtered.length > 0 && (!selectedGateway.value || !working.includes(selectedGateway.value))) {
                selectedGateway.value = filtered[0].toLowerCase()
            }
        }
    }).catch(() => {})
})
</script>

<style scoped>
.deposit-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  color: #0f172a;
  font-family: 'Outfit', sans-serif;
  overflow-x: hidden;
}

/* Header */
.header {
  position: sticky; top: 0; z-index: 1000;
  height: 56px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px);
  display: flex; align-items: center; justify-content: space-between; padding: 0 16px;
  border-bottom: 1px solid #e2e8f0;
  max-width: 430px; margin: 0 auto; left: 0; right: 0;
}
.header-left { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; color: #64748b; cursor: pointer; }
.header-title { font-size: 1rem; font-weight: 800; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: 0.1em; }
.header-right { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; color: #05c0b8; cursor: pointer; }

.mobile-container { 
  max-width: 430px; 
  margin: 0 auto; 
  padding: 12px 14px; 
  background: #ffffff; 
  min-height: calc(100vh - 56px);
  padding-bottom: 40px;
}

/* Glass Card */
.glass-card {
  background: #ffffff; border: 1px solid #e2e8f0;
  border-radius: 16px; position: relative; overflow: hidden;
}

/* Balance Card */
.balance-card {
  padding: 12px 16px; margin-bottom: 20px;
  background: linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%);
  border-color: #ccfbf1;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
}
.card-glow {
  position: absolute; top: -30%; right: -20%; width: 100px; height: 100px;
  background: radial-gradient(circle, rgba(5,192,184, 0.15) 0%, transparent 70%); filter: blur(20px);
}
.label-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.label { font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
.refresh-btn { background: none; border: none; color: #05c0b8; padding: 4px; cursor: pointer; transition: 0.5s; }
.refresh-btn.spinning { transform: rotate(360deg); }
.amount-row { display: flex; align-items: center; gap: 4px; margin-bottom: 12px; }
.currency { font-size: 1.1rem; font-weight: 900; color: #05c0b8; }
.amount { font-size: 1.6rem; font-weight: 900; color: #0f172a; letter-spacing: -0.02em; }
.card-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 12px; border-top: 1px solid #e2e8f0; }
.user-id { font-size: 0.7rem; color: #475569; font-weight: 700; opacity: 0.8; }
.secure-tag { display: flex; align-items: center; gap: 4px; font-size: 0.65rem; font-weight: 800; color: #10b981; background: rgba(16,185,129,0.1); padding: 4px 8px; border-radius: 30px; }

/* Section Title */
.channel-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; margin-left: 4px; }
.channel-icon { width: 22px; height: 22px; color: #05c0b8; border-bottom: 2px solid #05c0b8; display: flex; align-items: center; justify-content: center; padding-bottom: 2px; }
.section-title { font-size: 0.95rem; font-weight: 800; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: 0.05em; }

/* Methods Grid */
.methods-grid { 
  display: grid; 
  grid-template-columns: repeat(2, 1fr); 
  gap: 12px; 
  margin-bottom: 24px; 
}
.method-item { cursor: pointer; }
.item-inner {
  position: relative; 
  background: #f8fafc; 
  border: 1px solid #e2e8f0;
  border-radius: 14px; 
  padding: 14px 16px; 
  display: flex; 
  flex-direction: column; 
  align-items: flex-start; 
  justify-content: center;
  gap: 4px;
  min-height: 74px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.method-item.active .item-inner { 
  background: linear-gradient(135deg, #05c0b8 0%, #0d9488 100%); 
  border-color: #05c0b8;
  transform: translateY(-2px); 
  box-shadow: 0 8px 20px -6px rgba(5,192,184,0.3); 
}

.item-inner .name { font-size: 0.9rem; font-weight: 800; color: #475569; }
.method-item.active .name { color: #ffffff; }

.item-inner .limit { font-size: 0.75rem; font-weight: 700; color: #64748b; }
.method-item.active .limit { color: rgba(255,255,255,0.9); }

/* Amount Card */
.amount-card { padding: 16px 20px; margin-bottom: 24px; background: #ffffff; border-radius: 16px; }
.input-container { display: flex; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 0 16px; margin-bottom: 16px; transition: 0.2s; }
.input-container:focus-within { border-color: #05c0b8; background: #ffffff; box-shadow: 0 0 0 3px rgba(5,192,184,0.1); }
.prefix { font-size: 1.3rem; font-weight: 900; color: #05c0b8; margin-right: 10px; }
.amount-input { flex: 1; background: none; border: none; outline: none; color: #0f172a; font-size: 1.4rem; font-weight: 900; padding: 12px 0; }
.clear-btn { background: #e2e8f0; border: none; color: #64748b; width: 22px; height: 22px; border-radius: 50%; cursor: pointer; font-size: 0.95rem; display: flex; align-items: center; justify-content: center; }
.chips-container { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.chip { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px 4px; color: #475569; font-size: 0.8rem; font-weight: 800; cursor: pointer; transition: 0.2s; }
.chip.active { background: #f0fdfa; border-color: #05c0b8; color: #05c0b8; border-width: 2px; }

/* Instructions */
.details-card { background: #f0fdfa; border: 1px dashed rgba(5,192,184,0.3); border-radius: 16px; padding: 16px 20px; margin-bottom: 24px; }
.details-card h3 { font-size: 0.8rem; font-weight: 900; color: #05c0b8; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.05em; }
.instruction-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.instruction-list li { display: flex; gap: 10px; align-items: flex-start; }
.num { width: 18px; height: 18px; background: rgba(5,192,184,0.15); color: #05c0b8; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 900; flex-shrink: 0; }
.instruction-list p { margin: 0; font-size: 0.75rem; color: #475569; line-height: 1.5; }
.instruction-list b { color: #0f172a; font-weight: 800; }

/* History Section */
.history-section { border-top: 1px solid #f1f5f9; padding-top: 20px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.view-all { font-size: 0.8rem; color: #05c0b8; font-weight: 700; text-decoration: none; }
.history-list { display: flex; flex-direction: column; gap: 10px; }
.history-item { padding: 14px 16px; display: flex; align-items: center; gap: 14px; background: #ffffff; border: 1px solid #f1f5f9; border-radius: 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.02); }
.h-icon { width: 40px; height: 40px; border-radius: 50%; background: rgba(16,185,129,0.1); color: #10b981; display: flex; align-items: center; justify-content: center; }
.h-icon svg { width: 18px; height: 18px; }
.h-info { flex: 1; }
.h-type { font-weight: 800; font-size: 0.9rem; color: #0f172a; margin-bottom: 2px; }
.h-date { font-size: 0.7rem; color: #64748b; font-weight: 600; }
.h-amount { text-align: right; }
.amt-val { font-weight: 900; font-size: 1rem; color: #10b981; margin-bottom: 2px; }
.amt-status { font-size: 0.7rem; font-weight: 800; color: #64748b; text-transform: uppercase; }
.empty-history { padding: 40px 20px; text-align: center; border: 1px dashed #e2e8f0; border-radius: 16px; background: #fafafa; }
.empty-history p { margin-top: 12px; color: #94a3b8; font-size: 0.85rem; font-weight: 600; }

.deposit-btn.inline-btn { width: 100%; margin-top: 20px; height: 52px; background: linear-gradient(135deg, #05c0b8 0%, #0d9488 100%); border: none; border-radius: 14px; color: #fff; font-size: 1rem; font-weight: 900; cursor: pointer; box-shadow: 0 6px 20px rgba(5,192,184,0.3); position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; transition: 0.2s; }
.deposit-btn.inline-btn:active { transform: scale(0.98); box-shadow: 0 2px 10px rgba(5,192,184,0.2); }
.btn-spinner { width: 22px; height: 22px; border: 3px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; z-index: 5000; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 24px; }
.modal-content { background: #ffffff; width: 100%; max-width: 320px; border-radius: 24px; padding: 32px 24px; text-align: center; border: none; box-shadow: 0 20px 50px rgba(0,0,0,0.15); }
.modal-icon { width: 48px; height: 48px; background: rgba(5,192,184,0.1); color: #05c0b8; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-weight: 900; font-size: 1.6rem; }
.modal-title { font-size: 1.2rem; margin: 0 0 12px; color: #0f172a; font-weight: 900; }
.modal-body { font-size: 0.9rem; color: #475569; line-height: 1.6; margin-bottom: 28px; }
.modal-btn { width: 100%; height: 48px; background: #05c0b8; color: #fff; border: none; border-radius: 12px; font-weight: 900; cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em; font-size: 1rem; box-shadow: 0 4px 12px rgba(5,192,184,0.2); }

/* Loader */
.global-loader { position: fixed; inset: 0; z-index: 9999; background: #ffffff; display: flex; align-items: center; justify-content: center; }
.loader-content { text-align: center; }
.loader-circle { width: 48px; height: 48px; border: 4px solid rgba(5,192,184,0.1); border-top-color: #05c0b8; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }
.loader-text { font-size: 0.8rem; font-weight: 900; color: #05c0b8; letter-spacing: 0.2em; text-transform: uppercase; }

@keyframes spin { to { transform: rotate(360deg); } }
.pulse { animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

@media (max-width: 400px) {
  .amount { font-size: 1.8rem; }
  .prefix { font-size: 1.4rem; }
  .main-input { font-size: 1.5rem; }
}
</style>
