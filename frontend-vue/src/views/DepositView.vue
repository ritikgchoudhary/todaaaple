<template>
  <div class="deposit-page">
    <div class="mobileContainer">
      <!-- Header -->
      <header class="header">
        <svg @click="router.back()" class="backIcon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f0c27b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        <div class="headerTitle">Deposit</div>
        <router-link to="/rechargeHistory" class="headerRightText">Deposit history</router-link>
      </header>

      <div class="mainContent">
        <!-- Balance Card (Dark gradient style) -->
        <div class="balanceCard">
          <div class="bcTop">
            <div class="bcLabel">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>
              <span>Balance</span>
            </div>
            <div class="bcBalRow">
              <div class="bcBal">₹{{ (userBalance || 0).toFixed(2) }}</div>
              <button class="bcRefreshBtn" @click="fetchBalance" title="Refresh">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              </button>
            </div>
          </div>
          <div class="bcBottom">
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
             <div class="bcDots">**** &nbsp;&nbsp;&nbsp; ****</div>
          </div>
        </div>

        <!-- Payment Method Grid -->
        <div class="methodGrid">
          <div class="methodItem" v-for="gateway in gatewayList" :key="gateway" :class="{ active: selectedGateway === gateway }" @click="selectedGateway = gateway">
            <div class="methodIconBox">
              <img v-if="gateway === 'rupeerush'" src="https://img.bzvm68.com/site_common/payment/upi_qr.png" alt="UPI" class="methodImg"/>
              <img v-else-if="gateway === 'lgpay'" src="https://img.bzvm68.com/site_common/payment/upi_qr.png" alt="UPI" class="methodImg" style="filter: grayscale(1);"/>
              <img v-else-if="gateway === 'watchpay'" src="https://img.bzvm68.com/site_common/payment/upi_qr.png" alt="UPI" class="methodImg" style="filter: grayscale(1);"/>
              <img v-else-if="gateway === 'manual'" src="https://img.bzvm68.com/site_common/payment/paytm.png" alt="Paytm" class="methodImg" />
              <img v-else-if="gateway === 'auto'" src="https://img.bzvm68.com/site_common/payment/upi_qr.png" alt="PhonePe" class="methodImg" style="filter: sepia(1);"/>
              <div v-else style="width:28px;height:28px;border-radius:50%;background:#26a17b;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:18px;">₮</div>
            </div>
            <span class="methodName">{{ GATEWAY_LABELS[gateway] || gateway }}</span>
          </div>
        </div>

        <!-- Selected Channel Details -->
        <div class="channelSection">
          <div class="sectionHeader">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f0c27b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            <span>Select channel</span>
          </div>
          <div class="channelBoxes">
            <div class="channelBox active" v-for="gateway in gatewayList" :key="gateway" @click="selectedGateway = gateway" v-show="selectedGateway === gateway || gatewayList.length === 1">
               <div class="cbName">{{ GATEWAY_LABELS[gateway] || gateway }}</div>
               <div class="cbRange">Balance:{{ GATEWAY_RANGES[gateway] || '100 - 50K' }}</div>
            </div>
          </div>
        </div>

        <!-- Deposit Amount Section -->
        <div class="amountSection">
           <div class="sectionHeader">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f0c27b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12h.01"/></svg>
             <span>Deposit amount</span>
           </div>
           
           <div class="amountGrid">
              <button 
                v-for="amt in [100, 200, 300, 400, 500, '1K', '2K', '3K', '5K']" 
                :key="amt" 
                :class="['amtBtn', { active: amount === (typeof amt === 'string' ? parseInt(amt)*1000 : amt) }]"
                @click="amount = (typeof amt === 'string' ? parseInt(amt)*1000 : amt)"
              >
                <span class="rs">₹</span> {{ amt }}
              </button>
           </div>

           <div class="inputGroup">
             <span class="currency">₹</span>
             <input v-model.number="amount" type="number" placeholder="Please enter the amount" />
             <button v-if="amount" @click="amount = null" class="clearBtn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
             </button>
           </div>
        </div>
      </div>
      
      <!-- Bottom Fixed Action Bar -->
      <div class="bottomActionBar">
         <div class="baLeft">
            <div class="baLabel">Recharge Method:</div>
            <div class="baMethod">{{ GATEWAY_LABELS[selectedGateway] || selectedGateway || 'None' }}</div>
         </div>
         <button class="actionBtn" :disabled="loading || !amount || amount < 100" @click="handleRecharge">
            <span v-if="loading" class="btnLoader"></span>
            <span v-else>Deposit ₹{{ (amount || 0).toFixed(2) }}</span>
         </button>
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
  auto: "Phonepe_QR",
  manual: "PAYTM",
  lgpay: "Innate UPI-QR",
  watchpay: "UPI-QR PAY",
  rupeerush: "UPI-QR",
}
const GATEWAY_RANGES = {
  auto: "100 - 50k",
  manual: "100 - 50k",
  lgpay: "100 - 50k",
  watchpay: "100 - 50k",
  rupeerush: "100 - 50k",
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
