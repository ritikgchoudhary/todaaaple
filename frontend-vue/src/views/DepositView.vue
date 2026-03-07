<template>
  <div class="deposit-page">
    <div class="mobileContainer">
      <!-- Header -->
      <header class="header">
        <button type="button" class="backBtn" @click="router.back()">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h1 class="pageTitle">Deposit</h1>
        <div class="headerSpacer"></div>
      </header>

      <!-- Balance Card -->
      <div class="balanceCard">
        <div class="balanceLabel">Current Balance</div>
        <div class="balanceAmount">₹ {{ (userBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }) }}</div>
        <div class="balanceDecoration"></div>
      </div>

      <!-- Deposit Section -->
      <section class="depositFormSection">
        <div class="sectionTitle">Select Amount</div>
        <div class="amountGrid">
          <button 
            v-for="amt in quickAmounts" 
            :key="amt" 
            :class="['amountChip', { active: amount === amt }]"
            @click="amount = amt"
          >
            ₹ {{ amt }}
          </button>
        </div>

        <div class="customAmount">
          <div class="inputGroup">
            <span class="currencySymbol">₹</span>
            <input 
              v-model.number="amount" 
              type="number" 
              placeholder="Enter amount" 
              class="amountInput"
              min="100"
            />
          </div>
          <p class="minDepositHint">Min deposit: ₹ 500, Max deposit: ₹ 100,000</p>
        </div>

        <!-- Payment Methods -->
        <div class="paymentMethods">
          <div class="sectionTitle">Payment Gateway</div>
          <div class="gatewayList">
            <div 
              v-for="gateway in availableGateways" 
              :key="gateway.id"
              :class="['gatewayItem', { active: selectedGateway === gateway.id }]"
              @click="selectedGateway = gateway.id"
            >
              <div class="gatewayInfo">
                <div class="gatewayIcon">
                  <img v-if="gateway.icon" :src="gateway.icon" alt="gateway" />
                  <span v-else>{{ gateway.name.charAt(0) }}</span>
                </div>
                <div class="gatewayName">{{ gateway.name }}</div>
              </div>
              <div class="radio"></div>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="submitSection">
          <button 
            class="btnDeposit" 
            :disabled="isLoading || !amount || amount < 500"
            @click="handleDeposit"
          >
            <span v-if="!isLoading">DEPOSIT NOW</span>
            <span v-else class="loader"></span>
          </button>
        </div>

        <!-- Instructions -->
        <div class="instructions">
          <h3>Instructions:</h3>
          <ul>
            <li>Enter the amount you wish to deposit.</li>
            <li>Select your preferred payment gateway.</li>
            <li>Complete the payment on the redirected page.</li>
            <li>Balance will be updated automatically after successful payment.</li>
          </ul>
        </div>
      </section>
    </div>

    <!-- Toast Notification (Simple) -->
    <Transition name="fade">
      <div v-if="toast.show" :class="['toast', toast.type]">
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import * as walletApi from '../api/wallet'

const router = useRouter()
const auth = useAuthStore()

const amount = ref(500)
const quickAmounts = [500, 1000, 2000, 5000, 10000, 50000]
const userBalance = ref(0)
const isLoading = ref(false)
const selectedGateway = ref('watchpay')
const availableGateways = ref([
  { id: 'watchpay', name: 'WatchPay (UPI/Bank)', icon: 'https://img.bzvm68.com/site_common/H5_7_mobile/game_logo/4-GP9W.png' },
  { id: 'rupeerush', name: 'RupeeRush', icon: 'https://img.bzvm68.com/site_common/H5_7_mobile/game_logo/4-GPLS.png' },
  { id: 'lgpay', name: 'LGPay', icon: 'https://img.bzvm68.com/site_common/H5_7_mobile/game_logo/4-GPOW-en_US.png' }
])

const toast = ref({
  show: false,
  message: '',
  type: 'success'
})

function showToast(msg, type = 'success') {
  toast.value = { show: true, message: msg, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

async function fetchBalance() {
  if (!auth.user?.id) return
  try {
    const res = await walletApi.getUserHome(auth.user.id)
    if (res.data?.balance) {
      userBalance.value = parseFloat(res.data.balance)
    }
  } catch (err) {
    console.error('Fetch balance error', err)
  }
}

async function handleDeposit() {
  if (amount.value < 500) {
    showToast('Min deposit is ₹ 500', 'error')
    return
  }

  isLoading.value = true
  try {
    const payload = {
      amount: amount.value,
      customer_name: auth.user?.name || 'User',
      customer_email: auth.user?.email || `user${auth.user?.id}@example.com`,
      customer_mobile: auth.user?.phone || ''
    }

    let response
    if (selectedGateway.value === 'watchpay') {
      response = await walletApi.watchPayCreateOrder(auth.user.id, payload)
    } else if (selectedGateway.value === 'rupeerush') {
      response = await walletApi.rupeeRushCreateOrder(auth.user.id, payload)
    } else if (selectedGateway.value === 'lgpay') {
      response = await walletApi.lgPayCreateOrder(auth.user.id, payload)
    }

    if (response?.data?.url) {
      window.location.href = response.data.url
    } else if (response?.data?.payUrl) {
       window.location.href = response.data.payUrl
    } else {
      showToast('Could not initiate payment. Try again.', 'error')
    }
  } catch (err) {
    const msg = err.response?.data?.error || 'Payment failed'
    showToast(msg, 'error')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchBalance()
  // Try to get current gateway from backend if possible
  walletApi.getCurrentGateway().then(res => {
    if (res.data?.gateway) {
      const g = res.data.gateway.toLowerCase()
      if (availableGateways.value.some(item => item.id === g)) {
        selectedGateway.value = g
      }
    }
  }).catch(() => {})
})
</script>

<style scoped>
.deposit-page {
  min-height: 100vh;
  background: #f5f5f5;
  color: #1a1a1a;
}

.mobileContainer {
  width: 100%;
  max-width: min(430px, 100vw);
  margin: 0 auto;
  min-height: 100vh;
  padding: 0 0 90px;
  background: #fff;
  box-sizing: border-box;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.backBtn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #1a1a1a;
  display: flex;
  align-items: center;
}
.pageTitle {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #1a1a1a;
}
.headerSpacer { width: 32px; }

/* Balance Card */
.balanceCard {
  margin: 16px;
  padding: 24px;
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  border-radius: 16px;
  color: #fff;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}
.balanceLabel {
  font-size: 0.85rem;
  opacity: 0.9;
  margin-bottom: 8px;
}
.balanceAmount {
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.5px;
}
.balanceDecoration {
  position: absolute;
  right: -20px;
  bottom: -20px;
  width: 100px;
  height: 100px;
  background: rgba(255,255,255,0.1);
  border-radius: 50%;
  pointer-events: none;
}

/* Form Sections */
.depositFormSection {
  padding: 0 16px;
}
.sectionTitle {
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: #334155;
  display: flex;
  align-items: center;
}

.amountGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}
.amountChip {
  padding: 12px 8px;
  border: 1px solid #e2e8f0;
  background: #fff;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}
.amountChip.active {
  background: #eff6ff;
  border-color: #2563eb;
  color: #2563eb;
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.1);
}

.customAmount {
  margin-bottom: 24px;
}
.inputGroup {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 0 16px;
  transition: border-color 0.2s;
}
.inputGroup:focus-within {
  border-color: #2563eb;
}
.currencySymbol {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2563eb;
  margin-right: 8px;
}
.amountInput {
  flex: 1;
  border: none;
  background: none;
  padding: 16px 0;
  font-size: 1.25rem;
  font-weight: 700;
  outline: none;
  color: #1e293b;
}
.minDepositHint {
  font-size: 0.75rem;
  color: #ef4444;
  margin-top: 6px;
  margin-left: 4px;
}

/* Payment Methods */
.paymentMethods {
  margin-bottom: 24px;
}
.gatewayList {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.gatewayItem {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.gatewayItem.active {
  border-color: #2563eb;
  background: #eff6ff;
}
.gatewayInfo {
  display: flex;
  align-items: center;
  gap: 12px;
}
.gatewayIcon {
  width: 40px;
  height: 40px;
  background: #f1f5f9;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.gatewayIcon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.gatewayIcon span {
  font-weight: 700;
  color: #64748b;
}
.gatewayName {
  font-size: 0.9rem;
  font-weight: 600;
  color: #334155;
}
.radio {
  width: 20px;
  height: 20px;
  border: 2px solid #cbd5e1;
  border-radius: 50%;
  position: relative;
}
.gatewayItem.active .radio {
  border-color: #2563eb;
}
.gatewayItem.active .radio::after {
  content: '';
  position: absolute;
  inset: 3px;
  background: #2563eb;
  border-radius: 50%;
}

/* Submit */
.btnDeposit {
  width: 100%;
  padding: 16px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}
.btnDeposit:disabled {
  background: #94a3b8;
  box-shadow: none;
  cursor: not-allowed;
}
.btnDeposit:active:not(:disabled) {
  transform: translateY(1px);
}

/* Instructions */
.instructions {
  margin-top: 32px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border-left: 4px solid #f59e0b;
}
.instructions h3 {
  margin: 0 0 10px;
  font-size: 0.9rem;
  color: #1e293b;
}
.instructions ul {
  margin: 0;
  padding-left: 18px;
  color: #64748b;
  font-size: 0.8rem;
}
.instructions li {
  margin-bottom: 6px;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 30px;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.toast.success { background: #10b981; }
.toast.error { background: #ef4444; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s, transform 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translate(-50%, 10px); }

/* Loader */
.loader {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
  display: inline-block;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
