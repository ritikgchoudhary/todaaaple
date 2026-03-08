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
          <router-link to="/bank" class="btn-primary-sm">Add Bank Account</router-link>
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
  background-color: #0c0d10;
  color: #f1f5f9;
  font-family: 'Outfit', sans-serif;
  padding-bottom: 120px;
}

/* Header */
.header {
  height: 64px; position: sticky; top: 0; z-index: 1000;
  background: rgba(12, 13, 16, 0.9); backdrop-filter: blur(15px);
  display: flex; align-items: center; justify-content: space-between; padding: 0 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
.header-left { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; color: #94a3b8; cursor: pointer; }
.header-title { font-size: 1.1rem; font-weight: 800; color: #fff; text-transform: uppercase; letter-spacing: 0.1em; }
.header-right { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; color: #d9a05b; text-decoration: none; }

.mobile-container { max-width: 480px; margin: 0 auto; padding: 24px 16px; }

/* Balance Card */
.balance-card {
  padding: 24px; margin-bottom: 32px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(12, 13, 16, 0.1) 100%);
  border-color: rgba(16, 185, 129, 0.2);
}
.card-glow {
  position: absolute; top: -30%; right: -20%; width: 140px; height: 140px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%); filter: blur(30px);
}
.label-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.label { font-size: 0.8rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
.refresh-btn { background: none; border: none; color: #10b981; cursor: pointer; transition: 0.5s; }
.refresh-btn.spinning { transform: rotate(360deg); }
.amount-row { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
.currency { font-size: 1.5rem; font-weight: 900; color: #10b981; }
.amount { font-size: 2.25rem; font-weight: 900; color: #fff; letter-spacing: -0.02em; }
.card-footer { display: flex; align-items: center; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.05); }
.wallet-tag { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; font-weight: 700; color: #64748b; }

/* Switcher */
.tab-switcher {
  display: flex; background: #15171c; padding: 6px; border-radius: 16px; margin-bottom: 32px;
  border: 1px solid rgba(255,255,255,0.05);
}
.tab-btn {
  flex: 1; height: 44px; border: none; background: none; color: #64748b; font-weight: 800;
  font-size: 0.85rem; border-radius: 12px; cursor: pointer; transition: 0.2s;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.tab-btn.active { background: #d9a05b; color: #fff; box-shadow: 0 4px 12px rgba(217,160,91,0.25); }
.dot { width: 6px; height: 6px; border-radius: 50%; border: 1.5px solid currentColor; }

/* Bank Card */
.premium-bank-card {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-radius: 20px; padding: 24px; position: relative; overflow: hidden;
  border: 1px solid rgba(255,255,255,0.08); margin-bottom: 32px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
}
.card-type { font-size: 0.65rem; color: #d9a05b; font-weight: 900; letter-spacing: 0.2em; margin-bottom: 20px; }
.bank-main { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
.bank-icon-wrap { width: 50px; height: 50px; border-radius: 14px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; color: #d9a05b; font-size: 1.5rem; font-weight: 900; }
.bank-details .bank-name { font-size: 1.1rem; font-weight: 800; color: #fff; margin-bottom: 4px; }
.bank-details .bank-acc { font-family: monospace; font-size: 1rem; color: #94a3b8; letter-spacing: 1.5px; }
.bank-footer { display: flex; align-items: center; justify-content: space-between; font-size: 0.75rem; color: #64748b; font-weight: 700; }
.change-tag { color: #d9a05b; text-decoration: none; border-bottom: 1.5px solid transparent; transition: 0.2s; }
.change-tag:hover { border-color: #d9a05b; }

.usdt-card { background: linear-gradient(135deg, #134e4a 0%, #064e3b 100%); border-color: rgba(16,185,129,0.2); }

/* Input Card */
.section-title { font-size: 0.95rem; font-weight: 800; margin: 0 0 16px 4px; color: #fff; text-transform: uppercase; }
.input-card { padding: 24px; margin-bottom: 32px; }
.input-wrap { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
.prefix { font-size: 1.6rem; font-weight: 900; color: #d9a05b; }
.main-input { flex: 1; background: none; border: none; outline: none; color: #fff; font-size: 1.8rem; font-weight: 900; padding: 8px 0; }
.all-btn { cursor: pointer; color: #d9a05b; font-weight: 900; font-size: 0.8rem; padding: 6px 10px; background: rgba(217,160,91,0.1); border-radius: 8px; }

.fee-details { border-top: 1px solid rgba(255,255,255,0.05); padding-top: 16px; display: flex; flex-direction: column; gap: 10px; }
.fee-row { display: flex; justify-content: space-between; font-size: 0.85rem; color: #64748b; font-weight: 600; }
.fee-row.total { color: #fff; font-weight: 800; margin-top: 4px; font-size: 0.95rem; }
.settle-val { color: #10b981; }

/* Rules Card */
.rules-card { background: rgba(255,255,255,0.02); border-radius: 16px; padding: 20px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 32px; }
.rules-card h3 { font-size: 0.85rem; font-weight: 800; color: #d9a05b; margin: 0 0 14px; }
.rules-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.rules-list li { display: flex; align-items: center; gap: 10px; font-size: 0.8rem; color: #94a3b8; font-weight: 500; }
.rules-list .dot { width: 5px; height: 5px; background: #64748b; border-radius: 50%; opacity: 0.5; }
.rules-list b { color: #fff; }

/* Requirements */
.play-requirement { background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.1); border-radius: 16px; padding: 20px; }
.play-requirement.met { background: rgba(16, 185, 129, 0.05); border-color: rgba(16, 185, 129, 0.1); }
.req-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 0.85rem; font-weight: 800; }
.badge { font-size: 0.65rem; padding: 4px 10px; border-radius: 20px; background: #ef4444; color: #fff; }
.met .badge { background: #10b981; }
.progress-bar { height: 8px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden; margin-bottom: 12px; }
.progress { height: 100%; background: #ef4444; transition: 0.5s; }
.met .progress { background: #10b981; }
.req-footer { display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 700; color: #64748b; }
.req-hint { margin-top: 12px; font-size: 0.75rem; color: #ef4444; line-height: 1.4; }

/* Footer */
.action-footer { position: fixed; bottom: 0; left: 0; right: 0; z-index: 1000; padding: 18px 20px calc(18px + env(safe-area-inset-bottom)); background: #0c0d10; border-top: 1px solid rgba(255, 255, 255, 0.08); }
.footer-inner { max-width: 480px; margin: 0 auto; }
.withdraw-btn { width: 100%; height: 56px; background: linear-gradient(135deg, #d9a05b 0%, #a67332 100%); border: none; border-radius: 16px; color: #fff; font-size: 1rem; font-weight: 900; cursor: pointer; box-shadow: 0 4px 20px rgba(217,160,91,0.25); }
.withdraw-btn:disabled { opacity: 0.4; cursor: not-allowed; filter: grayscale(1); box-shadow: none; }

/* Modals */
.modal-overlay { position: fixed; inset: 0; z-index: 5000; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; padding: 24px; }
.modal-content { background: #15171c; width: 100%; max-width: 360px; border-radius: 28px; padding: 32px 24px; border: 1px solid rgba(217,160,91,0.2); }
.modal-header { margin-bottom: 24px; text-align: center; }
.modal-icon { width: 50px; height: 50px; background: rgba(217,160,91,0.1); color: #d9a05b; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; font-size: 1.5rem; font-weight: 900; }
.modal-summary { background: rgba(0,0,0,0.2); padding: 16px; border-radius: 16px; margin-bottom: 20px; }
.sum-row { display: flex; justify-content: space-between; padding: 4px 0; color: #94a3b8; font-weight: 600; font-size: 0.9rem; }
.sum-row.net { color: #fff; font-weight: 800; border-top: 1px solid rgba(255,255,255,0.05); margin-top: 8px; padding-top: 8px; }
.sum-row.net span { color: #10b981; }

.modal-input-wrap { border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.2); border-radius: 12px; padding: 0 16px; margin-bottom: 12px; }
.modal-input-wrap input { width: 100%; height: 52px; background: none; border: none; outline: none; color: #fff; font-family: inherit; font-size: 0.95rem; }
.modal-warning { font-size: 0.7rem; color: #ef4444; line-height: 1.4; opacity: 0.8; margin-bottom: 24px; }
.modal-actions { display: flex; gap: 12px; }
.modal-actions button { flex: 1; height: 48px; border-radius: 12px; font-weight: 800; cursor: pointer; border: none; }
.btn-cancel { background: #1e293b; color: #94a3b8; }
.btn-confirm { background: #d9a05b; color: #fff; }

.toast-card { text-align: center; }
.toast-body { font-size: 1rem; font-weight: 600; margin-bottom: 24px; color: #fff; }

/* Loader */
.global-loader { position: fixed; inset: 0; z-index: 9999; background: #0c0d10; display: flex; align-items: center; justify-content: center; }
.loader-content { text-align: center; }
.loader-circle { width: 48px; height: 48px; border: 3px solid rgba(255,255,255,0.05); border-top-color: #d9a05b; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px; }
.loader-text { font-size: 0.8rem; font-weight: 900; color: #d9a05b; letter-spacing: 0.2em; text-transform: uppercase; }

@keyframes spin { to { transform: rotate(360deg); } }
.pulse { animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

@media (max-width: 400px) {
  .amount { font-size: 1.75rem; }
  .prefix { font-size: 1.4rem; }
  .main-input { font-size: 1.5rem; }
}
</style>
