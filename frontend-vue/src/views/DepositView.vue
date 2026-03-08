<template>
  <div class="deposit-page">
    <div class="header">
      <div class="header-left" @click="router.back()">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </div>
      <h1 class="header-title">Deposit</h1>
      <div class="header-right" @click="scrollToHistory">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
      </div>
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
      <div class="section-title">Select Payment Method</div>
      <div class="methods-grid">
        <div 
          v-for="gateway in gatewayList" 
          :key="gateway" 
          class="method-item" 
          :class="{ 'active': selectedGateway === gateway }"
          @click="selectedGateway = gateway"
        >
          <div class="item-inner">
            <div class="icon-wrap">
              <img v-if="gateway === 'rupeerush' || gateway === 'watchpay' || gateway === 'lgpay' || gateway === 'auto' || gateway === 'manual'" src="https://img.bzvm68.com/site_common/payment/upi_qr.png" alt="UPI" :class="gateway"/>
              <div v-else class="fallback-icon">₹</div>
            </div>
            <span class="name">{{ GATEWAY_LABELS[gateway] || gateway }}</span>
            <div class="check-mark" v-if="selectedGateway === gateway">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          </div>
        </div>
        
        <!-- USDT Placeholder -->
        <div class="method-item disabled" @click="showToast('USDT coming soon!')">
          <div class="item-inner">
            <div class="icon-wrap usdt">₮</div>
            <span class="name">USDT</span>
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
            v-for="val in [200, 500, 1000, 2000, 5000, 10000, 20000, 50000]" 
            :key="val" 
            class="chip"
            :class="{ 'active': amount === val }"
            @click="amount = val"
          >
            ₹{{ val >= 1000 ? (val/1000) + 'K' : val }}
          </button>
        </div>
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
           <router-link to="/rechargeHistory" v-if="false" class="view-all">View All</router-link>
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

    <!-- Fixed Action Footer -->
    <div class="action-footer">
      <div class="footer-inner">
        <div class="selection-summary">
          <div class="summary-label">Selected</div>
          <div class="summary-value">{{ GATEWAY_LABELS[selectedGateway] || 'UPI' }}</div>
        </div>
        <button class="deposit-btn" :disabled="loading || !amount || amount < 200" @click="handleRecharge">
          <span v-if="loading" class="btn-spinner"></span>
          <span v-else>Deposit ₹{{ (amount || 0).toLocaleString() }}</span>
        </button>
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
  auto: "Phonepe QR",
  manual: "Paytm Direct",
  lgpay: "UPI Fast QR",
  watchpay: "WatchPay UPI",
  rupeerush: "Express UPI",
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
        showToast(err.response?.data?.error || err.message || "Failed to initiate. Check your connection.")
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchData()
    walletApi.getCurrentGateway().then(res => {
        if (res.data?.gateway) selectedGateway.value = res.data.gateway.toLowerCase()
        if (res.data?.gatewayList && Array.isArray(res.data.gatewayList)) {
            const preferred = ['watchpay', 'lgpay', 'rupeerush', 'auto', 'manual']
            gatewayList.value = res.data.gatewayList.sort((a, b) => preferred.indexOf(a) - preferred.indexOf(b))
        }
    }).catch(() => {})
})
</script>

<style scoped>
.deposit-page {
  min-height: 100vh;
  background-color: #0c0d10;
  color: #f1f5f9;
  font-family: 'Outfit', sans-serif;
  padding-bottom: 120px;
  overflow-x: hidden;
}

/* Header */
.header {
  position: sticky; top: 0; z-index: 1000;
  height: 64px; background: rgba(12, 13, 16, 0.9); backdrop-filter: blur(20px);
  display: flex; align-items: center; justify-content: space-between; padding: 0 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
.header-left { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; color: #94a3b8; cursor: pointer; }
.header-title { font-size: 1.1rem; font-weight: 800; color: #fff; margin: 0; text-transform: uppercase; letter-spacing: 0.1em; }
.header-right { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; color: #d9a05b; cursor: pointer; }

.mobile-container { max-width: 480px; margin: 0 auto; padding: 24px 16px; }

/* Glass Card */
.glass-card {
  background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px; position: relative; overflow: hidden;
}

/* Balance Card */
.balance-card {
  padding: 24px; margin-bottom: 32px;
  background: linear-gradient(135deg, rgba(217,160,91,0.15) 0%, rgba(12,13,16,0.1) 100%);
  border-color: rgba(217, 160, 91, 0.25);
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}
.card-glow {
  position: absolute; top: -30%; right: -20%; width: 140px; height: 140px;
  background: radial-gradient(circle, rgba(217, 160, 91, 0.2) 0%, transparent 70%); filter: blur(30px);
}
.label-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.label { font-size: 0.8rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; }
.refresh-btn { background: none; border: none; color: #d9a05b; padding: 6px; cursor: pointer; transition: 0.5s; }
.refresh-btn.spinning { transform: rotate(360deg); }
.amount-row { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }
.currency { font-size: 1.5rem; font-weight: 900; color: #d9a05b; }
.amount { font-size: 2.5rem; font-weight: 900; color: #fff; letter-spacing: -0.02em; }
.card-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.05); }
.user-id { font-size: 0.75rem; color: #64748b; font-weight: 700; opacity: 0.8; }
.secure-tag { display: flex; align-items: center; gap: 6px; font-size: 0.7rem; font-weight: 800; color: #10b981; background: rgba(16,185,129,0.1); padding: 5px 10px; border-radius: 30px; }

/* Section Title */
.section-title { font-size: 1rem; font-weight: 800; color: #fff; margin: 0 0 18px 4px; text-transform: uppercase; letter-spacing: 0.05em; }

/* Methods Grid */
.methods-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 32px; }
.method-item { cursor: pointer; }
.item-inner {
  position: relative; background: #15171c; border: 1px solid rgba(255,255,255,0.05);
  border-radius: 20px; padding: 20px 8px; display: flex; flex-direction: column; align-items: center; gap: 12px;
  transition: 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.method-item.active .item-inner { background: rgba(217,160,91,0.08); border-color: #d9a05b; transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
.icon-wrap { width: 52px; height: 52px; background: rgba(255,255,255,0.04); border-radius: 14px; display: flex; align-items: center; justify-content: center; }
.icon-wrap img { width: 34px; height: 34px; object-fit: contain; }
.icon-wrap img.auto { filter: hue-rotate(-60deg); }
.icon-wrap img.lgpay { filter: hue-rotate(60deg); }
.icon-wrap.usdt { font-size: 1.6rem; color: #26a17b; font-weight: 900; }
.item-inner .name { font-size: 0.75rem; font-weight: 700; color: #64748b; text-align: center; }
.method-item.active .name { color: #fff; }
.check-mark { position: absolute; top: -6px; right: -6px; width: 22px; height: 22px; background: #d9a05b; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; border: 2px solid #0c0d10; }
.method-item.disabled { opacity: 0.3; filter: grayscale(1); cursor: not-allowed; }

/* Amount Card */
.amount-card { padding: 24px; margin-bottom: 32px; background: rgba(255,255,255,0.02); }
.input-container { display: flex; align-items: center; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 0 20px; margin-bottom: 24px; transition: 0.2s; }
.input-container:focus-within { border-color: #d9a05b; background: rgba(0,0,0,0.5); }
.prefix { font-size: 1.6rem; font-weight: 900; color: #d9a05b; margin-right: 14px; }
.amount-input { flex: 1; background: none; border: none; outline: none; color: #fff; font-size: 1.5rem; font-weight: 900; padding: 18px 0; }
.clear-btn { background: rgba(255,255,255,0.1); border: none; color: #94a3b8; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 1.2rem; }
.chips-container { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.chip { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 12px 2px; color: #64748b; font-size: 0.85rem; font-weight: 800; cursor: pointer; transition: 0.2s; }
.chip.active { background: rgba(217,160,91,0.12); border-color: #d9a05b; color: #d9a05b; }

/* Instructions */
.details-card { background: rgba(217,160,91,0.02); border: 1px dashed rgba(217,160,91,0.2); border-radius: 20px; padding: 24px; margin-bottom: 32px; }
.details-card h3 { font-size: 0.9rem; font-weight: 900; color: #d9a05b; margin: 0 0 18px; text-transform: uppercase; letter-spacing: 0.1em; }
.instruction-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 16px; }
.instruction-list li { display: flex; gap: 14px; align-items: flex-start; }
.num { width: 22px; height: 22px; background: rgba(217,160,91,0.2); color: #d9a05b; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 900; flex-shrink: 0; }
.instruction-list p { margin: 0; font-size: 0.85rem; color: #94a3b8; line-height: 1.5; }
.instruction-list b { color: #fff; font-weight: 800; }

/* History Section */
.history-section { margin-top: 10px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
.view-all { font-size: 0.85rem; color: #d9a05b; font-weight: 700; text-decoration: none; }
.history-list { display: flex; flex-direction: column; gap: 12px; }
.history-item { padding: 16px 20px; display: flex; align-items: center; gap: 16px; background: rgba(255,255,255,0.02); border-color: rgba(255,255,255,0.05); }
.h-icon { width: 44px; height: 44px; border-radius: 50%; background: rgba(16,185,129,0.1); color: #10b981; display: flex; align-items: center; justify-content: center; }
.h-info { flex: 1; }
.h-type { font-weight: 800; font-size: 0.95rem; color: #fff; margin-bottom: 4px; }
.h-date { font-size: 0.75rem; color: #64748b; font-weight: 600; }
.h-amount { text-align: right; }
.amt-val { font-weight: 900; font-size: 1.1rem; color: #10b981; margin-bottom: 4px; }
.amt-status { font-size: 0.7rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; }
.empty-history { padding: 48px 24px; text-align: center; border-style: dashed; border-color: rgba(255,255,255,0.05); }
.empty-history p { margin-top: 16px; color: #64748b; font-size: 0.9rem; font-weight: 600; }

/* Footer */
.action-footer { position: fixed; bottom: 0; left: 0; right: 0; z-index: 1000; padding: 18px 20px calc(18px + env(safe-area-inset-bottom)); background: #0c0d10; border-top: 1px solid rgba(255, 255, 255, 0.08); }
.footer-inner { max-width: 480px; margin: 0 auto; display: flex; align-items: center; gap: 20px; }
.selection-summary { flex: 1; }
.summary-label { font-size: 0.7rem; color: #64748b; font-weight: 700; text-transform: uppercase; margin-bottom: 4px; }
.summary-value { font-size: 0.9rem; color: #fff; font-weight: 900; }
.deposit-btn { flex: 2; height: 56px; background: linear-gradient(135deg, #d9a05b 0%, #a67332 100%); border: none; border-radius: 16px; color: #fff; font-size: 1rem; font-weight: 900; cursor: pointer; box-shadow: 0 4px 20px rgba(217, 160, 91, 0.25); position: relative; overflow: hidden; }
.btn-spinner { width: 24px; height: 24px; border: 3px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; z-index: 5000; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; padding: 24px; }
.modal-content { background: #15171c; width: 100%; max-width: 340px; border-radius: 28px; padding: 36px 24px; text-align: center; border: 1px solid rgba(217,160,91,0.2); }
.modal-icon { width: 50px; height: 50px; background: rgba(217,160,91,0.1); color: #d9a05b; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-weight: 900; font-size: 1.8rem; }
.modal-title { font-size: 1.3rem; margin: 0 0 16px; color: #fff; font-weight: 900; }
.modal-body { font-size: 0.95rem; color: #94a3b8; line-height: 1.6; margin-bottom: 32px; }
.modal-btn { width: 100%; height: 52px; background: #d9a05b; color: #fff; border: none; border-radius: 14px; font-weight: 900; cursor: pointer; text-transform: uppercase; letter-spacing: 0.1em; }

/* Loader */
.global-loader { position: fixed; inset: 0; z-index: 9999; background: #0c0d10; display: flex; align-items: center; justify-content: center; }
.loader-content { text-align: center; }
.loader-circle { width: 56px; height: 56px; border: 4px solid rgba(255,255,255,0.05); border-top-color: #d9a05b; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }
.loader-text { font-size: 0.85rem; font-weight: 900; color: #d9a05b; letter-spacing: 0.2em; text-transform: uppercase; }

@keyframes spin { to { transform: rotate(360deg); } }
.pulse { animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

@media (max-width: 400px) {
  .amount { font-size: 2rem; }
  .grid-methods { grid-template-columns: repeat(2, 1fr); }
  .chips-container { grid-template-columns: repeat(2, 1fr); }
}
</style>
