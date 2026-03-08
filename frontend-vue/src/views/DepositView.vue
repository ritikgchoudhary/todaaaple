<template>
  <div class="deposit-page">
    <div class="header">
      <div class="header-left" @click="router.back()">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </div>
      <h1 class="header-title">Deposit</h1>
      <router-link to="/rechargeHistory" class="header-right">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
      </router-link>
    </div>

    <div class="mobile-container">
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
        </div>
        <div class="card-footer">
          <div class="user-id">ID: {{ auth.user?.id || '----' }}</div>
          <div class="secure-tag">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>Verified Secure</span>
          </div>
        </div>
      </div>

      <!-- Payment Methods -->
      <div class="section-title">Select Payment Method</div>
      <div class="methods-grid">
        <div 
          v-for="gateway in gatewayList" 
          :key="gateway" 
          class="method-item" 
          :class="{ 'active': selectedGateway === gateway }"
          @click="selectedGateway = gateway"
        >
          <div class="item-inner">
            <div class="icon-wrap">
              <img v-if="gateway === 'rupeerush'" src="https://img.bzvm68.com/site_common/payment/upi_qr.png" alt="UPI" />
              <img v-else-if="gateway === 'lgpay'" src="https://img.bzvm68.com/site_common/payment/upi_qr.png" alt="UPI" style="filter: hue-rotate(45deg);"/>
              <img v-else-if="gateway === 'watchpay'" src="https://img.bzvm68.com/site_common/payment/upi_qr.png" alt="UPI" />
              <img v-else-if="gateway === 'manual'" src="https://img.bzvm68.com/site_common/payment/paytm.png" alt="Paytm" />
              <img v-else-if="gateway === 'auto'" src="https://img.bzvm68.com/site_common/payment/upi_qr.png" alt="PhonePe" style="filter: hue-rotate(-45deg);"/>
              <div v-else class="fallback-icon">₹</div>
            </div>
            <span class="name">{{ GATEWAY_LABELS[gateway] || gateway }}</span>
            <div class="check-mark" v-if="selectedGateway === gateway">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          </div>
        </div>
        
        <!-- USDT Placeholder -->
        <div class="method-item disabled" @click="showToast('USDT coming soon!')">
          <div class="item-inner">
            <div class="icon-wrap usdt">₮</div>
            <span class="name">USDT</span>
          </div>
        </div>
      </div>

      <!-- Amount Section -->
      <div class="section-title">Deposit Amount</div>
      <div class="amount-card glass-card">
        <div class="input-container">
          <span class="prefix">₹</span>
          <input 
            type="number" 
            v-model.number="amount" 
            placeholder="Min. 200" 
            @focus="focused = true" 
            @blur="focused = false"
            class="amount-input"
          />
          <button v-if="amount" class="clear-btn" @click="amount = null">×</button>
        </div>

        <div class="chips-container">
          <button 
            v-for="val in [100, 500, 1000, 2000, 5000, 10000, 20000, 50000]" 
            :key="val" 
            class="chip"
            :class="{ 'active': amount === val }"
            @click="amount = val"
          >
            ₹{{ val >= 1000 ? (val/1000) + 'K' : val }}
          </button>
        </div>
      </div>

      <!-- Quick Details / Instructions -->
      <div class="details-section">
        <div class="details-card">
          <h3>Payment Instructions</h3>
          <ul class="instruction-list">
            <li>
              <span class="num">1</span>
              <p>Select your preferred UPI or QR payment method above.</p>
            </li>
            <li>
              <span class="num">2</span>
              <p>Enter the amount (Minimum <b>₹200</b> for successful processing).</p>
            </li>
            <li>
              <span class="num">3</span>
              <p>Complete the transaction on the payment page. Keep the UTR/Reference number ready if required.</p>
            </li>
            <li>
              <span class="num">4</span>
              <p>Balance usually reflects within <b>1 to 5 minutes</b> after successful payment.</p>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Fixed Action Footer -->
    <div class="action-footer">
      <div class="footer-inner">
        <div class="selection-summary">
          <div class="summary-label">Recharging via</div>
          <div class="summary-value">{{ GATEWAY_LABELS[selectedGateway] || 'Select Method' }}</div>
        </div>
        <button class="deposit-btn" :disabled="loading || !amount || amount < 200" @click="handleRecharge">
          <span v-if="loading" class="spinner"></span>
          <span v-else>Confirm Deposit ₹{{ (amount || 0).toLocaleString() }}</span>
        </button>
      </div>
    </div>

    <!-- Notification Dialog -->
    <div v-if="dialog.open" class="modal-overlay" @click="dialog.open = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <div class="modal-icon">!</div>
          <h3>Notification</h3>
        </div>
        <div class="modal-body">{{ dialog.body }}</div>
        <button class="modal-btn" @click="dialog.open = false">Got it</button>
      </div>
    </div>

    <!-- Full Page Loader -->
    <div v-if="loading" class="global-loader">
      <div class="loader-content">
        <div class="loader-circle"></div>
        <div class="loader-text">Securing Payment...</div>
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
const loading = ref(false)
const fetching = ref(false)
const userBalance = ref(0)
const focused = ref(false)
const selectedGateway = ref('watchpay')
const gatewayList = ref(['watchpay', 'lgpay', 'rupeerush', 'auto', 'manual'])
const dialog = reactive({ open: false, body: '' })

const GATEWAY_LABELS = {
  auto: "Phonepe QR",
  manual: "Paytm Direct",
  lgpay: "UPI Fast QR",
  watchpay: "WatchPay UPI",
  rupeerush: "Express UPI",
}

async function fetchData() {
    if (!auth.user?.id) return
    fetching.value = true
    try {
        const res = await walletApi.getUserHome(auth.user.id)
        if (res.data && res.data.length > 0) {
            userBalance.value = res.data[0].balance || 0
        }
    } catch (err) {
        console.error('Balance fetch failed')
    } finally {
        setTimeout(() => fetching.value = false, 800)
    }
}

function showToast(msg) {
    dialog.body = msg
    dialog.open = true
}

async function handleRecharge() {
    if (!amount.value || amount.value < 200) {
        showToast("Minimum recharge amount is ₹200")
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
            showToast(`${GATEWAY_LABELS[selectedGateway.value] || selectedGateway.value} is currently under maintenance. Please try another method.`)
            loading.value = false
            return
        }

        if (res.data?.payment_url || res.data?.payUrl || res.data?.url) {
            window.location.href = res.data.payment_url || res.data.payUrl || res.data.url
        } else {
            throw new Error("No payment URL received from gateway")
        }
    } catch (err) {
        showToast(err.response?.data?.error || err.message || "Failed to initiate deposit. Please try again.")
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchData()
    walletApi.getCurrentGateway().then(res => {
        if (res.data?.gateway) selectedGateway.value = res.data.gateway.toLowerCase()
        if (res.data?.gatewayList && Array.isArray(res.data.gatewayList)) {
            // Priority ordering
            const preferred = ['watchpay', 'lgpay', 'rupeerush', 'auto', 'manual']
            gatewayList.value = res.data.gatewayList.sort((a, b) => {
              return preferred.indexOf(a) - preferred.indexOf(b)
            })
        }
    }).catch(() => {})
})
</script>

<style scoped>
.deposit-page {
  min-height: 100vh;
  background-color: #0c0d10;
  color: #e2e8f0;
  font-family: 'Inter', -apple-system, sans-serif;
  padding-bottom: 120px;
}

/* Header */
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 64px;
  background: rgba(12, 13, 16, 0.85);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.header-left {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d1d5db;
  cursor: pointer;
}

.header-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.header-right {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d9a05b; /* Gold accent */
  text-decoration: none;
}

.mobile-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 24px 20px;
}

/* Glass Card Global */
.glass-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  overflow: hidden;
  position: relative;
}

/* Balance Card */
.balance-card {
  padding: 24px;
  background: linear-gradient(145deg, rgba(217, 160, 91, 0.1) 0%, rgba(12, 13, 16, 0.05) 100%);
  border-color: rgba(217, 160, 91, 0.2);
  margin-bottom: 32px;
}

.card-glow {
  position: absolute;
  top: -20px; right: -20px;
  width: 100px; height: 100px;
  background: radial-gradient(circle, rgba(217, 160, 91, 0.15) 0%, transparent 70%);
  filter: blur(20px);
}

.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.refresh-btn {
  background: none; border: none; color: #d9a05b; cursor: pointer;
  padding: 4px; border-radius: 50%; display: flex;
  transition: all 0.3s;
}
.refresh-btn.spinning { transform: rotate(360deg); opacity: 0.5; }

.amount-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.currency {
  font-size: 1.5rem;
  font-weight: 800;
  color: #d9a05b;
}

.amount {
  font-size: 2.25rem;
  font-weight: 900;
  color: #fff;
  letter-spacing: -0.02em;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 16px;
}

.user-id { font-size: 0.75rem; color: #64748b; font-weight: 600; }

.secure-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  padding: 4px 8px;
  border-radius: 20px;
}

/* Sections */
.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 16px;
  padding-left: 4px;
}

/* Methods Grid */
.methods-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 32px;
}

.method-item {
  cursor: pointer;
}

.item-inner {
  position: relative;
  background: #1a1c23;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.method-item.active .item-inner {
  background: rgba(217, 160, 91, 0.08);
  border-color: #d9a05b;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(217, 160, 91, 0.15);
}

.icon-wrap {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-wrap img { width: 32px; height: 32px; object-fit: contain; }

.icon-wrap.usdt { font-size: 1.5rem; color: #26a17b; font-weight: 900; }

.item-inner .name {
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  text-align: center;
  transition: color 0.2s;
}

.method-item.active .name { color: #fff; }

.check-mark {
  position: absolute; top: -6px; right: -6px;
  width: 20px; height: 20px;
  background: #d9a05b;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #fff;
  border: 2px solid #1a1c23;
}

.method-item.disabled { opacity: 0.4; cursor: not-allowed; }

/* Amount Card */
.amount-card {
  padding: 24px;
  margin-bottom: 32px;
}

.input-container {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0 16px;
  margin-bottom: 20px;
  transition: border-color 0.2s;
}

.input-container:focus-within { border-color: #d9a05b; }

.prefix { font-size: 1.5rem; font-weight: 800; color: #d9a05b; margin-right: 12px; }

.amount-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: #fff;
  font-size: 1.25rem;
  font-weight: 800;
  padding: 16px 0;
}

.amount-input::-webkit-inner-spin-button { -webkit-appearance: none; }

.clear-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none; color: #94a3b8;
  width: 24px; height: 24px; border-radius: 50%;
  font-size: 1rem; cursor: pointer;
}

.chips-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.chip {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 10px 4px;
  color: #94a3b8;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.chip.active {
  background: rgba(217, 160, 91, 0.1);
  border-color: #d9a05b;
  color: #d9a05b;
}

/* Instructions */
.details-card {
  background: rgba(217, 160, 91, 0.03);
  border: 1px dashed rgba(217, 160, 91, 0.2);
  border-radius: 16px;
  padding: 20px;
}

.details-card h3 {
  font-size: 0.95rem;
  font-weight: 800;
  color: #d9a05b;
  margin: 0 0 16px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.instruction-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 14px; }

.instruction-list li { display: flex; gap: 12px; align-items: flex-start; }

.num {
  width: 20px; height: 20px;
  background: rgba(217, 160, 91, 0.2);
  color: #d9a05b;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.7rem; font-weight: 900; flex-shrink: 0;
  margin-top: 2px;
}

.instruction-list p {
  margin: 0; font-size: 0.85rem; color: #94a3b8; line-height: 1.4;
}

.instruction-list b { color: #f1f5f9; font-weight: 700; }

/* Action Footer */
.action-footer {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  z-index: 100;
  padding: 16px 20px calc(16px + env(safe-area-inset-bottom));
  background: #0c0d10;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.5);
}

.footer-inner {
  max-width: 460px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.selection-summary { flex: 1; }
.summary-label { font-size: 0.7rem; color: #64748b; font-weight: 600; text-transform: uppercase; }
.summary-value { font-size: 0.9rem; color: #fff; font-weight: 800; }

.deposit-btn {
  flex: 2;
  height: 54px;
  background: linear-gradient(180deg, #d9a05b 0%, #a67332 100%);
  border: none; border-radius: 12px;
  color: #fff; font-size: 1rem; font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(217, 160, 91, 0.25);
  transition: all 0.2s;
  display: flex; align-items: center; justify-content: center;
}

.deposit-btn:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; filter: grayscale(1); }
.deposit-btn:active:not(:disabled) { transform: translateY(2px); box-shadow: none; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; z-index: 2000;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex; align-items: center; justify-content: center; padding: 24px;
}

.modal-content {
  background: #1a1c23;
  width: 100%; max-width: 320px;
  border-radius: 24px;
  padding: 32px 24px;
  text-align: center;
  border: 1px solid rgba(217, 160, 91, 0.3);
}

.modal-header { margin-bottom: 20px; }
.modal-icon {
  width: 40px; height: 40px; background: rgba(217, 160, 91, 0.2);
  color: #d9a05b; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  margin: 0 auto 12px; font-weight: 900; font-size: 1.5rem;
}
.modal-header h3 { font-size: 1.25rem; margin: 0; color: #fff; }

.modal-body { font-size: 0.95rem; color: #94a3b8; line-height: 1.5; margin-bottom: 32px; }

.modal-btn {
  width: 100%; height: 48px;
  background: #d9a05b; color: #fff; border: none; border-radius: 12px;
  font-weight: 800; cursor: pointer;
}

/* Loader */
.global-loader {
  position: fixed; inset: 0; z-index: 3000;
  background: #0c0d10;
  display: flex; align-items: center; justify-content: center;
}

.loader-content { text-align: center; }
.loader-circle {
  width: 48px; height: 48px;
  border: 3px solid rgba(217, 160, 91, 0.1);
  border-top-color: #d9a05b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

.loader-text { font-size: 0.9rem; font-weight: 700; color: #d9a05b; letter-spacing: 0.1em; text-transform: uppercase; }

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 350px) {
  .details-card { padding: 12px; }
  .amount { font-size: 1.75rem; }
  .methods-grid { grid-template-columns: repeat(2, 1fr); }
  .chips-container { grid-template-columns: repeat(3, 1fr); }
}
</style>
