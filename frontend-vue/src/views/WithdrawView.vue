<template>
  <div class="withdrawal-page">
    <div class="mobile-container">
      <!-- Back Link -->
      <div class="back-link">
        <router-link to="/wallet" class="back-link-inner">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </router-link>
        <span class="back-title">Withdrawal</span>
      </div>

      <div class="balance-title">
        <span class="balance-label">My Balance</span>
        <span class="balance-amount">₹{{ (userBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
      </div>
      
      <!-- Tab Switcher -->
      <div class="tab-switcher-container">
        <div class="tab-switcher">
          <button :class="['tab-btn', { active: activeTab === 'inr' }]" @click="activeTab = 'inr'">
            INR Withdrawal
          </button>
          <button :class="['tab-btn', { active: activeTab === 'usdt' }]" @click="activeTab = 'usdt'">
            USDT Withdrawal
          </button>
        </div>
      </div>

      <!-- INR Channel -->
      <div v-if="activeTab === 'inr'" class="channel-content">
        <div class="card-container">
          <div v-if="bankInfo" class="bank-card">
            <div class="bank-top">
              <span class="bank-name">{{ bankInfo.name }}</span>
              <span class="bank-limit">Limit 230 ~ 50000</span>
            </div>
            <div class="bank-bottom">
              Account: XXXXXX{{ bankInfo.account?.slice(-4) }}
            </div>
          </div>
        </div>

        <div class="info-text">Amount: ₹0 - ₹1000, fee ₹30</div>
        <div class="info-text">Amount: ₹1000 and above, fee 3%</div>

        <div class="input-label">Withdrawal Amount</div>
        <div class="input-card">
          <div class="input-wrap">
            <span class="prefix">₹</span>
            <input type="number" v-model.number="amount" placeholder="Enter Amount" class="main-input" />
          </div>
        </div>

        <div class="limit-info">
          <div class="info-text bold limit-title">Now you can withdrawal 3 times a day</div>
          <div class="input-label">Single Withdrawal Limit</div>
          <div class="info-text">maximum amount: ₹50000</div>
          <div class="info-text">minimum amount: ₹230</div>
          <div class="input-label service-time">Service Time</div>
          <div class="info-text black-text">Monday 11:30-17:30</div>
          <div class="info-text black-text">Tuesday 11:30-17:30</div>
          <div class="info-text black-text">Wednesday 11:30-17:30</div>
          <div class="info-text black-text">Thursday 11:30-17:30</div>
          <div class="info-text black-text">Friday 11:30-17:30</div>
        </div>
        
        <div class="wagering-info">
          <div class="info-text">
            You need to play total bids equal to your last recharge amount<br/>
            <span class="hindi-text">आपको अपनी अंतिम रिचार्ज राशि के बराबर कुल बिड खेलने की आवश्यकता है</span>
          </div>
          <div class="info-text">
            Last recharge amount is ₹{{ withdrawalLimits.recharge }}, play ₹{{ Math.max(0, withdrawalLimits.recharge - withdrawalLimits.bid) }} more amount bids to withdraw<br/>
            <span class="hindi-text">अंतिम रिचार्ज राशि ₹{{ withdrawalLimits.recharge }} है, निकासी के लिए ₹{{ Math.max(0, withdrawalLimits.recharge - withdrawalLimits.bid) }} और अधिक राशि की बिड खेलें</span>
          </div>
        </div>

        <div class="btn-container">
          <button class="withdraw-btn primary-btn" :disabled="loading" @click="handleWithdrawal">
            Withdrawal
          </button>
        </div>
      </div>

      <!-- USDT Channel -->
      <div v-if="activeTab === 'usdt'" class="channel-content">
        <div class="card-container">
          <div class="bank-card usdt-card">
            <div class="bank-top">
              <span class="bank-name">USDT (TRC20)</span>
              <span class="bank-limit">Rate: 1 USDT = ₹95</span>
            </div>
          </div>
        </div>

        <div class="info-text">Conversion Rate: 1 USDT = ₹95</div>
        <div class="info-text">Minimum: 10 USDT</div>
        <div class="info-text">Withdrawal Fee: 3% (deducted from withdrawal amount)</div>
        <div class="info-text sub-text">Minimum fee: 3 USDT</div>

        <div class="input-label">USDT Withdrawal Amount</div>
        <div class="input-card">
          <div class="input-wrap">
            <span class="prefix usdt-text">USDT</span>
            <input type="number" v-model.number="usdtAmount" placeholder="Enter USDT Amount" class="main-input" />
          </div>
        </div>
        
        <div class="fee-details" v-if="usdtAmount > 0">
           <div class="fee-row usdt-text">
             Withdrawal Amount: {{ usdtAmount.toFixed(2) }} USDT
           </div>
           <div class="fee-row warning-text">
             Fee: {{ calculateUsdtFee().toFixed(2) }} USDT
           </div>
           <div class="fee-row danger-text bold">
             Net Amount You'll Receive: {{ Math.max(0, usdtAmount - calculateUsdtFee()).toFixed(2) }} USDT
           </div>
           <div class="fee-row sub-text">
             Total Deducted from Balance: ₹{{ (usdtAmount * 95).toLocaleString() }}
           </div>
        </div>

        <div class="limit-info">
          <div class="input-label">USDT Withdrawal Limits</div>
          <div class="info-text">minimum amount: 10 USDT</div>
          <div class="info-text">maximum amount: {{ Math.floor(50000 / 95) }} USDT</div>
        </div>

        <div class="wagering-info">
          <div class="info-text">
            • USDT will be sent to your TRC20 wallet address<br/>
            • Processing time: 24-48 hours<br/>
            • Network fee may apply
          </div>
        </div>

        <div class="btn-container">
          <button class="withdraw-btn warning-btn" :disabled="loading" @click="processWithdraw">
            Withdraw USDT
          </button>
        </div>
      </div>

      <router-link to="/withdrawalHistory" class="historical-btn">
        Historical
      </router-link>
    </div>

    <!-- TRC Dialog -->
    <div v-if="showTrcDialog" class="modal-overlay" @click="showTrcDialog = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">Enter TRC20 Wallet Address</h3>
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
    <div v-if="dialog.open" class="modal-overlay" @click="dialog.open = false">
      <div class="modal-content toast-card" @click.stop>
        <p class="toast-body">{{ dialog.body }}</p>
      </div>
    </div>

    <!-- Page Loader -->
    <div v-if="loading && !showTrcDialog" class="modal-overlay">
       <div class="loader-content">
         <div class="loader-circle"></div>
         <div class="loader-text">Please Wait!</div>
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
  background-color: #f5f5f5;
  color: #000;
  font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
  padding-bottom: 20px;
}

/* Header */
.header {
  display: none;
}

.back-link {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background: white;
  margin-bottom: 5px;
}
.back-link-inner {
  color: #000;
  display: flex;
  align-items: center;
  width: 33%;
  cursor: pointer;
  text-decoration: none;
}
.back-link-inner svg {
  width: 20px;
  height: 20px;
}
.back-title {
  flex: 1;
  text-align: center;
  font-size: 1.1rem;
  padding-right: 33%;
}

.mobile-container { 
  max-width: 100%; 
  margin: 0 auto; 
}

.balance-title {
  padding: 10px 35px 15px 35px;
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: transparent;
}
.balance-label {
  font-size: 1.15rem;
  font-weight: 500;
  color: #00b8a9;
}
.balance-amount {
  font-size: 1.15rem;
  font-weight: 500;
  color: #00b8a9;
}

.tab-switcher-container {
  padding: 0 20px;
  margin-bottom: 10px;
}

/* Switcher */
.tab-switcher {
  display: flex; background: white;
  border-radius: 4px;
  box-shadow: 0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12);
  overflow: hidden;
}
.tab-btn {
  flex: 1; height: 48px; border: none; background: none; color: rgba(0, 0, 0, 0.54); 
  font-weight: 500; font-size: 0.875rem; cursor: pointer; text-transform: uppercase;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}
.tab-btn.active { color: #1976d2; border-bottom: 2px solid #1976d2; }

.card-container {
  padding: 0 20px;
  margin-bottom: 15px;
}

/* Bank Card */
.bank-card {
  background: #fff;
  border-radius: 10px; padding: 10px;
  box-shadow: 0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12);
}
.bank-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.bank-name { font-weight: bold; font-size: 1rem; }
.bank-limit { font-size: 15px; color: #000; }
.bank-bottom { font-size: 1rem; color: #000; }

.info-text {
  padding-left: 35px;
  padding-right: 20px;
  padding-top: 5px;
  font-size: 1rem;
  color: #000;
  line-height: 1.5;
}
.info-text.bold { font-weight: bold; padding-left: 28px; }
.limit-title { padding-left: 28px !important; margin-bottom: 5px; }
.black-text { color: black !important; }

.input-label {
  padding-left: 22px;
  padding-top: 20px;
  font-weight: bold;
  font-size: 1rem;
}
.service-time { color: black !important; }

.input-card {
  padding: 20px 20px 0 22px;
}
.input-wrap { 
  display: flex; align-items: center;
  background: rgba(0, 0, 0, 0.09);
  border-radius: 4px 4px 0 0;
  padding: 0 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.42);
}
.prefix { font-weight: bold; font-size: 1rem; margin-right: 10px; }
.main-input { 
  flex: 1; background: none; border: none; outline: none; color: #000; 
  font-size: 1rem; padding: 20px 0 6px 0;
}
.main-input::placeholder { color: rgba(0,0,0,0.54); }

.limit-info {
  margin-top: 5px;
}
.limit-info .info-text {
  padding-left: 28px;
}

.wagering-info {
  margin-top: 15px;
}
.wagering-info .info-text {
  padding-left: 28px;
}
.hindi-text {
  font-size: 14px;
}

.btn-container {
  padding: 0 15px;
}

.withdraw-btn { 
  width: 100%; height: 50px; border-radius: 8px; 
  border: none; color: #fff; font-size: 0.875rem; text-transform: none; 
  cursor: pointer; display: block; box-sizing: border-box;
  box-shadow: 0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12);
  margin-top: 15px;
}
.primary-btn { background-color: #00b8a9; }
.warning-btn { background-color: #f39c12; }

.historical-btn {
  display: block; background-color: grey; margin: 15px 20px 100px 20px;
  height: 50px; border-radius: 8px; color: white; text-align: center;
  line-height: 50px; text-decoration: none; font-size: 1rem;
  box-shadow: 0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12);
}

/* USDT specific */
.usdt-text { color: #00b8a9; }
.warning-text { color: #f39c12; }
.danger-text { color: #e74c3c; }
.sub-text { color: #666; font-size: 14px; }
.bold { font-weight: bold; }

.fee-details {
  padding-top: 5px;
}
.fee-row {
  padding-left: 28px;
  padding-top: 2px;
  font-size: 1rem;
}

/* Modals */
.modal-overlay { 
  position: fixed; inset: 0; z-index: 5000; 
  background: rgba(0,0,0,0.5); 
  display: flex; align-items: center; justify-content: center; 
}
.modal-content { 
  background: #ffffff; width: 100%; max-width: 600px; margin: 32px;
  border-radius: 4px; padding: 20px; border: none; 
  box-shadow: 0px 11px 15px -7px rgba(0,0,0,0.2), 0px 24px 38px 3px rgba(0,0,0,0.14), 0px 9px 46px 8px rgba(0,0,0,0.12);
}
.modal-title { font-size: 1.25rem; font-weight: 500; margin: 0 0 15px 0; }

.modal-summary { background: #f8f9fa; padding: 15px; margin-bottom: 15px; border-radius: 4px; }
.sum-row { margin-bottom: 5px; font-size: 1rem; }

.modal-input-wrap {
  background: rgba(0, 0, 0, 0.09);
  border-radius: 4px 4px 0 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.42);
  margin-bottom: 20px;
  padding: 8px 12px 0 12px;
}
.input-label-small { font-size: 0.75rem; color: rgba(0, 0, 0, 0.54); }
.address-input { 
  width: 100%; height: 32px; background: none; border: none; outline: none; 
  color: #000; font-family: inherit; font-size: 1rem; 
  padding: 4px 0; margin-bottom: 4px;
}
.modal-warning { font-size: 12px; color: #888; margin: 0 0 20px 0; }
.modal-actions { display: flex; gap: 16px; }
.modal-actions button { 
  flex: 1; height: 36px; border-radius: 4px; font-weight: 500; 
  cursor: pointer; border: none; font-size: 0.875rem; text-transform: uppercase;
  box-shadow: 0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12);
}
.btn-cancel { background: transparent; color: rgba(0, 0, 0, 0.87); border: 1px solid rgba(0, 0, 0, 0.23) !important; box-shadow: none !important;}
.warning-bg { background-color: #f39c12; color: white; }

.toast-card { text-align: left; padding: 24px; max-width: 400px; }
.toast-body { font-size: 1rem; margin: 0; color: rgba(0, 0, 0, 0.87); white-space: pre-wrap;}

/* Loader */
.loader-content { 
  text-align: center; background: rgba(0,0,0,0.6); padding: 20px; border-radius: 4px; width: 250px;
}
.loader-circle { 
  width: 40px; height: 40px; border: 4px solid transparent; border-top-color: #fff; 
  border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 10px; 
}
.loader-text { font-size: 1rem; color: #fff; }

@keyframes spin { to { transform: rotate(360deg); } }
</style>
