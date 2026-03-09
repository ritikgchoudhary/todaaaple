<template>
  <div class="bank-page">
    <div class="mobileContainer">
      <!-- Loading Overlay -->
      <div v-if="loading" class="loaderOverlay">
        <div class="loaderBox">
          <div class="spinner"></div>
          <span class="loaderText">Processing...</span>
        </div>
      </div>

      <!-- Header -->
      <header class="header">
        <svg @click="router.back()" class="backIcon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        <div class="headerTitle">My Bank Card</div>
      </header>

      <div class="content">
        <!-- Bank Card Display -->
        <div v-if="bankData" class="bankCard">
          <div class="cardTitle">Linked Bank Account</div>
          <div class="ownerName">{{ bankData.name }}</div>
          <div class="accNumber">{{ bankData.account }}</div>
          <div class="ifscText">IFSC: {{ bankData.ifsc }}</div>
        </div>

        <button v-if="!isEdit" @click="isEdit = true" class="editBtn">
          {{ bankData ? "+ Edit Bank Details" : "+ Add Bank Account" }}
        </button>

        <!-- Edit Form -->
        <form v-if="isEdit" @submit.prevent="handleSubmit" class="formSection">
          <div class="formTitle">Enter Bank Details</div>

          <div class="inputGroup">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#05c0b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <input v-model="formData.name" placeholder="Actual Name" required />
          </div>

          <div class="inputGroup">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#05c0b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <input v-model="formData.phone" type="number" placeholder="Mobile Number" required />
          </div>

          <div class="inputGroup">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#05c0b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <input v-model="formData.ifsc" placeholder="IFSC Code" required />
          </div>

          <div class="inputGroup">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#05c0b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10h18"/><path d="M7 15h1v1H7z"/><path d="M11 15h1v1h-1z"/><path d="M3 5h18"/><rect x="3" y="5" width="18" height="14" rx="2"/></svg>
            <input v-model="formData.account" type="number" placeholder="Account Number" required />
          </div>

          <div class="inputGroup">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#05c0b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10h18"/><path d="M7 15h1v1H7z"/><path d="M11 15h1v1h-1z"/><path d="M3 5h18"/><rect x="3" y="5" width="18" height="14" rx="2"/></svg>
            <input v-model="formData.confirm" type="number" placeholder="Confirm Account Number" required />
          </div>

          <div class="inputGroup">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#05c0b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <input v-model="formData.state" placeholder="State" required />
          </div>

          <div class="inputGroup">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#05c0b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <input v-model="formData.city" placeholder="City" required />
          </div>

          <div class="inputGroup">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#05c0b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <input v-model="formData.address" placeholder="Address" required />
          </div>

          <div class="inputGroup">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#05c0b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <input v-model="formData.email" type="email" placeholder="Email" required />
          </div>

          <div class="inputGroup">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#05c0b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            <input v-model="formData.upi" placeholder="UPI ID" required />
          </div>

          <button type="submit" class="actionBtn">Update Bank Details</button>
        </form>
      </div>

      <!-- OTP Dialog Placeholder -->
      <div v-if="showOtp" class="dialogOverlay">
        <div class="otpBox">
          <h3>Security Verification</h3>
          <input v-model="otpCode" type="number" placeholder="Enter OTP" />
          <button @click="submitOtp" class="actionBtn">Verify & Save</button>
          <button @click="showOtp = false" class="cancelBtn">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import * as walletApi from '../api/wallet'

const router = useRouter()
const auth = useAuthStore()
const loading = ref(true)
const bankData = ref(null)
const isEdit = ref(false)
const showOtp = ref(false)
const otpCode = ref('')

const formData = ref({
  name: '',
  phone: '',
  ifsc: '',
  account: '',
  confirm: '',
  state: '',
  city: '',
  address: '',
  email: '',
  upi: ''
})

async function fetchBankData() {
  if (!auth.user?.id) return
  try {
    const res = await walletApi.getUserHome(auth.user.id)
    if (res.data?.bank?.[0]) {
      bankData.value = res.data.bank[0]
      // Prefill form
      Object.assign(formData.value, bankData.value)
      formData.value.confirm = bankData.value.account
    }
  } catch (err) {}
  loading.value = false
}

function handleSubmit() {
  if (formData.value.account !== formData.value.confirm) {
    alert('Account numbers do not match')
    return
  }
  showOtp.value = true
}

function submitOtp() {
  alert('Verification logic would go here. Saving mock data.')
  bankData.value = { ...formData.value }
  isEdit.value = false
  showOtp.value = false
}

onMounted(() => {
  fetchBankData()
})
</script>

<style scoped>
.bank-page { min-height: 100vh; background-color: #F1F5F9; display: flex; justify-content: center; font-family: system-ui, -apple-system, sans-serif; }
.mobileContainer { width: 100%; max-width: min(430px, 100vw); min-height: 100vh; background-color: #fff; position: relative; }

.header { background-color: #05c0b8; padding: 15px 20px; display: flex; align-items: center; position: sticky; top: 0; z-index: 100; }
.backIcon { cursor: pointer; color: white; }
.headerTitle { color: white; flex-grow: 1; text-align: center; font-weight: 600; font-size: 16px; margin-right: 20px; }

.content { padding: 20px; }

.bankCard { background: linear-gradient(135deg, #05c0b8 0%, #039dc4 100%); color: white; padding: 20px; border-radius: 15px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(5, 192, 184, 0.4); }
.cardTitle { font-size: 16px; font-weight: bold; margin-bottom: 8px; opacity: 0.9; }
.ownerName { font-size: 14px; margin-bottom: 5px; }
.accNumber { font-size: 1.3rem; letter-spacing: 2px; margin: 10px 0; font-weight: bold; }
.ifscText { font-size: 12px; opacity: 0.8; }

.editBtn { width: 100%; padding: 16px; border: 2px dashed #05c0b8; color: #05c0b8; border-radius: 12px; background: rgba(5,192,184,0.05); font-weight: bold; cursor: pointer; transition: background 0.2s; }
.editBtn:active { background: rgba(5,192,184,0.15); }

.formSection { background: #f9f9f9; padding: 20px; border-radius: 12px; margin-top: 20px; }
.formTitle { font-size: 14px; font-weight: bold; color: #666; margin-bottom: 15px; }

.inputGroup { display: flex; align-items: center; background: white; border-radius: 8px; padding: 10px 15px; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.inputGroup svg { margin-right: 12px; }
.inputGroup input { border: none; outline: none; flex: 1; font-size: 14px; color: #333; }

.actionBtn { width: 100%; height: 50px; background: #05c0b8; color: white; border: none; border-radius: 25px; font-weight: bold; font-size: 16px; cursor: pointer; margin-top: 20px; }
.actionBtn:active { opacity: 0.8; }

.dialogOverlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.otpBox { background: white; padding: 24px; border-radius: 12px; width: 85%; max-width: 320px; text-align: center; }
.otpBox h3 { margin-bottom: 20px; font-size: 16px; }
.otpBox input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 20px; text-align: center; font-size: 1.2rem; letter-spacing: 4px; }
.cancelBtn { background: none; border: none; color: #666; margin-top: 10px; cursor: pointer; }

/* Loader */
.loaderOverlay { position: absolute; inset: 0; background: rgba(255,255,255,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.loaderBox { background: rgba(0,0,0,0.8); width: 100px; height: 100px; border-radius: 12px; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; }
.spinner { width: 30px; height: 30px; border: 3px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
.loaderText { font-size: 11px; margin-top: 10px; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
