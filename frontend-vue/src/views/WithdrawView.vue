<template>
  <div class="withdrawal-page">
    <div class="mobileContainer">
      <!-- Header -->
      <header class="header">
        <svg @click="router.back()" class="backIcon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        <div class="headerTitle">Withdrawal</div>
        <div class="spacer"></div>
      </header>

      <!-- Balance Info -->
      <div class="balanceSection">
        <div class="balanceLabel">My Balance</div>
        <div class="balanceValue">₹ {{ (userBalance || 0).toFixed(2) }}</div>
      </div>

      <!-- Tab Switcher -->
      <div class="tabs">
        <button 
          :class="['tab', { active: activeTab === 'inr' }]" 
          @click="activeTab = 'inr'"
        >
          INR Withdrawal
        </button>
        <button 
          :class="['tab', { active: activeTab === 'usdt' }]" 
          @click="activeTab = 'usdt'"
        >
          USDT Withdrawal
        </button>
      </div>

      <!-- INR Content -->
      <div v-if="activeTab === 'inr'" class="tabContent">
        <div v-if="bankInfo" class="bankCard">
          <div class="bankTop">
            <span class="bankName">{{ bankInfo.name }}</span>
            <span class="bankLimit">Limit 230 ~ 50000</span>
          </div>
          <div class="bankAcc">Account: XXXXXX{{ bankInfo.account?.slice(-4) }}</div>
        </div>
        <div v-else class="emptyBank">
          <p>Please add a bank account first</p>
          <router-link to="/bank" class="addBankLink">Add Bank</router-link>
        </div>

        <div class="feeInfo">
          <p>Amount: ₹0 - ₹1000, fee ₹30</p>
          <p>Amount: ₹1000 and above, fee 3%</p>
        </div>

        <div class="inputSection">
          <label class="inputLabel">Withdrawal Amount</label>
          <div class="inputGroup">
            <span class="currency">₹</span>
            <input v-model.number="amount" type="number" placeholder="Enter Amount" />
          </div>
          <p class="limitHint">Now you can withdrawal 3 times a day</p>
        </div>

        <div class="limitsList">
          <div class="limitTitle">Single Withdrawal Limit</div>
          <p>maximum amount: ₹50000</p>
          <p>minimum amount: ₹230</p>
          <div class="limitTitle mt-4">Service Time</div>
          <p>Monday - Friday 11:30 - 17:30</p>
        </div>

        <div class="playHint">
          <p>You need to play total bids equal to your last recharge amount</p>
          <p class="hindi">आपको अपनी अंतिम रिचार्ज राशि के बराबर कुल बिड खेलने की आवश्यकता है</p>
          <p class="status">Last recharge: ₹{{ withdrawalLimits.recharge || 0 }}, Remain: ₹{{ Math.max(0, withdrawalLimits.recharge - withdrawalLimits.bid || 0) }}</p>
        </div>

        <button class="actionBtn" :disabled="loading" @click="handleWithdrawal">
          <span v-if="loading" class="btnLoader"></span>
          <span v-else>Withdrawal</span>
        </button>
      </div>

      <!-- USDT Content -->
      <div v-if="activeTab === 'usdt'" class="tabContent">
        <div class="bankCard usdtCard">
          <div class="bankTop">
            <span class="bankName">USDT (TRC20)</span>
            <span class="bankLimit">Rate: 1 USDT = ₹95</span>
          </div>
        </div>

        <div class="feeInfo">
          <p>Conversion Rate: 1 USDT = ₹95</p>
          <p>Minimum: 10 USDT</p>
          <p>Fee: 3% (Min 3 USDT)</p>
        </div>

        <div class="inputSection">
          <label class="inputLabel">USDT Withdrawal Amount</label>
          <div class="inputGroup">
            <span class="currency">USDT</span>
            <input v-model.number="usdtAmount" type="number" placeholder="Enter USDT Amount" />
          </div>
        </div>

        <div v-if="usdtAmount > 0" class="calcSection">
          <p class="calcRow"><span>Withdrawal:</span> <span>{{ usdtAmount.toFixed(2) }} USDT</span></p>
          <p class="calcRow warning"><span>Fee:</span> <span>{{ calculateUsdtFee().toFixed(2) }} USDT</span></p>
          <p class="calcRow success"><span>You'll Receive:</span> <span>{{ (usdtAmount - calculateUsdtFee()).toFixed(2) }} USDT</span></p>
          <p class="calcRow total"><span>Deducted (INR):</span> <span>₹{{ (usdtAmount * 95).toFixed(2) }}</span></p>
        </div>

        <div class="limitsList">
          <div class="limitTitle">USDT Withdrawal Limits</div>
          <p>minimum amount: 10 USDT</p>
          <p>maximum amount: 526 USDT</p>
          <p class="mt-4">• USDT will be sent to your TRC20 wallet address</p>
          <p>• Processing time: 24-48 hours</p>
        </div>

        <button class="actionBtn orange" :disabled="loading" @click="openTrcDialog">
          <span v-if="loading" class="btnLoader"></span>
          <span v-else>Withdraw USDT</span>
        </button>
      </div>

      <router-link to="/withdrawalHistory" class="historyLink">
        <button class="secondaryBtn">Historical</button>
      </router-link>
    </div>

    <!-- TRC Dialog -->
    <div v-if="showTrcDialog" class="dialogOverlay" @click="showTrcDialog = false">
      <div class="dialogCard" @click.stop>
        <h3>Enter TRC20 Wallet Address</h3>
        <div class="summaryBox">
           <p>Amount: {{ usdtAmount }} USDT</p>
           <p class="net">Receive: {{ (usdtAmount - calculateUsdtFee()).toFixed(2) }} USDT</p>
        </div>
        <div class="inputGroup mt-4">
          <input v-model="trcAddress" type="text" placeholder="Wallet Address" />
        </div>
        <p class="warningText">Double check your address. Incorrect addresses result in loss of funds.</p>
        <div class="dialogActions">
          <button @click="showTrcDialog = false" class="cancelBtn">Cancel</button>
          <button @click="handleUsdtWithdrawal" class="confirmBtn">Confirm</button>
        </div>
      </div>
    </div>

    <!-- Notification Dialog -->
    <div v-if="dialog.open" class="dialogOverlay" @click="dialog.open = false">
      <div class="dialogCard" @click.stop>
        <p>{{ dialog.body }}</p>
        <button @click="dialog.open = false" class="confirmBtn">OK</button>
      </div>
    </div>

    <!-- Loader -->
    <div v-if="loading" class="pageLoader">
       <div class="spinner"></div>
       <p>Please Wait!</p>
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
const userBalance = ref(0)
const bankInfo = ref(null)
const withdrawalLimits = reactive({ recharge: 0, bid: 0 })
const dialog = reactive({ open: false, body: '' })
const showTrcDialog = ref(false)

const calculateUsdtFee = () => {
    if (!usdtAmount.value) return 0
    return Math.max(usdtAmount.value * 0.03, 3)
}

async function fetchData() {
    if (!auth.user?.id) return
    loading.value = true
    try {
        const res = await walletApi.getUserWithdrawal(auth.user.id)
        if (res.data) {
            const userData = res.data.user?.[0] || {}
            userBalance.value = userData.balance || 0
            bankInfo.value = userData.bank?.[0] || null
            withdrawalLimits.recharge = res.data.latestRecharge || 0
            withdrawalLimits.bid = res.data.bidsAfterRecharge || 0
        }
    } catch (err) {}
    loading.value = false
}

function openTrcDialog() {
    if (!usdtAmount.value || usdtAmount.value < 10) {
        dialog.body = "Minimum 10 USDT required"
        dialog.open = true
        return
    }
    showTrcDialog.value = true
}

async function handleWithdrawal() {
    if (!amount.value || amount.value < 230) {
        dialog.body = "Minimum ₹230 required"
        dialog.open = true
        return
    }
    loading.value = true
    try {
        await walletApi.applyWithdrawal({ amount: amount.value, userId: auth.user.id })
        dialog.body = "Withdrawal request submitted!"
        dialog.open = true
        fetchData()
    } catch (err) {
        dialog.body = err.response?.data?.error || "Withdrawal failed"
        dialog.open = true
    }
    loading.value = false
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
        dialog.body = "USDT Withdrawal request submitted!"
        dialog.open = true
        fetchData()
    } catch (err) {
        dialog.body = err.response?.data?.error || "USDT Withdrawal failed"
        dialog.open = true
    }
    loading.value = false
}

onMounted(() => {
    fetchData()
})
</script>

<style scoped>
.withdrawal-page {
  min-height: 100vh;
  background-color: #F1F5F9;
  display: flex;
  justify-content: center;
  font-family: system-ui, -apple-system, sans-serif;
}
.mobileContainer {
  width: 100%;
  max-width: 500px;
  background-color: #fff;
  min-height: 100vh;
  padding-bottom: 40px;
}

.header {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background: #fff;
  border-bottom: 1px solid #f1f5f9;
}
.backIcon { cursor: pointer; }
.headerTitle { flex: 1; text-align: center; font-weight: 600; font-size: 17px; }
.spacer { width: 24px; }

.balanceSection {
  padding: 20px;
  background: #fff;
}
.balanceLabel { font-size: 14px; color: #64748B; margin-bottom: 4px; }
.balanceValue { font-size: 1.5rem; font-weight: 700; color: #00b8a9; }

.tabs {
  display: flex;
  margin: 0 20px 20px;
  background: #F8FAFC;
  padding: 4px;
  border-radius: 12px;
}
.tab {
  flex: 1;
  padding: 10px;
  border: none;
  background: none;
  font-weight: 600;
  color: #64748B;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
}
.tab.active {
  background: #fff;
  color: #0F766E;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.tabContent { padding: 0 20px; }

.bankCard {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}
.bankTop { display: flex; justify-content: space-between; margin-bottom: 8px; }
.bankName { font-weight: 700; color: #0F172A; }
.bankLimit { font-size: 12px; color: #64748B; }
.bankAcc { font-size: 14px; color: #64748B; }

.emptyBank { text-align: center; padding: 20px; color: #64748B; }
.addBankLink { display: inline-block; margin-top: 8px; color: #00b8a9; font-weight: 600; text-decoration: none; }

.feeInfo { font-size: 13px; color: #64748B; margin-bottom: 20px; }

.inputSection { margin-bottom: 24px; }
.inputLabel { font-size: 14px; font-weight: 700; color: #0F172A; display: block; margin-bottom: 12px; }
.inputGroup {
  display: flex;
  align-items: center;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 0 16px;
}
.currency { font-weight: 700; color: #0F172A; margin-right: 12px; }
.inputGroup input {
  flex: 1;
  border: none;
  background: none;
  padding: 14px 0;
  font-size: 16px;
  outline: none;
  font-weight: 600;
}
.limitHint { font-size: 12px; color: #64748B; margin-top: 8px; font-weight: 600; }

.limitsList { font-size: 13px; color: #64748B; margin-bottom: 24px; }
.limitTitle { font-weight: 700; color: #0F172A; margin-bottom: 4px; }
.mt-4 { margin-top: 16px; }

.playHint {
  background: #FFFBEB;
  border: 1px solid #FEF3C7;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  font-size: 13px;
  color: #92400E;
}
.hindi { margin-top: 4px; font-size: 12px; }
.status { margin-top: 8px; font-weight: 700; }

.actionBtn {
  width: 100%;
  padding: 16px;
  background: #00b8a9;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
}
.actionBtn.orange { background: #f39c12; }
.actionBtn:disabled { background: #E2E8F0; color: #94A3B8; cursor: not-allowed; }

.calcSection {
  background: #F8FAFC;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 20px;
}
.calcRow { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 6px; }
.calcRow.warning { color: #f39c12; }
.calcRow.success { color: #00b8a9; font-weight: 700; }
.calcRow.total { margin-top: 8px; padding-top: 8px; border-top: 1px dashed #E2E8F0; font-weight: 700; }

.historyLink { text-decoration: none; display: block; margin: 15px 20px; }
.secondaryBtn {
    width: 100%;
    padding: 14px;
    background: #94A3B8;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
}

/* Dialog */
.dialogOverlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.dialogCard {
  background: #fff; padding: 24px; border-radius: 20px; width: 90%; max-width: 400px;
}
.summaryBox { background: #F8FAFC; padding: 12px; border-radius: 10px; font-size: 14px; }
.summaryBox .net { color: #00b8a9; font-weight: 700; }
.warningText { font-size: 11px; color: #94A3B8; margin-top: 12px; }
.dialogActions { display: flex; gap: 12px; margin-top: 20px; }
.dialogActions button { flex: 1; padding: 12px; border-radius: 10px; border: none; font-weight: 700; cursor: pointer; }
.cancelBtn { background: #F1F5F9; color: #64748B; }
.confirmBtn { background: #00b8a9; color: #fff; }

.pageLoader {
  position: fixed; inset: 0; background: rgba(0,0,0,0.7);
  display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 1000; color: #fff;
}
.spinner { width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.3); border-top: 3px solid #fff; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 12px; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
