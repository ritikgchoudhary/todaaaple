<template>
  <div class="withdrawal-page">
    <div class="header">
      <div class="header-left" @click="router.back()">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </div>
      <h1 class="header-title">Withdrawal</h1>
      <router-link to="/withdrawalHistory" class="header-right">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
      </router-link>
    </div>

    <div class="mobile-container">
      <!-- Balance Card -->
      <div class="glass-card balance-card">
        <div class="card-glow"></div>
        <div class="balance-info">
          <div class="label-row">
            <span class="label">Withdrawable Balance</span>
            <button class="refresh-btn" @click="fetchData" :class="{ 'spinning': fetching }">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>
          </div>
          <div class="amount-row">
            <span class="currency">₹</span>
            <span class="amount">{{ (userBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }) }}</span>
          </div>
        </div>
        <div class="card-footer">
          <div class="wallet-tag">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2"/><path d="M18 12h4"/></svg>
            <span>Primary Wallet</span>
          </div>
        </div>
      </div>

      <!-- Tab Switcher -->
      <div class="tab-switcher">
        <button :class="['tab-btn', { active: activeTab === 'inr' }]" @click="activeTab = 'inr'">
          <span class="dot"></span> INR Bank
        </button>
        <button :class="['tab-btn', { active: activeTab === 'usdt' }]" @click="activeTab = 'usdt'">
          <span class="dot"></span> USDT Crypto
        </button>
      </div>

      <!-- INR Channel -->
      <div v-if="activeTab === 'inr'" class="channel-content">
        <div v-if="bankInfo" class="premium-bank-card">
          <div class="card-type">PRIMARY BANK</div>
          <div class="bank-main">
            <div class="bank-icon-wrap">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            </div>
            <div class="bank-details">
              <div class="bank-name">{{ bankInfo.name }}</div>
              <div class="bank-acc">**** **** {{ bankInfo.account?.slice(-4) }}</div>
            </div>
          </div>
          <div class="bank-footer">
            <span>IFSC: {{ bankInfo.ifsc || '-------' }}</span>
            <router-link to="/bank" class="change-tag">Change</router-link>
          </div>
        </div>
        <div v-else class="empty-state glass-card">
          <p>No valid bank account found.</p>
          <router-link to="/bank" class="add-bank-link">Add Bank Account</router-link>
        </div>

        <!-- Input Section -->
        <div class="section-title">Enter Amount</div>
        <div class="input-card glass-card">
          <div class="input-wrap">
            <span class="prefix">₹</span>
            <input type="number" v-model.number="amount" placeholder="Min. 230" class="main-input" />
            <span class="all-btn" @click="amount = Math.floor(userBalance)">MAX</span>
          </div>
          
          <div class="fee-details" v-if="amount > 0">
             <div class="fee-row">
               <span>Handling Fee:</span>
               <span class="fee-val">₹{{ calculateInrFee() }}</span>
             </div>
             <div class="fee-row total">
               <span>Settlement Amount:</span>
               <span class="settle-val">₹{{ (amount - calculateInrFee()).toLocaleString() }}</span>
             </div>
          </div>
        </div>

        <div class="rules-card">
          <h3>Withdrawal Rules</h3>
          <ul class="rules-list">
             <li><span class="dot"></span> Min Withdrawal: <b>₹230</b> | Max: <b>₹50,000</b></li>
             <li><span class="dot"></span> Fee: ₹30 for &lt; ₹1000, <b>3%</b> for &ge; ₹1000</li>
             <li><span class="dot"></span> Frequency: Up to <b>3 times</b> per day.</li>
             <li><span class="dot"></span> Time: Mon-Fri | <b>11:30 - 17:30</b></li>
          </ul>
        </div>
        
        <div class="play-requirement" :class="{ 'met': (withdrawalLimits.bid >= withdrawalLimits.recharge) }">
           <div class="req-header">
             <span>Wagering Requirement</span>
             <span class="badge">{{ (withdrawalLimits.bid >= withdrawalLimits.recharge) ? 'Met' : 'Pending' }}</span>
           </div>
           <div class="progress-bar">
             <div class="progress" :style="{ width: Math.min(100, (withdrawalLimits.bid / (withdrawalLimits.recharge || 1)) * 100) + '%' }"></div>
           </div>
           <div class="req-footer">
              <span>Played: ₹{{ withdrawalLimits.bid }}</span>
              <span>Req: ₹{{ withdrawalLimits.recharge }}</span>
           </div>
           <p class="req-hint" v-if="withdrawalLimits.bid < withdrawalLimits.recharge">
             You need to play <b>₹{{ withdrawalLimits.recharge - withdrawalLimits.bid }}</b> more to unlock withdrawal.
           </p>
        </div>
      </div>

      <!-- USDT Channel -->
      <div v-if="activeTab === 'usdt'" class="channel-content">
        <div class="premium-bank-card usdt-card">
          <div class="card-type">CRYPTO NETWORK</div>
          <div class="bank-main">
            <div class="bank-icon-wrap usdt">₮</div>
            <div class="bank-details">
              <div class="bank-name">USDT - TRC20</div>
              <div class="bank-acc">Global Stablecoin Channel</div>
            </div>
          </div>
          <div class="bank-footer">
            <span>Rate: 1 USDT = ₹95.00</span>
          </div>
        </div>

        <div class="section-title">Amount (USDT)</div>
        <div class="input-card glass-card">
          <div class="input-wrap">
            <span class="prefix usdt">₮</span>
            <input type="number" v-model.number="usdtAmount" placeholder="Min. 10" class="main-input" />
            <span class="all-btn" @click="usdtAmount = Math.floor(userBalance / 95)">MAX</span>
          </div>
          
          <div class="fee-details" v-if="usdtAmount > 0">
             <div class="fee-row">
               <span>Handling Fee:</span>
               <span class="fee-val">{{ calculateUsdtFee().toFixed(2) }} USDT</span>
             </div>
             <div class="fee-row total">
               <span>Settlement:</span>
               <span class="settle-val">{{ (usdtAmount - calculateUsdtFee()).toFixed(2) }} USDT</span>
             </div>
             <div class="fee-row total inr-equiv">
               <span>Deducted from Wallet:</span>
               <span class="val">₹{{ (usdtAmount * 95).toLocaleString() }}</span>
             </div>
          </div>
        </div>

        <div class="rules-card usdt-rules">
          <h3>Crypto Guidelines</h3>
          <ul class="rules-list">
             <li><span class="dot"></span> Minimum Withdrawal: <b>10 USDT</b></li>
             <li><span class="dot"></span> Network Fee: <b>3% (Min. 3 USDT)</b></li>
             <li><span class="dot"></span> Payout Speed: <b>24-48 Business Hours</b></li>
             <li><span class="dot"></span> Use TRC20 (Tron) network addresses only.</li>
          </ul>
        </div>
      </div>

      <!-- Recent History Section -->
      <div id="history-section" ref="historySection" class="history-section">
        <div class="section-header">
           <h2 class="section-title">Recent Withdrawals</h2>
        </div>
        
        <div v-if="withdrawalHistory.length > 0" class="history-list">
          <div v-for="(item, idx) in withdrawalHistory.slice(0, 5)" :key="idx" class="history-item glass-card">
            <div class="h-icon" :style="{ color: getStatusColor(item.status), background: getStatusColor(item.status) + '15' }">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </div>
            <div class="h-info">
              <div class="h-type">Withdrawal</div>
              <div class="h-date">{{ formatDate(item.date) }}</div>
            </div>
            <div class="h-amount">
              <div class="amt-val">-₹{{ item.amount }}</div>
              <div class="amt-status" :style="{ color: getStatusColor(item.status) }">{{ getStatusLabel(item.status) }}</div>
            </div>
          </div>
        </div>
        <div v-else class="empty-history glass-card">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <p>No withdrawal history recorded yet.</p>
        </div>
      </div>
    </div>

    <!-- Action Bar -->
    <div class="action-footer">
      <div class="footer-inner">
        <button class="withdraw-btn" :disabled="loading || isSubmitDisabled()" @click="processWithdraw">
          <span v-if="loading" class="btn-spinner"></span>
          <span v-else>Initiate Withdrawal</span>
        </button>
      </div>
    </div>

    <!-- TRC Dialog -->
    <div v-if="showTrcDialog" class="modal-overlay" @click="showTrcDialog = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
           <div class="modal-icon usdt-icon">₮</div>
           <h3>TRC20 Address</h3>
        </div>
        <div class="modal-summary">
           <div class="sum-row">Withdraw: <span>{{ usdtAmount }} USDT</span></div>
           <div class="sum-row net">Receive: <span>{{ (usdtAmount - calculateUsdtFee()).toFixed(2) }} USDT</span></div>
        </div>
        <div class="modal-input-wrap">
           <input v-model="trcAddress" type="text" placeholder="Paste TRC20 Wallet Address" />
        </div>
        <p class="modal-warning">Double check the address. Wrong address results in permanent loss of funds.</p>
        <div class="modal-actions">
           <button @click="showTrcDialog = false" class="btn-cancel">Cancel</button>
           <button @click="handleUsdtWithdrawal" class="btn-confirm">Submit</button>
        </div>
      </div>
    </div>

    <!-- Toast Modal -->
    <div v-if="dialog.open" class="modal-overlay" @click="dialog.open = false">
      <div class="modal-content toast-card" @click.stop>
        <div class="modal-icon">!</div>
        <p class="toast-body">{{ dialog.body }}</p>
        <button @click="dialog.open = false" class="btn-confirm">Okay</button>
      </div>
    </div>

    <!-- Page Loader -->
    <div v-if="loading && !showTrcDialog" class="global-loader">
       <div class="loader-content">
         <div class="loader-circle"></div>
         <div class="loader-text pulse">Transacting...</div>
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

const activeTab = ref('inr')
const amount = ref(null)
const usdtAmount = ref(null)
const trcAddress = ref('')
const loading = ref(false)
const fetching = ref(false)
const userBalance = ref(0)
const bankInfo = ref(null)
const withdrawalLimits = reactive({ recharge: 0, bid: 0 })
const dialog = reactive({ open: false, body: '' })
const showTrcDialog = ref(false)
const historySection = ref(null)

const calculateInrFee = () => {
    if (!amount.value) return 0
    if (amount.value < 1000) return 30
    return Math.floor(amount.value * 0.03)
}

const calculateUsdtFee = () => {
    if (!usdtAmount.value) return 0
    return Math.max(usdtAmount.value * 0.03, 3)
}

const isSubmitDisabled = () => {
    if (activeTab.value === 'inr') {
        return !amount.value || amount.value < 230 || withdrawalLimits.bid < withdrawalLimits.recharge
    } else {
        return !usdtAmount.value || usdtAmount.value < 10
    }
}

async function fetchData() {
    if (!auth.user?.id) return
    fetching.value = true
    try {
        const res = await walletApi.getUserWithdrawal(auth.user.id)
        if (res.data) {
            const userData = res.data.user?.[0] || {}
            userBalance.value = userData.balance || 0
            bankInfo.value = userData.bank?.[0] || null
            withdrawalLimits.recharge = res.data.latestRecharge || 0
            withdrawalLimits.bid = res.data.bidsAfterRecharge || 0
            
            // Map withdrawal history
            if (Array.isArray(userData.withdrawal)) {
                withdrawalHistory.value = [...userData.withdrawal].reverse()
            }
        }
    } catch (err) {}
    setTimeout(() => fetching.value = false, 800)
}

const withdrawalHistory = ref([])

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleString('en-IN', { 
    day: '2-digit', month: 'short', 
    hour: '2-digit', minute: '2-digit' 
  })
}

function getStatusColor(status) {
    if (status === 1 || status === 'Success' || status === '1') return '#10b981'
    if (status === 2 || status === 'Reviewing' || status === '0') return '#d9a05b'
    return '#ef4444'
}

function getStatusLabel(status) {
    if (status === 1 || status === 'Success' || status === '1') return 'Successful'
    if (status === 2 || status === 'Reviewing' || status === '0') return 'Processing'
    if (status === 3 || status === 'Reject' || status === '2') return 'Rejected'
    return 'Pending'
}

function processWithdraw() {
    if (activeTab.value === 'usdt') {
        showTrcDialog.value = true
    } else {
        handleWithdrawal()
    }
}

async function handleWithdrawal() {
    loading.value = true
    try {
        await walletApi.applyWithdrawal({ amount: amount.value, userId: auth.user.id })
        dialog.body = "Withdrawal request submitted for review!"
        dialog.open = true
        fetchData()
    } catch (err) {
        dialog.body = err.response?.data?.error || "Transaction could not be initiated."
        dialog.open = true
    } finally {
        loading.value = false
    }
}

async function handleUsdtWithdrawal() {
    if (!trcAddress.value) return
    showTrcDialog.value = false
    loading.value = true
    try {
        const fee = calculateUsdtFee()
        await walletApi.applyWithdrawalUSDT({ 
            amount: usdtAmount.value, 
            walletAddress: trcAddress.value,
            fee,
            netAmount: usdtAmount.value - fee,
            userId: auth.user.id 
        })
        dialog.body = "USDT request submitted successfully!"
        dialog.open = true
        fetchData()
    } catch (err) {
        dialog.body = err.response?.data?.error || "USDT processing error."
        dialog.open = true
    } finally {
        loading.value = false
    }
}

onMounted(fetchData)
</script>

<style scoped>
.withdrawal-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  color: #0f172a;
  font-family: 'Outfit', sans-serif;
}

/* Header */
.header {
  height: 56px; position: sticky; top: 0; z-index: 1000;
  background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px);
  display: flex; align-items: center; justify-content: space-between; padding: 0 16px;
  border-bottom: 1px solid #e2e8f0;
  max-width: 430px; margin: 0 auto; left: 0; right: 0;
}
.header-left { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; color: #64748b; cursor: pointer; }
.header-title { font-size: 1rem; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.1em; margin: 0; }
.header-right { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; color: #05c0b8; text-decoration: none; }

.mobile-container { 
  max-width: 430px; 
  margin: 0 auto; 
  padding: 16px 12px; 
  background: #ffffff; 
  min-height: calc(100vh - 56px);
  padding-bottom: 100px;
}

/* Glass Card */
.glass-card {
  background: #ffffff; border: 1px solid #e2e8f0;
  border-radius: 16px; position: relative; overflow: hidden;
}

/* Balance Card */
.balance-card {
  padding: 16px 20px; margin-bottom: 24px;
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
.refresh-btn { background: none; border: none; color: #05c0b8; cursor: pointer; transition: 0.5s; padding: 4px; }
.refresh-btn.spinning { transform: rotate(360deg); }
.amount-row { display: flex; align-items: center; gap: 4px; margin-bottom: 12px; }
.currency { font-size: 1.2rem; font-weight: 900; color: #05c0b8; }
.amount { font-size: 2rem; font-weight: 900; color: #0f172a; letter-spacing: -0.02em; }
.card-footer { display: flex; align-items: center; padding-top: 12px; border-top: 1px solid #e2e8f0; }
.wallet-tag { display: flex; align-items: center; gap: 4px; font-size: 0.7rem; font-weight: 700; color: #475569; }

/* Switcher */
.tab-switcher {
  display: flex; background: #f8fafc; padding: 4px; border-radius: 12px; margin-bottom: 24px;
  border: 1px solid #e2e8f0;
}
.tab-btn {
  flex: 1; height: 40px; border: none; background: none; color: #64748b; font-weight: 800;
  font-size: 0.8rem; border-radius: 10px; cursor: pointer; transition: 0.2s;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.tab-btn.active { background: #05c0b8; color: #fff; box-shadow: 0 4px 12px rgba(5,192,184,0.25); }
.dot { width: 6px; height: 6px; border-radius: 50%; border: 1.5px solid currentColor; }

/* Bank Card */
.premium-bank-card {
  background: #f8fafc;
  border-radius: 16px; padding: 16px; position: relative; overflow: hidden;
  border: 1px solid #e2e8f0; margin-bottom: 24px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
}
.card-type { font-size: 0.65rem; color: #05c0b8; font-weight: 900; letter-spacing: 0.2em; margin-bottom: 12px; }
.bank-main { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.bank-icon-wrap { width: 40px; height: 40px; border-radius: 12px; background: #f0fdfa; display: flex; align-items: center; justify-content: center; color: #05c0b8; font-size: 1.2rem; font-weight: 900; }
.bank-details .bank-name { font-size: 0.95rem; font-weight: 800; color: #0f172a; margin-bottom: 2px; }
.bank-details .bank-acc { font-family: monospace; font-size: 0.9rem; color: #64748b; letter-spacing: 1px; }
.bank-footer { display: flex; align-items: center; justify-content: space-between; font-size: 0.75rem; color: #64748b; font-weight: 700; }
.change-tag { color: #05c0b8; text-decoration: none; border-bottom: 1.5px solid transparent; transition: 0.2s; }
.change-tag:hover { border-color: #05c0b8; }

.empty-state {
  padding: 16px 20px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-radius: 12px;
  background-color: #fff;
}
.empty-state p {
  margin: 0;
  font-size: 0.95rem;
  color: #0f172a;
}
.add-bank-link {
  color: #6366f1;
  font-size: 0.95rem;
  font-weight: 500;
  text-decoration: underline;
  text-underline-offset: 4px;
}
.add-bank-link:hover {
  color: #4f46e5;
}

.usdt-card { background: #f0fdfa; border-color: #ccfbf1; }
.usdt-card .card-type { color: #10b981; }
.usdt-card .bank-icon-wrap { color: #10b981; background: rgba(16,185,129,0.1); }

/* Input Card */
.section-title { font-size: 0.85rem; font-weight: 800; margin: 0 0 12px 4px; color: #0f172a; text-transform: uppercase; }
.input-card { padding: 16px; margin-bottom: 24px; border-radius: 12px; }
.input-wrap { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 4px 12px; transition: 0.2s;}
.input-wrap:focus-within { border-color: #05c0b8; background: #ffffff; box-shadow: 0 0 0 2px rgba(5,192,184,0.1); }
.prefix { font-size: 1.3rem; font-weight: 900; color: #05c0b8; }
.main-input { flex: 1; background: none; border: none; outline: none; color: #0f172a; font-size: 1.4rem; font-weight: 900; padding: 8px 0; }
.all-btn { cursor: pointer; color: #05c0b8; font-weight: 900; font-size: 0.75rem; padding: 4px 8px; background: rgba(5,192,184,0.1); border-radius: 6px; }

.fee-details { border-top: 1px solid #e2e8f0; padding-top: 12px; display: flex; flex-direction: column; gap: 6px; }
.fee-row { display: flex; justify-content: space-between; font-size: 0.8rem; color: #64748b; font-weight: 600; }
.fee-row.total { color: #0f172a; font-weight: 800; margin-top: 2px; font-size: 0.9rem; }
.settle-val { color: #10b981; }

/* Rules Card */
.rules-card { background: #f0fdfa; border-radius: 12px; padding: 16px; border: 1px dashed rgba(5,192,184,0.3); margin-bottom: 24px; }
.rules-card h3 { font-size: 0.75rem; font-weight: 800; color: #05c0b8; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 0.05em; }
.rules-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.rules-list li { display: flex; align-items: flex-start; gap: 8px; font-size: 0.75rem; color: #475569; font-weight: 500; line-height: 1.4; }
.rules-list .dot { width: 5px; height: 5px; background: #05c0b8; border-radius: 50%; margin-top: 5px; flex-shrink: 0;}
.rules-list b { color: #0f172a; }

/* Requirements */
.play-requirement { background: #fff1f2; border: 1px dashed #fecdd3; border-radius: 12px; padding: 16px; margin-bottom: 20px;}
.play-requirement.met { background: #f0fdf4; border-color: #ccfbf1; }
.req-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 0.8rem; font-weight: 800; color: #0f172a;}
.badge { font-size: 0.6rem; padding: 2px 8px; border-radius: 20px; background: #ef4444; color: #fff; }
.met .badge { background: #10b981; }
.progress-bar { height: 6px; background: #f1f5f9; border-radius: 10px; overflow: hidden; margin-bottom: 10px; }
.progress { height: 100%; background: #ef4444; transition: 0.5s; }
.met .progress { background: #10b981; }
.req-footer { display: flex; justify-content: space-between; font-size: 0.7rem; font-weight: 700; color: #64748b; }
.req-hint { margin-top: 10px; font-size: 0.7rem; color: #ef4444; line-height: 1.4; }

/* History Section */
.history-section { margin-top: 10px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.history-list { display: flex; flex-direction: column; gap: 8px; }
.history-item { padding: 12px 16px; display: flex; align-items: center; gap: 12px; background: #ffffff; border-color: #e2e8f0; border-radius: 12px;}
.h-icon { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.h-icon svg { width: 16px; height: 16px; }
.h-info { flex: 1; }
.h-type { font-weight: 800; font-size: 0.85rem; color: #0f172a; margin-bottom: 2px; }
.h-date { font-size: 0.65rem; color: #64748b; font-weight: 600; }
.h-amount { text-align: right; }
.amt-val { font-weight: 900; font-size: 0.95rem; color: #ef4444; margin-bottom: 2px; }
.amt-status { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; }
.empty-history { padding: 32px 16px; text-align: center; border: 1px dashed #cbd5e1; border-radius: 12px; }
.empty-history p { margin-top: 12px; color: #64748b; font-size: 0.8rem; font-weight: 600; }

/* Footer */
.action-footer { position: fixed; bottom: 0; left: 0; right: 0; z-index: 1000; padding: 12px 16px calc(12px + env(safe-area-inset-bottom)); background: #ffffff; border-top: 1px solid #e2e8f0; box-shadow: 0 -4px 20px rgba(0,0,0,0.05); }
.footer-inner { max-width: 430px; margin: 0 auto; }
.withdraw-btn { width: 100%; height: 48px; background: linear-gradient(135deg, #05c0b8 0%, #0d9488 100%); border: none; border-radius: 12px; color: #fff; font-size: 0.95rem; font-weight: 900; cursor: pointer; box-shadow: 0 4px 15px rgba(5,192,184,0.2); }
.withdraw-btn:disabled { opacity: 0.4; cursor: not-allowed; filter: grayscale(1); box-shadow: none; }

/* Modals */
.modal-overlay { position: fixed; inset: 0; z-index: 5000; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 24px; }
.modal-content { background: #ffffff; width: 100%; max-width: 320px; border-radius: 20px; padding: 24px; border: none; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
.modal-header { margin-bottom: 20px; text-align: center; }
.modal-icon { width: 44px; height: 44px; background: rgba(5,192,184,0.1); color: #05c0b8; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; font-size: 1.2rem; font-weight: 900; }
.modal-header h3 { color: #0f172a; margin: 0; font-size: 1.1rem; }
.modal-summary { background: #f8fafc; padding: 12px; border-radius: 12px; margin-bottom: 16px; border: 1px solid #e2e8f0; }
.sum-row { display: flex; justify-content: space-between; padding: 4px 0; color: #475569; font-weight: 600; font-size: 0.8rem; }
.sum-row.net { color: #0f172a; font-weight: 800; border-top: 1px solid #e2e8f0; margin-top: 6px; padding-top: 6px; }
.sum-row.net span { color: #10b981; }

.modal-input-wrap { border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 10px; padding: 0 12px; margin-bottom: 12px; }
.modal-input-wrap input { width: 100%; height: 44px; background: none; border: none; outline: none; color: #0f172a; font-family: inherit; font-size: 0.85rem; }
.modal-warning { font-size: 0.7rem; color: #ef4444; line-height: 1.4; opacity: 0.9; margin-bottom: 20px; text-align: center; }
.modal-actions { display: flex; gap: 10px; }
.modal-actions button { flex: 1; height: 44px; border-radius: 10px; font-weight: 800; cursor: pointer; border: none; font-size: 0.9rem;}
.btn-cancel { background: #f1f5f9; color: #475569; }
.btn-confirm { background: #05c0b8; color: #fff; }

.toast-card { text-align: center; }
.toast-body { font-size: 0.9rem; font-weight: 600; margin-bottom: 20px; color: #0f172a; }

/* Loader */
.global-loader { position: fixed; inset: 0; z-index: 9999; background: #ffffff; display: flex; align-items: center; justify-content: center; }
.loader-content { text-align: center; }
.loader-circle { width: 44px; height: 44px; border: 3px solid rgba(5,192,184,0.1); border-top-color: #05c0b8; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 12px; }
.loader-text { font-size: 0.75rem; font-weight: 900; color: #05c0b8; letter-spacing: 0.15em; text-transform: uppercase; }

@keyframes spin { to { transform: rotate(360deg); } }
.pulse { animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

@media (max-width: 400px) {
  .amount { font-size: 1.6rem; }
  .prefix { font-size: 1.2rem; }
  .main-input { font-size: 1.3rem; }
}
</style>
