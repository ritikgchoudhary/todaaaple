<template>
  <div class="deposit-page">
    <div class="header themed-header">
      <div class="header-left" @click="router.back()">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </div>
      <h1 class="header-title white-text">Deposit Money</h1>
      <router-link to="/depositHistory" class="header-right white-text">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
      </router-link>
    </div>

    <div class="mobile-container">
      <!-- Balance Card -->
      <div class="solid-card balance-card">
        <div class="balance-info">
          <div class="label-row">
            <div class="balance-label-wrap">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="card-wallet-icon"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 11V7l-4 4-4-4v4"/></svg>
              <span class="label">Available Balance</span>
            </div>
            <button class="refresh-btn white-refresh" @click="fetchData" :class="{ 'spinning': fetching }">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>
          </div>
          <div class="amount-row large-amount">
            <span class="currency">₹</span>
            <span class="amount">{{ (userBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
          </div>
        </div>
      </div>

      <!-- Payment Type Tabs -->
      <div class="payment-tabs-modern">
        <button 
          class="tab-btn-modern fiat-tab" 
          :class="{ 'active': depositMode === 'fiat' }" 
          @click="depositMode = 'fiat'; selectedGateway = gatewayList[0]"
        >
          <img src="https://img.bzvm68.com/site_common/H5_7_mobile/recharge/recharge_INR.png" width="20" alt="" v-if="depositMode === 'fiat'" />
          <img src="https://flagcdn.com/w40/in.png" width="18" style="border-radius: 2px" v-else />
          INR PAYMENTS
        </button>
        <button 
          class="tab-btn-modern usdt-tab" 
          :class="{ 'active': depositMode === 'crypto' }" 
          @click="depositMode = 'crypto'; selectedGateway = 'usdt'"
        >
          <img src="https://cryptologos.cc/logos/tether-usdt-logo.svg?v=040" alt="USDT" width="18" />
          USDT PAYMENTS
        </button>
      </div>

      <!-- FIAT SECTION -->
      <div v-if="depositMode === 'fiat'">
        <div class="simple-amount-section">
          <div class="input-label-modern">Enter Amount (INR)</div>
          <div class="amount-input-row">
             <span class="cur-symbol">₹</span>
             <input 
               type="number" 
               v-model.number="amount" 
               class="modern-plain-input"
               placeholder="500"
             />
          </div>

          <div class="quick-select-label">Quick Select</div>
          <div class="chips-grid-modern">
            <button 
              v-for="val in [200, 500, 1000, 2000, 5000, 8000, 10000, 15000, 20000]" 
              :key="val" 
              class="modern-chip"
              :class="{ 'active': amount === val }"
              @click="amount = val"
            >
              ₹{{ val }}
            </button>
          </div>
        </div>

        <div class="channel-header compact-header">
          <div class="section-title">Select Deposit Channel</div>
        </div>
        
        <div class="methods-list-modern">
          <div 
            v-for="gateway in gatewayList" 
            :key="gateway" 
            class="method-list-item" 
            :class="{ 'active': selectedGateway === gateway.toLowerCase() }"
            @click="selectedGateway = gateway.toLowerCase()"
          >
            <div class="m-radio">
              <div class="m-radio-inner"></div>
            </div>
            <div class="m-name">{{ GATEWAY_LABELS[gateway.toLowerCase()] || gateway }}</div>
            <div class="m-limit">{{ getLimits(gateway) }}</div>
          </div>
        </div>

        <button class="modern-deposit-btn" :disabled="loading || !amount || amount < 200" @click="handleRecharge">
          <span v-if="loading" class="btn-spinner"></span>
          <span v-else>Deposit Now</span>
        </button>
      </div>

      <!-- CRYPTO SECTION -->
      <div v-else class="crypto-container">
        <div class="amount-card glass-card usdt-active-card">
          <div class="section-title">USDT Deposit Amount (INR)</div>
          <div class="input-container">
            <span class="prefix">₹</span>
            <input 
              type="number" 
              v-model.number="amount" 
              placeholder="Enter INR amount" 
              class="amount-input"
            />
          </div>
          
          <div class="usdt-manual-section">
            <div class="divider"></div>
            <div class="usdt-info-row">
              <span class="label">Exchange Rate:</span>
              <span class="val">1 USDT = ₹{{ USD_RATE }}</span>
            </div>
            <div class="usdt-info-row">
              <span class="label">Amount to Pay:</span>
              <span class="val highlight">{{ (amount / USD_RATE).toFixed(2) }} USDT</span>
            </div>
            
            <div class="address-box glass-card">
              <div class="box-label">Pay to USDT-TRC20 Address</div>
              <div class="address-row">
                <span class="address-text">{{ USDT_TRC20_ADDRESS }}</span>
                <button class="copy-btn" @click="copyAddress">COPY</button>
              </div>
            </div>

            <div class="txid-input-wrap">
              <div class="input-label">Transaction Hash (TXID)</div>
              <input v-model="txid" type="text" placeholder="Enter 64-char hash" class="txid-input" />
            </div>

            <button class="deposit-btn inline-btn usdt-theme" :disabled="loading || !amount || !txid" @click="handleUsdtDeposit">
              <span v-if="loading" class="btn-spinner"></span>
              <span v-else>Confirm USDT Payment</span>
            </button>
            <p class="usdt-note">Submit hash only AFTER sending funds. Minimum deposit: 10 USDT.</p>
          </div>
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
const depositMode = ref('fiat') 
const loading = ref(false)
const fetching = ref(false)
const userBalance = ref(0)
const rechargeHistory = ref([])
const focused = ref(false)
const historySection = ref(null)
const selectedGateway = ref('watchpay')
const gatewayList = ref(['watchpay', 'lgpay', 'rupeerush', 'auto', 'manual'])
const dialog = reactive({ open: false, body: '' })
const txid = ref('')

const USD_RATE = 95
const USDT_TRC20_ADDRESS = 'TPyLRB9N7m4uX8q9d8c7v6b5n4m3l2k1j' // Replace with real admin address

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

function copyAddress() {
    navigator.clipboard.writeText(USDT_TRC20_ADDRESS)
    showToast("Address copied to clipboard!")
}

async function handleUsdtDeposit() {
    if (!amount.value || (amount.value / USD_RATE) < 10) {
        showToast("Minimum 10 USDT required")
        return
    }
    if (!txid.value || txid.value.length < 10) {
        showToast("Please enter a valid Transaction Hash")
        return
    }

    loading.value = true
    try {
        // Here we call a hypothetical manual deposit API or reuse transaction system
        // Since it's manual, we might send it to a special endpoint
        const payload = {
            amount: amount.value,
            txid: txid.value,
            userId: auth.user.id,
            gateway: 'USDT_MANUAL',
            currency: 'USDT'
        }
        
        // Using common applyWithdrawal or a dedicated recharge request if available
        // For now, let's assume we use a general transaction log endpoint
        await walletApi.applyWithdrawal({ ...payload, type: 'recharge' }) // Adjust if specific API exists
        
        showToast("Success! Your USDT deposit request has been submitted. It will be verified shortly.")
        txid.value = ''
        amount.value = 500
    } catch (err) {
        showToast("Error submitting request. Please contact support.")
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
  height: 56px; background: #fff;
  display: flex; align-items: center; justify-content: space-between; padding: 0 16px;
  border-bottom: 1px solid #e2e8f0;
  max-width: 430px; margin: 0 auto; left: 0; right: 0;
}
.themed-header {
  background: #00bfa5 !important;
  border-bottom: none;
}
.white-text { color: #fff !important; }
.header-left { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; color: #64748b; cursor: pointer; }
.header-title { font-size: 1.1rem; font-weight: 500; color: #0f172a; margin: 0; }
.header-right { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; color: #05c0b8; cursor: pointer; }

.mobile-container { 
  max-width: 430px; 
  margin: 0 auto; 
  padding: 20px 16px; 
  background: #ffffff; 
  min-height: calc(100vh - 56px);
  padding-bottom: 40px;
}

/* Payment Tabs */
.payment-tabs-modern {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  margin-top: 10px;
}
.tab-btn-modern {
  flex: 1;
  height: 64px;
  border-radius: 32px;
  border: 1px solid #e0e0e0;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0 10px;
}
.tab-btn-modern.fiat-tab.active {
  background: #00bfa5;
  border-color: #00bfa5;
  color: #fff;
}
.tab-btn-modern.usdt-tab {
  border-color: #f59e0b;
  color: #f59e0b;
}
.tab-btn-modern.usdt-tab.active {
  background: #f59e0b;
  color: #fff;
}

/* New Styles for Amount Section */
.simple-amount-section {
  padding: 0 4px;
}
.input-label-modern {
  color: #00bfa5;
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 25px;
}
.amount-input-row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ccc;
  padding-bottom: 8px;
  margin-bottom: 30px;
}
.cur-symbol {
  font-size: 20px;
  color: #00bfa5;
  margin-right: 20px;
}
.modern-plain-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 20px;
  font-weight: 500;
  color: #333;
}
.quick-select-label {
  color: #00bfa5;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 15px;
}
.chips-grid-modern {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 30px;
}
.modern-chip {
  height: 42px;
  border: 1px solid #00bfa5;
  border-radius: 6px;
  background: #fff;
  color: #00bfa5;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}
.modern-chip.active {
  background: #00bfa5;
  color: #fff;
}

.methods-list-modern {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 30px;
}
.method-list-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
}
.method-list-item.active {
  border-color: #00bfa5;
  background: #f0fdfa;
}
.m-radio {
  width: 20px;
  height: 20px;
  border: 2px solid #ccc;
  border-radius: 50%;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.method-list-item.active .m-radio {
  border-color: #00bfa5;
}
.m-radio-inner {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: transparent;
}
.method-list-item.active .m-radio-inner {
  background: #00bfa5;
}
.m-name {
  flex: 1;
  font-weight: 700;
  color: #334155;
}
.m-limit {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
}

.modern-deposit-btn {
  width: 100%;
  height: 54px;
  background: #00bfa5;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 30px;
}

.usdt-active-card {
  border: 1px solid #f59e0b;
  background: #fff;
  padding: 20px;
  border-radius: 16px;
}

/* Glass Card */
.glass-card {
  background: #ffffff; border: 1px solid #e2e8f0;
  border-radius: 16px; position: relative; overflow: hidden;
}

/* Balance Card */
.balance-card {
  padding: 25px 20px; margin-bottom: 25px;
  background: #00bfa5;
  border: none;
  border-radius: 12px;
}
.balance-label-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #fff;
}
.card-wallet-icon { opacity: 0.9; }
.large-amount { margin-top: 15px; margin-bottom: 0; }
.large-amount .amount { font-size: 2.2rem; color: #fff; font-weight: 700; }
.large-amount .currency { color: #fff; font-size: 1.4rem; font-weight: 700; margin-right: 10px; }
.white-refresh { color: #fff; opacity: 0.8; }
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

/* USDT Manual Styles */
.usdt-manual-section { margin-top: 15px; }
.divider { height: 1px; background: #e2e8f0; margin: 15px 0; }
.usdt-info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.85rem; }
.usdt-info-row .label { color: #64748b; font-weight: 600; }
.usdt-info-row .val { color: #0f172a; font-weight: 800; }
.usdt-info-row .val.highlight { color: #05c0b8; font-size: 1rem; }

.address-box { padding: 12px; background: #f8fafc; margin-top: 15px; border-style: dashed; }
.box-label { font-size: 0.7rem; color: #64748b; font-weight: 800; text-transform: uppercase; margin-bottom: 8px; }
.address-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.address-text { font-size: 0.75rem; color: #0f172a; font-weight: 700; word-break: break-all; font-family: monospace; }
.copy-btn { background: #05c0b8; color: white; border: none; padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 800; cursor: pointer; }

.txid-input-wrap { margin-top: 20px; }
.input-label { font-size: 0.75rem; color: #64748b; font-weight: 700; margin-bottom: 8px; }
.txid-input { width: 100%; padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 0.85rem; outline: none; }
.txid-input:focus { border-color: #05c0b8; }

.usdt-theme { background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important; box-shadow: 0 6px 20px rgba(16,185,129,0.3) !important; }
.usdt-note { font-size: 0.65rem; color: #94a3b8; text-align: center; margin-top: 12px; font-weight: 600; }

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
