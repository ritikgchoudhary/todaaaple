<template>
  <div class="withdrawal-page">
    <div class="mobile-container">
      <!-- Header -->
      <div class="header">
        <div class="header-left" @click="router.back()">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </div>
        <h1 class="header-title">Withdrawal</h1>
        <router-link to="/withdrawalHistory" class="header-right">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
        </router-link>
      </div>

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
          <div class="card-footer">
            <span class="user-id">UID: {{ auth.user?.id }}</span>
            <div class="secure-tag">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              SECURE
            </div>
          </div>
        </div>
      </div>
      
      <!-- Tab Switcher -->
      <div class="tab-switcher-wrapper">
        <div class="tab-switcher">
          <button :class="['tab-btn', { active: activeTab === 'inr' }]" @click="activeTab = 'inr'">
            <div class="btn-inner">
              <span class="btn-text">INR</span>
            </div>
          </button>
          <button :class="['tab-btn', { active: activeTab === 'usdt' }]" @click="activeTab = 'usdt'">
            <div class="btn-inner">
              <span class="btn-text">USDT</span>
            </div>
          </button>
        </div>
      </div>

      <!-- INR Channel -->
      <div v-if="activeTab === 'inr'" class="channel-content">
        <div class="section-header">
           <div class="section-icon"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></div>
           <h2 class="section-title">Receiver Account</h2>
        </div>

        <div v-if="bankInfo" class="bank-card-modern">
          <div class="bank-card-glow"></div>
          <div class="bank-card-content">
            <div class="bank-main">
              <span class="bank-name">{{ bankInfo.name }}</span>
              <span class="bank-tag">ACTIVE</span>
            </div>
            <div class="bank-sub">Account: XXXXXX{{ bankInfo.account?.slice(-4) }}</div>
            <div class="bank-footer">
              <span class="bank-limit">LIMIT: ₹230 ~ ₹50,000</span>
            </div>
          </div>
        </div>
        <div v-else class="empty-bank-notice" @click="router.push('/bank')">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
           <span>Click to bind bank account</span>
        </div>

        <div class="amount-card">
          <div class="input-head">
            <span class="input-title">Withdrawal Amount</span>
            <span class="fee-badge">FEE: {{ amount >= 1000 ? '3%' : '₹30' }}</span>
          </div>
          <div class="input-container">
            <span class="input-prefix">₹</span>
            <input type="number" v-model.number="amount" class="amount-input" placeholder="0.00" />
            <button v-if="amount" class="clear-btn" @click="amount = null">×</button>
          </div>
          
          <div class="chips-container">
            <button v-for="val in [500, 1000, 5000, 10000]" :key="val" 
                    class="chip" :class="{ active: amount === val }"
                    @click="amount = val">
              ₹{{ val.toLocaleString() }}
            </button>
          </div>
        </div>

        <!-- Rules / Info -->
        <div class="details-card">
          <h3>Withdrawal Rules</h3>
          <ul class="instruction-list">
            <li>
              <div class="num">1</div>
              <p>Minimum: <b>₹230</b> | Maximum: <b>₹50,000</b></p>
            </li>
            <li>
              <div class="num">2</div>
              <p>Daily limit: <b>3 withdrawals</b> per day.</p>
            </li>
            <li>
              <div class="num">3</div>
              <p>Service Time: <b>11:30 - 17:30</b> (Mon-Fri)</p>
            </li>
          </ul>
        </div>

        <div class="details-card wag-card" :class="{ 'wag-warning': (withdrawalLimits.recharge - withdrawalLimits.bid) > 0 }">
          <div class="wag-header">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>Wagering Status</span>
          </div>
          <div class="wag-body">
            <p>You need to play total bids equal to your last recharge amount (<b>₹{{ withdrawalLimits.recharge }}</b>).</p>
            <div v-if="(withdrawalLimits.recharge - withdrawalLimits.bid) > 0" class="wag-status-row">
               <span>Remaining: </span>
               <span class="wag-val">₹{{ Math.max(0, withdrawalLimits.recharge - withdrawalLimits.bid).toFixed(2) }}</span>
            </div>
            <div v-else class="wag-status-row success">
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
               <span>Condition Met</span>
            </div>
          </div>
        </div>

        <div class="btn-wrap">
          <button class="withdraw-btn main-btn" :disabled="loading" @click="handleWithdrawal">
            <span v-if="loading" class="btn-spinner"></span>
            <span v-else>Confirm Withdrawal</span>
          </button>
        </div>
      </div>

      <!-- USDT Channel -->
      <div v-if="activeTab === 'usdt'" class="channel-content">
        <div class="bank-card-modern usdt-theme">
          <div class="bank-card-glow"></div>
          <div class="bank-card-content">
            <div class="bank-main">
              <span class="bank-name">USDT (TRC20)</span>
              <span class="bank-tag usdt">NETWORK OK</span>
            </div>
            <div class="bank-sub">Conversion Rate: <b>1 USDT = ₹95</b></div>
            <div class="bank-footer">
              <span class="bank-limit">MIN: 10 USDT | FEE: 3%</span>
            </div>
          </div>
        </div>

        <div class="amount-card">
          <div class="input-head">
            <span class="input-title">USDT Amount</span>
          </div>
          <div class="input-container">
            <span class="input-prefix usdt">USDT</span>
            <input type="number" v-model.number="usdtAmount" class="amount-input" placeholder="0.00" />
            <button v-if="usdtAmount" class="clear-btn" @click="usdtAmount = null">×</button>
          </div>
          
          <div class="chips-container">
            <button v-for="val in [10, 50, 100, 500]" :key="val" 
                    class="chip" :class="{ active: usdtAmount === val }"
                    @click="usdtAmount = val">
              {{ val }} USDT
            </button>
          </div>
        </div>
        
        <div class="details-card calculations" v-if="usdtAmount > 0">
           <h3>Summary</h3>
           <div class="calc-row">
             <span>Withdrawal Amount:</span>
             <span class="val">{{ usdtAmount.toFixed(2) }} USDT</span>
           </div>
           <div class="calc-row warning">
             <span>Estimated Fee (3%):</span>
             <span class="val">{{ calculateUsdtFee().toFixed(2) }} USDT</span>
           </div>
           <div class="calc-row net">
             <span>Net to Wallet:</span>
             <span class="val">{{ Math.max(0, usdtAmount - calculateUsdtFee()).toFixed(2) }} USDT</span>
           </div>
           <div class="calc-divider"></div>
           <div class="calc-row total">
             <span>Deducted Balance:</span>
             <span class="val">₹{{ (usdtAmount * 95).toLocaleString() }}</span>
           </div>
        </div>

        <div class="details-card">
          <h3>USDT Instructions</h3>
          <ul class="instruction-list">
            <li><div class="num">•</div><p>Funds will be sent to your <b>TRC20</b> address only.</p></li>
            <li><div class="num">•</div><p>Standard processing: <b>24-48 hours</b>.</p></li>
          </ul>
        </div>

        <div class="btn-wrap">
          <button class="withdraw-btn usdt-btn" :disabled="loading" @click="processWithdraw">
            <span v-if="loading" class="btn-spinner"></span>
            <span v-else>Withdraw USDT</span>
          </button>
        </div>
      </div>

      <!-- History button: go to withdrawal history -->
      <div class="history-btn-wrap">
        <router-link to="/withdrawalHistory" class="history-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          History
        </router-link>
      </div>
    </div>

    <!-- TRC Dialog -->
    <div v-if="showTrcDialog" class="modal-overlay" @click="showTrcDialog = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
           <h3 class="modal-title">Enter TRC20 Wallet Address</h3>
        </div>
        <div class="modal-summary">
           <div class="sum-row sub-text"><strong>Withdrawal Amount:</strong> {{ usdtAmount }} USDT</div>
           <div class="sum-row warning-text"><strong>Fee (3%):</strong> {{ calculateUsdtFee().toFixed(2) }} USDT</div>
           <div class="sum-row primary-text bold"><strong>Net Amount You'll Receive:</strong> {{ Math.max(0, usdtAmount - calculateUsdtFee()).toFixed(2) }} USDT</div>
           <div class="sum-row sub-text"><strong>Deducted from Balance:</strong> ₹{{ (usdtAmount * 95).toFixed(2) }}</div>
        </div>
        <div class="modal-input-wrap">
           <div class="input-label-small">TRC20 Wallet Address</div>
           <input v-model="trcAddress" type="text" placeholder="Enter your TRC20 wallet address" class="address-input" />
        </div>
        <p class="modal-warning">Please double-check your TRC20 address. Incorrect addresses may result in loss of funds.</p>
        <div class="modal-actions">
           <button @click="showTrcDialog = false" class="btn-cancel">CANCEL</button>
           <button @click="handleUsdtWithdrawal" class="btn-confirm warning-bg">CONFIRM</button>
        </div>
      </div>
    </div>

    <!-- Toast Modal -->
    <div v-if="dialog.open" class="modal-overlay" @click="dialog.open = false" style="background: transparent;">
      <div class="modal-content toast-card" @click.stop style="background: rgba(0,0,0,0.8); color: white; border-radius: 4px; padding: 15px; margin-bottom: 20px;">
        <p class="toast-body" style="color: white; margin: 0; font-size: 14px;">{{ dialog.body }}</p>
      </div>
    </div>

    <!-- Page Loader -->
    <div v-if="loading && !showTrcDialog" class="modal-overlay" style="background: transparent;">
       <div class="loader-content" style="background: rgba(0,0,0,0.6); padding: 20px; border-radius: 4px; width: 150px; text-align: center;">
         <div class="loader-circle" style="border-top-color: white; width: 40px; height: 40px; border-width: 4px; margin: 0 auto 10px;"></div>
         <div class="loader-text" style="color: white; font-weight: normal;">Please Wait!</div>
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

function processWithdraw() {
    if (activeTab.value === 'usdt') {
        if (!usdtAmount.value || usdtAmount.value < 10) {
            dialog.body = "Minimum 10 USDT required"
            dialog.open = true
            return
        }
        if ((usdtAmount.value * 95) > userBalance.value) {
            dialog.body = `Insufficient Fund. Required: ₹${(usdtAmount.value * 95).toFixed(2)}`
            dialog.open = true
            return
        }
        showTrcDialog.value = true
    } else {
        handleWithdrawal()
    }
}

async function handleWithdrawal() {
    if (!amount.value || amount.value < 230) {
        dialog.body = "Minimum ₹230"
        dialog.open = true
        return
    }
    if (amount.value > userBalance.value) {
        dialog.body = "Insufficient Fund"
        dialog.open = true
        return
    }
    if (!bankInfo.value) {
        dialog.body = "Please Add UPI or a bank account first"
        dialog.open = true
        return
    }

    loading.value = true
    try {
        await walletApi.applyWithdrawal({ amount: amount.value, userId: auth.user.id })
        router.push("/wallet")
    } catch (err) {
        dialog.body = err.response?.data?.error || "Transaction could not be initiated."
        dialog.open = true
    } finally {
        loading.value = false
    }
}

async function handleUsdtWithdrawal() {
    if (!trcAddress.value.trim()) {
        dialog.body = "Please enter a valid TRC20 wallet address"
        dialog.open = true
        return
    }
    
    loading.value = true
    try {
        const fee = calculateUsdtFee()
        await walletApi.applyWithdrawalUSDT({ 
            amount: usdtAmount.value, 
            walletAddress: trcAddress.value,
            fee,
            netAmount: usdtAmount.value - fee,
            totalAmount: usdtAmount.value,
            currency: 'USDT',
            userId: auth.user.id 
        })
        
        dialog.body = `USDT withdrawal request submitted successfully!\nYou will receive: ${(usdtAmount.value - fee).toFixed(2)} USDT\nTo address: ${trcAddress.value}\nFee deducted: ${fee.toFixed(2)} USDT`
        dialog.open = true
        showTrcDialog.value = false
        trcAddress.value = ''
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
  min-height: 100dvh;
  background-color: #f1f5f9;
  display: flex;
  justify-content: center;
  font-family: 'Outfit', 'Roboto', sans-serif;
  color: #0f172a;
  padding-top: env(safe-area-inset-top, 0);
}

.mobile-container {
  width: 100%;
  max-width: 430px;
  background-color: #fff;
  min-height: 100vh;
  min-height: 100dvh;
  padding-bottom: 60px;
  position: relative;
  box-shadow: 0 0 30px rgba(15, 23, 42, 0.1);
  overflow-x: hidden;
}

/* History button */
.history-btn-wrap {
  margin: 16px;
  padding-bottom: 24px;
}
.history-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px 20px;
  background: #e2e8f0;
  color: #475569;
  font-size: 0.9375rem;
  font-weight: 700;
  text-decoration: none;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.history-btn:hover {
  background: #cbd5e1;
  color: #0f172a;
}

/* Header */
.header {
  position: sticky; 
  top: 0; 
  z-index: 1000;
  min-height: 56px; 
  padding-top: env(safe-area-inset-top, 0);
  background: rgba(255, 255, 255, 0.95); 
  backdrop-filter: blur(20px);
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  padding-left: 16px;
  padding-right: 16px;
  padding-bottom: 0;
  border-bottom: 1px solid #f1f5f9;
}
.header-left { 
  width: 40px; 
  height: 40px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  color: #64748b; 
  cursor: pointer; 
}
.header-title { 
  font-size: 1rem; 
  font-weight: 800; 
  color: #0f172a; 
  margin: 0; 
  text-transform: uppercase; 
  letter-spacing: 0.1em; 
}
.header-right { 
  width: 40px; 
  height: 40px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  color: #05c0b8; 
  cursor: pointer; 
}

/* Glass Card */
.glass-card {
  background: #ffffff; 
  border: 1px solid #f1f5f9;
  border-radius: 20px; 
  position: relative; 
  overflow: hidden;
  margin: 16px;
}

/* Balance Card */
.balance-card {
  padding: 20px; 
  background: linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%);
  border-color: #ccfbf1;
  box-shadow: 0 8px 25px rgba(5,192,184,0.08);
}
.card-glow {
  position: absolute; 
  top: -30%; 
  right: -20%; 
  width: 120px; 
  height: 120px;
  background: radial-gradient(circle, rgba(5,192,184, 0.2) 0%, transparent 70%); 
  filter: blur(25px);
}
.label-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.label { font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
.refresh-btn { background: none; border: none; color: #05c0b8; padding: 4px; cursor: pointer; display: flex;}
.refresh-btn.spinning { animation: spin 1s linear infinite; }
.amount-row { display: flex; align-items: baseline; gap: 4px; margin-bottom: 16px; }
.currency { font-size: 1.2rem; font-weight: 900; color: #05c0b8; margin-right: 2px; }
.amount { font-size: 1.8rem; font-weight: 900; color: #0f172a; letter-spacing: -0.02em; }
.card-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 14px; border-top: 1px solid #f1f5f9; }
.user-id { font-size: 0.7rem; color: #64748b; font-weight: 700; }
.secure-tag { display: flex; align-items: center; gap: 4px; font-size: 0.65rem; font-weight: 800; color: #10b981; background: rgba(16,185,129,0.1); padding: 4px 10px; border-radius: 30px; letter-spacing: 0.05em; }

/* Tab Switcher */
.tab-switcher-wrapper {
  padding: 0 16px;
  margin: 12px 0 24px;
}
.tab-switcher {
  display: flex;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 12px;
}
.tab-btn {
  flex: 1;
  height: 42px;
  border: none;
  background: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.tab-btn .btn-text {
  font-size: 0.85rem;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.tab-btn.active {
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
}
.tab-btn.active .btn-text {
  color: #05c0b8;
}

/* Sections */
.channel-content {
  padding: 0 16px;
}
.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding-left: 4px;
}
.section-icon {
  width: 28px;
  height: 28px;
  background: rgba(5,192,184,0.1);
  color: #05c0b8;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.section-title {
  font-size: 0.9rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Modern Bank Card */
.bank-card-modern {
  position: relative;
  background: #1e293b;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 24px;
  color: #fff;
  overflow: hidden;
  box-shadow: 0 12px 30px -10px rgba(15, 23, 42, 0.3);
}
.bank-card-glow {
  position: absolute;
  top: -50%;
  right: -20%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(53, 222, 218, 0.1) 0%, transparent 70%);
  filter: blur(40px);
}
.bank-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.bank-name {
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 0.02em;
}
.bank-tag {
  font-size: 0.65rem;
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  padding: 4px 10px;
  border-radius: 30px;
  font-weight: 800;
  border: 1px solid rgba(16, 185, 129, 0.3);
}
.bank-sub {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  margin-bottom: 16px;
}
.bank-footer {
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
.bank-limit {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.usdt-theme {
  background: linear-gradient(135deg, #115e59 0%, #0d9488 100%);
}
.bank-tag.usdt {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.3);
}

.empty-bank-notice {
  background: #f8fafc;
  border: 2px dashed #e2e8f0;
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}
.empty-bank-notice:active {
  background: #f1f5f9;
  border-color: #05c0b8;
  color: #05c0b8;
}
.empty-bank-notice span {
  font-size: 0.85rem;
  font-weight: 800;
}

/* Amount Card */
.amount-card {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 4px 15px rgba(15, 23, 42, 0.03);
}
.input-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.input-title {
  font-size: 0.8rem;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.fee-badge {
  font-size: 0.65rem;
  font-weight: 800;
  color: #05c0b8;
  background: rgba(5, 192, 184, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
}

.input-container {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 2px 16px;
  margin-bottom: 16px;
  transition: 0.2s;
}
.input-container:focus-within {
  border-color: #05c0b8;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(5, 192, 184, 0.1);
}
.input-prefix {
  font-size: 1.4rem;
  font-weight: 900;
  color: #05c0b8;
  margin-right: 8px;
}
.input-prefix.usdt { font-size: 0.8rem; margin-right: 12px; color: #64748b; }
.amount-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: #0f172a;
  font-size: 1.6rem;
  font-weight: 900;
  padding: 12px 0;
  font-family: 'Outfit', sans-serif;
}
.amount-input::placeholder { color: #cbd5e1; }
.clear-btn {
  background: #e2e8f0;
  border: none;
  color: #64748b;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.chips-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.chip {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 4px;
  color: #475569;
  font-size: 0.75rem;
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s;
}
.chip.active {
  background: #05c0b8;
  border-color: #05c0b8;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(5, 192, 184, 0.3);
}

/* Detail Cards */
.details-card {
  padding: 20px;
  background: #f8fafc;
  border-radius: 20px;
  margin-bottom: 24px;
  border: 1px solid #f1f5f9;
}
.details-card h3 {
  font-size: 0.8rem;
  font-weight: 900;
  color: #0f172a;
  margin: 0 0 14px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 8px;
}
.details-card h3::before {
  content: '';
  width: 4px;
  height: 14px;
  background: #05c0b8;
  border-radius: 10px;
}

.instruction-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.instruction-list li {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.instruction-list .num {
  width: 18px;
  height: 18px;
  background: rgba(5, 192, 184, 0.1);
  color: #05c0b8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 900;
  flex-shrink: 0;
  margin-top: 1px;
}
.instruction-list p {
  margin: 0;
  font-size: 0.8rem;
  color: #475569;
  line-height: 1.6;
  font-weight: 500;
}
.instruction-list b { color: #0f172a; font-weight: 800; }

.wag-card {
  background: #fff;
  border: 1px solid #f1f5f9;
}
.wag-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  font-weight: 800;
  color: #64748b;
  margin-bottom: 12px;
}
.wag-body p {
  font-size: 0.8rem;
  color: #64748b;
  line-height: 1.5;
  margin: 0 0 10px;
}
.wag-status-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 800;
  color: #64748b;
}
.wag-val { color: #ef4444; }
.wag-status-row.success { color: #10b981; }
.wag-warning { border-color: #fee2e2; background: #fffafb; }
.wag-warning .num { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

/* Totals / Calcs */
.calc-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #64748b;
}
.calc-row.warning .val { color: #f59e0b; }
.calc-row.net { margin-top: 12px; }
.calc-row.net .val { color: #10b981; font-size: 1rem; font-weight: 900; }
.calc-divider { height: 1px; background: #e2e8f0; margin: 12px 0; border-radius: 10px; }
.calc-row.total .val { color: #0f172a; font-size: 1rem; font-weight: 900; }

/* Buttons */
.btn-wrap {
  padding: 16px 0 40px;
}
.withdraw-btn {
  width: 100%;
  height: 54px;
  border: none;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.withdraw-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.main-btn {
  background: linear-gradient(135deg, #05c0b8 0%, #0d9488 100%);
  color: #fff;
  box-shadow: 0 8px 25px rgba(5, 192, 184, 0.3);
}
.main-btn:active { transform: scale(0.98); box-shadow: 0 4px 12px rgba(5, 192, 184, 0.2); }

.usdt-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff;
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
}

.btn-spinner {
  width: 22px;
  height: 22px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Modals */
.modal-overlay { 
  position: fixed; inset: 0; z-index: 5000; 
  background: rgba(15, 23, 42, 0.4); 
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center; 
  padding: 24px;
}
.modal-content { 
  background: #ffffff; 
  width: 100%; 
  max-width: 360px; 
  border-radius: 24px; 
  padding: 28px; 
  border: none; 
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: modalIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes modalIn {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-header { margin-bottom: 20px; text-align: center; }
.modal-title { font-size: 1.1rem; font-weight: 900; color: #0f172a; margin: 0; }
.modal-summary { background: #f8fafc; padding: 16px; border-radius: 16px; margin-bottom: 20px; border: 1px solid #f1f5f9; }
.sum-row { margin-bottom: 8px; font-size: 0.85rem; display: flex; justify-content: space-between; }
.sum-row:last-child { margin-bottom: 0; }
.primary-text { color: #05c0b8; }

.modal-input-wrap {
  margin-bottom: 24px;
}
.address-input { 
  width: 100%; 
  background: #f8fafc; 
  border: 1px solid #e2e8f0; 
  border-radius: 12px; 
  padding: 14px 16px;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 500;
  color: #0f172a;
  outline: none;
  transition: 0.2s;
  box-sizing: border-box;
}
.address-input:focus { border-color: #05c0b8; background: #fff; box-shadow: 0 0 0 4px rgba(5, 192, 184, 0.1); }
.modal-warning { font-size: 0.75rem; color: #ef4444; margin: -10px 0 20px; font-weight: 600; line-height: 1.4; }

.modal-actions { display: flex; gap: 12px; }
.modal-actions button { 
  flex: 1; height: 46px; border-radius: 12px; font-weight: 800; cursor: pointer; border: none; font-size: 0.9rem; transition: 0.2s;
}
.btn-cancel { background: #f1f5f9; color: #64748b; }
.btn-confirm { background: #05c0b8; color: #fff; box-shadow: 0 4px 12px rgba(5, 192, 184, 0.2); }

.toast-card { text-align: center; padding: 20px; max-width: 300px; border-radius: 16px !important; }
.toast-body { font-size: 0.9rem; font-weight: 600; }

@keyframes spin { to { transform: rotate(360deg); } }
</style>
