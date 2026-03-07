<template>
  <div class="deposit-page">
    <div class="mobileContainer">
      <!-- Header -->
      <header class="header">
        <svg @click="router.back()" class="backIcon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        <div class="headerTitle">Recharge</div>
        <div class="spacer"></div>
      </header>

      <!-- Balance Info -->
      <div class="balanceSection">
        <div class="balanceLabel">Total Balance</div>
        <div class="balanceValue">₹ {{ (userBalance || 0).toFixed(2) }}</div>
      </div>

      <div class="tabContent">
        <!-- Amount Input Group -->
        <div class="inputSection">
          <div class="sectionTitle">
            <svg class="sectionIcon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#05c0b8" stroke-width="2.5"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            Recharge Amount
          </div>
          <div class="inputGroup">
            <span class="currency">₹</span>
            <input v-model.number="amount" type="number" placeholder="Enter Amount" />
            <button v-if="amount" @click="amount = null" class="clearBtn">×</button>
          </div>
        </div>

        <!-- Quick Amount Grid -->
        <div class="amountGrid">
          <button 
            v-for="amt in quickAmounts" 
            :key="amt" 
            :class="['amtBtn', { active: amount === amt }]"
            @click="amount = amt"
          >
            ₹{{ amt }}
          </button>
        </div>

        <!-- Payment Channel Grid -->
        <div class="channelSection">
          <div class="sectionTitle">
            <svg class="sectionIcon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#05c0b8" stroke-width="2.5"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-14v10M7 12h10"/></svg>
            Select Channel
          </div>
          <div class="channelGrid">
            <div 
              v-for="gateway in gatewayList" 
              :key="gateway"
              :class="['channelCard', { active: selectedGateway === gateway }]"
              @click="selectedGateway = gateway"
            >
              <div class="channelName">{{ GATEWAY_LABELS[gateway] || gateway.toUpperCase() }}</div>
              <div class="channelRange">{{ GATEWAY_RANGES[gateway] || '200 - 50K' }}</div>
              <div v-if="selectedGateway === gateway" class="checkIcon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <button class="actionBtn" :disabled="loading || !amount || amount < 200" @click="handleRecharge">
          <span v-if="loading" class="btnLoader"></span>
          <span v-else>Recharge Now</span>
        </button>

        <div class="footerSummary">
           <span>Order ID: {{ (Math.random() * 1000000000).toFixed(0) }}</span>
           <router-link to="/rechargeHistory" class="historyLink">Recharge History</router-link>
        </div>
      </div>
    </div>

    <!-- Notification Dialog -->
    <div v-if="dialog.open" class="dialogOverlay" @click="dialog.open = false">
      <div class="dialogCard" @click.stop>
        <div class="dialogHeader">
          <span class="dialogTitle">Notice</span>
        </div>
        <p class="dialogBody">{{ dialog.body }}</p>
        <button @click="dialog.open = false" class="confirmBtn">OK</button>
      </div>
    </div>

    <!-- Loader -->
    <div v-if="loading" class="pageLoader">
       <div class="spinner"></div>
       <p>Initiating Request...</p>
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
const quickAmounts = [200, 500, 1000, 2000, 5000, 10000]
const loading = ref(false)
const userBalance = ref(0)
const selectedGateway = ref('watchpay')
const gatewayList = ref(['auto', 'manual', 'lgpay', 'watchpay', 'rupeerush'])
const dialog = reactive({ open: false, body: '' })

const GATEWAY_LABELS = {
  auto: "Auto QR",
  manual: "Manual UPI",
  lgpay: "LG Pay",
  watchpay: "Watch Pay",
  rupeerush: "Rupee Rush",
}
const GATEWAY_RANGES = {
  auto: "100 - 50k",
  manual: "200 - 1L",
  lgpay: "200 - 50k",
  watchpay: "200 - 50k",
  rupeerush: "200 - 50k",
}

async function fetchData() {
    if (!auth.user?.id) return
    try {
        const res = await walletApi.getUserHome(auth.user.id)
        if (res.data) {
            userBalance.value = res.data.balance || 0
        }
    } catch (err) {}
}

async function handleRecharge() {
    if (!amount.value || amount.value < 200) {
        dialog.body = "Minimum ₹200 required"
        dialog.open = true
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
            // Placeholder for other gateways
            dialog.body = `${selectedGateway.value.toUpperCase()} gateway is under maintenance. Please use WatchPay or LGPay.`
            dialog.open = true
            loading.value = false
            return
        }

        if (res.data?.payment_url || res.data?.payUrl || res.data?.url) {
            window.location.href = res.data.payment_url || res.data.payUrl || res.data.url
        } else {
            throw new Error("Payment link not found")
        }
    } catch (err) {
        dialog.body = err.response?.data?.error || err.message || "Recharge failed"
        dialog.open = true
    }
    loading.value = false
}

onMounted(() => {
    fetchData()
    walletApi.getCurrentGateway().then(res => {
        if (res.data?.gateway) selectedGateway.value = res.data.gateway.toLowerCase()
        if (res.data?.gatewayList) gatewayList.value = res.data.gatewayList
    }).catch(() => {})
})
</script>

<style scoped>
.deposit-page {
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
}

.header {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background: #05c0b8;
  color: #fff;
}
.backIcon { cursor: pointer; }
.headerTitle { flex: 1; text-align: center; font-weight: 600; font-size: 17px; }
.spacer { width: 24px; }

.balanceSection {
  padding: 30px 20px;
  text-align: center;
  background: #fff;
  border-bottom: 8px solid #F1F5F9;
}
.balanceLabel { font-size: 13px; color: #64748B; margin-bottom: 8px; font-weight: 600; }
.balanceValue { font-size: 2rem; font-weight: 800; color: #05c0b8; }

.tabContent { padding: 20px; }

.sectionTitle { display: flex; align-items: center; gap: 8px; font-weight: 700; color: #1e293b; margin-bottom: 12px; font-size: 15px; }
.sectionIcon { margin-bottom: -2px; }

.inputSection { margin-bottom: 16px; }
.inputGroup {
  display: flex;
  align-items: center;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 0 16px;
  min-height: 52px;
}
.currency { font-weight: 800; color: #05c0b8; margin-right: 12px; font-size: 20px; }
.inputGroup input {
  flex: 1;
  border: none;
  background: none;
  padding: 14px 0;
  font-size: 18px;
  outline: none;
  font-weight: 700;
  color: #0F172A;
}
.clearBtn { background: none; border: none; font-size: 20px; color: #94A3B8; cursor: pointer; padding: 4px; }

.amountGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 24px;
}
.amtBtn {
  padding: 12px 4px;
  border-radius: 10px;
  border: 1px solid #E2E8F0;
  background: #fff;
  font-weight: 600;
  color: #64748B;
  cursor: pointer;
  font-size: 14px;
}
.amtBtn.active {
  background: #05c0b8;
  color: #fff;
  border-color: #05c0b8;
}

.channelSection { margin-bottom: 30px; }
.channelGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.channelCard {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 12px;
  position: relative;
  cursor: pointer;
}
.channelCard.active {
  background: rgba(5, 192, 184, 0.05);
  border-color: #05c0b8;
}
.channelName { font-weight: 700; font-size: 14px; color: #1e293b; margin-bottom: 4px; }
.channelRange { font-size: 11px; color: #64748B; font-weight: 500; }
.checkIcon {
  position: absolute; top: -6px; right: -6px;
  background: #05c0b8; border-radius: 50%;
  width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;
}

.actionBtn {
  width: 100%;
  padding: 16px;
  background: #05c0b8;
  color: #fff;
  border: none;
  border-radius: 14px;
  font-weight: 700;
  font-size: 17px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(5, 192, 184, 0.3);
}
.actionBtn:disabled { background: #E2E8F0; color: #94A3B8; cursor: not-allowed; box-shadow: none; }

.footerSummary {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 24px; font-size: 12px; color: #94A3B8; font-weight: 500;
}
.historyLink { color: #05c0b8; text-decoration: none; font-weight: 600; font-size: 14px; }

/* Dialog */
.dialogOverlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.dialogCard {
  background: #fff; padding: 24px; border-radius: 20px; width: 90%; max-width: 360px;
  text-align: center;
}
.dialogTitle { font-weight: 700; font-size: 18px; color: #0F172A; }
.dialogBody { font-size: 14px; color: #475569; line-height: 1.5; margin: 16px 0 24px; }
.confirmBtn {
    width: 100%; padding: 12px; background: #05c0b8; color: #fff;
    border: none; border-radius: 10px; font-weight: 700; cursor: pointer;
}

.pageLoader {
  position: fixed; inset: 0; background: rgba(0,0,0,0.7);
  display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 1000; color: #fff;
}
.spinner { width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.3); border-top: 3px solid #fff; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 12px; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
