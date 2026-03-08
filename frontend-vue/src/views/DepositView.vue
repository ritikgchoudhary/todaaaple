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
          
          <div class="methodItem" @click="dialog.open = true; dialog.body = 'USDT channel is coming soon!'">
            <div class="methodIconBox">
               <div style="width:28px;height:28px;border-radius:50%;background:#26a17b;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:18px;">₮</div>
            </div>
            <span class="methodName">USDT</span>
          </div>
          <div class="methodItem" @click="dialog.open = true; dialog.body = 'ARPay channel is coming soon!'">
            <div class="methodIconBox">
               <div style="position:relative;">
                 <div style="font-size:24px;font-weight:900;color:#fde047;">A</div>
                 <div style="position:absolute;top:-8px;right:-18px;background:#ef4444;color:white;font-size:8px;padding:2px 4px;border-radius:4px;">+2%</div>
               </div>
            </div>
            <span class="methodName">ARPay</span>
          </div>
        </div>

        <!-- Selected Channel Details -->
        <div class="channelSection">
          <div class="sectionHeader">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f0c27b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            <span>Select channel</span>
          </div>
          <div class="channelBoxes">
            <div class="channelBox" v-for="gateway in gatewayList" :key="gateway" :class="{ active: selectedGateway === gateway }" @click="selectedGateway = gateway" v-show="selectedGateway === gateway || gatewayList.length === 1">
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
  background-color: #121212;
  display: flex;
  justify-content: center;
  font-family: system-ui, -apple-system, sans-serif;
  color: white;
}
.mobileContainer {
  width: 100%;
  max-width: 500px;
  background-color: #121212;
  min-height: 100vh;
  position: relative;
  padding-bottom: 140px; /* space for action bar + nav */
}

/* Header */
.header {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background: #1a1a1a;
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
}
.backIcon { cursor: pointer; }
.headerTitle { flex: 1; text-align: center; font-weight: 600; font-size: 17px; }
.headerRightText { font-size: 13px; color: #05c0b8; text-decoration: none; font-weight: 500; }

.mainContent {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Balance Card */
.balanceCard {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 16px;
  padding: 20px;
  color: white;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);
}
.bcTop {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}
.bcLabel {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}
.bcBalRow {
  display: flex;
  align-items: center;
  gap: 8px;
}
.bcBal {
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
}
.bcRefreshBtn {
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.bcBottom {
  display: flex;
  align-items: center;
  gap: 12px;
}
.bcDots {
  font-family: monospace;
  font-size: 18px;
  letter-spacing: 2px;
  opacity: 0.8;
}

/* Method Grid */
.methodGrid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.methodItem {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.methodIconBox {
  width: 56px;
  height: 56px;
  background: #1a1a1a;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
  transition: all 0.2s;
}
.methodItem.active .methodIconBox {
  border-color: #fdb05d;
  background: rgba(253, 176, 93, 0.1);
}
.methodImg {
  width: 28px;
  height: 28px;
  object-fit: contain;
}
.methodName {
  font-size: 12px;
  color: #a3a3a3;
  text-align: center;
}
.methodItem.active .methodName {
  color: #fff;
  font-weight: 600;
}

/* Sections */
.sectionHeader {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 16px;
  font-size: 15px;
}

/* Channel Section */
.channelSection {
  background: #1a1a1a;
  padding: 16px;
  border-radius: 12px;
}
.channelBoxes {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.channelBox {
  background: #2a2a2a;
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: none;
}
.channelBox.active {
  background: linear-gradient(180deg, #ffd180 0%, #fdb05d 100%);
  color: #1a1a1a;
  display: block;
}
.cbName { font-weight: 700; font-size: 15px; margin-bottom: 4px; }
.cbRange { font-size: 12px; opacity: 0.8; }

/* Amount Section */
.amountSection {
  background: #1a1a1a;
  padding: 16px;
  border-radius: 12px;
}
.amountGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}
.amtBtn {
  background: #2a2a2a;
  border: 1px solid #333;
  color: #a3a3a3;
  padding: 12px 0;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.amtBtn .rs { font-weight: normal; margin-right: 2px; }
.amtBtn.active {
  background: linear-gradient(180deg, #ffd180 0%, #fdb05d 100%);
  color: #1a1a1a;
  border-color: transparent;
}
.inputGroup {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 8px;
  padding: 0 16px;
  min-height: 48px;
}
.currency { font-weight: 800; color: #05c0b8; margin-right: 12px; font-size: 18px; }
.inputGroup input {
  flex: 1;
  border: none;
  background: none;
  padding: 12px 0;
  font-size: 16px;
  outline: none;
  font-weight: 600;
  color: #1a1a1a;
}
.clearBtn { background: none; border: none; font-size: 20px; color: #94A3B8; cursor: pointer; padding: 4px; }

/* Bottom Action Bar */
.bottomActionBar {
  position: fixed;
  bottom: 60px; /* Above BottomNav */
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 500px;
  background: #1a1a1a;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -4px 12px rgba(0,0,0,0.2);
  z-index: 20;
}
@media screen and (max-width: 500px) {
  .bottomActionBar {
    bottom: calc(60px + env(safe-area-inset-bottom, 0px));
  }
}
.baLeft {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.baLabel {
  font-size: 12px;
  color: #a3a3a3;
}
.baMethod {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}
.actionBtn {
  padding: 12px 24px;
  background: linear-gradient(180deg, #ffd180 0%, #fdb05d 100%);
  color: #1a1a1a;
  border: none;
  border-radius: 24px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  min-width: 140px;
  box-shadow: 0 4px 12px rgba(253, 176, 93, 0.3);
}
.actionBtn:disabled { background: #333; color: #666; cursor: not-allowed; box-shadow: none; }

/* Dialog */
.dialogOverlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.7);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.dialogCard {
  background: #1a1a1a; padding: 24px; border-radius: 20px; width: 90%; max-width: 360px;
  text-align: center; color: white;
}
.dialogTitle { font-weight: 700; font-size: 18px; color: #f0c27b; }
.dialogBody { font-size: 14px; color: #a3a3a3; line-height: 1.5; margin: 16px 0 24px; }
.confirmBtn {
    width: 100%; padding: 12px; background: linear-gradient(180deg, #ffd180 0%, #fdb05d 100%); color: #1a1a1a;
    border: none; border-radius: 10px; font-weight: 700; cursor: pointer;
}

.pageLoader {
  position: fixed; inset: 0; background: rgba(0,0,0,0.7);
  display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 1000; color: #f0c27b;
}
.spinner { width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.3); border-top: 3px solid #f0c27b; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 12px; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
