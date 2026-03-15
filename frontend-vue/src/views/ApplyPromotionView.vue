<template>
  <div class="page">
    <div class="mobileContainer">
      <header class="header">
        <svg @click="router.back()" class="backIcon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        <div class="headerTitle">Apply to Balance</div>
      </header>

      <div class="balanceCard">
        <div class="balanceLabel">My Bonus</div>
        <div class="balanceValue">₹ {{ user?.bonus ?? '...' }}</div>
        <div class="balanceLimit">Min: ₹10 | Max: ₹200,000</div>
      </div>

      <div class="formSection">
        <div class="inputLabel">Apply Amount</div>
        <div class="inputGroup">
          <span class="currencySymbol">₹</span>
          <input type="number" v-model="amount" class="customInput" placeholder="Enter Amount" />
        </div>

        <button @click="handleSubmit" class="submitBtn">Submit Application</button>
        <button @click="router.push('/applyrecord')" class="recordsBtn">View Records</button>

        <div class="serviceTimes">
          <div class="serviceTitle">Service Time</div>
          <div class="infoText">Monday - Friday: 10:00 - 17:00</div>
          <div class="infoText italicText mt-10">Limit: 1 time per day for Apply Bonus to Balance!</div>
        </div>
      </div>

      <!-- Loading Dialog -->
      <div v-if="loader" class="loaderOverlay">
        <div class="loaderBox">
          <div class="spinner"></div>
          <span class="loaderText">Please Wait!</span>
        </div>
      </div>

      <!-- Message Dialog -->
      <div v-if="dialog.open" class="dialogOverlay" @click="dialog.open = false">
        <div class="dialogContent" @click.stop>
          <div class="dialogMessage">{{ dialog.body }}</div>
          <button class="dialogBtn" @click="dialog.open = false">OK</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { applyBonus } from '../api/promotion'
import API from '../api/client'

const router = useRouter()

const user = ref(null)
const amount = ref('')
const loader = ref(false)
const dialog = ref({ open: false, body: '' })

onMounted(async () => {
  const loggedInUserStr = localStorage.getItem('user')
  if (!loggedInUserStr) {
    router.push('/login')
    return
  }

  const foundUser = JSON.parse(loggedInUserStr)
  try {
    const response = await API.get(`/getUser/${foundUser.result.id}`)
    user.value = response.data[0]
  } catch (error) {
    // Interceptor in client.js will handle 401 redirect
  }
})

const handleSubmit = async () => {
  if (!amount.value || amount.value <= 0) {
    dialog.value = { open: true, body: 'Please enter a valid amount' }
    return
  }

  loader.value = true
  const loggedInUserStr = localStorage.getItem('user')
  const foundUser = JSON.parse(loggedInUserStr)

  const payload = {
    amount: amount.value,
    userId: foundUser.result.id,
    auth: `Bearer ${foundUser.token}`
  }

  try {
    await applyBonus(payload)
    loader.value = false
    router.push('/mypromotion')
  } catch (error) {
    loader.value = false
    dialog.value = { open: true, body: error.response?.data?.error || 'Something went wrong' }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #F1F5F9;
  display: flex;
  justify-content: center;
  font-family: var(--font-app);
  padding-bottom: calc(60px + env(safe-area-inset-bottom));
}

.mobileContainer {
  width: 100%;
  max-width: min(430px, 100vw);
  min-height: 100vh;
  background-color: #fff;
  position: relative;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: #05c0b8;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.backIcon {
  cursor: pointer;
  width: 20px;
  height: 20px;
}

.headerTitle {
  color: white;
  flex-grow: 1;
  text-align: center;
  font-weight: 600;
  margin-right: 20px;
  font-size: 16px;
}

.balanceCard {
  background-color: #05c0b8;
  margin: 20px;
  border-radius: 15px;
  padding: 20px;
  color: white;
  text-align: center;
}
.balanceLabel { font-size: 14px; opacity: 0.9; }
.balanceValue { font-size: 32px; font-weight: bold; margin: 10px 0; }
.balanceLimit { font-size: 11px; opacity: 0.8; }

.formSection {
  padding: 0 20px;
}

.inputLabel {
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}

.inputGroup {
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 5px;
  padding-left: 10px;
  margin-bottom: 20px;
}
.currencySymbol {
  font-weight: bold;
  margin-right: 10px;
  color: #333;
}
.customInput {
  flex: 1;
  padding: 15px;
  border: none;
  background: transparent;
  font-size: 16px;
}
.customInput:focus {
  outline: none;
}

.submitBtn {
  background-color: #05c0b8;
  color: white;
  width: 100%;
  padding: 12px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  border: none;
  margin-top: 10px;
  cursor: pointer;
}
.recordsBtn {
  background-color: #e0e0e0;
  color: #333;
  width: 100%;
  padding: 12px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  border: none;
  margin-top: 15px;
  cursor: pointer;
}

.serviceTimes {
  margin-top: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 10px;
}
.serviceTitle {
  font-weight: bold;
  margin-bottom: 10px;
  color: #05c0b8;
}
.infoText {
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}
.italicText { font-style: italic; }
.mt-10 { margin-top: 10px; }

/* Dialog & Overlays */
.loaderOverlay, .dialogOverlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.loaderBox {
  background-color: rgba(0,0,0,0.8);
  padding: 20px;
  border-radius: 10px;
  display: flex; flex-direction: column;
  justify-content: center; align-items: center;
}
.spinner {
  width: 30px; height: 30px;
  border: 3px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}
.loaderText { color: white; font-size: 12px; margin-top: 10px; }
@keyframes spin { to { transform: rotate(360deg); } }

.dialogContent {
  background: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  width: 80%;
  max-width: 250px;
}
.dialogMessage { color: black; margin-bottom: 15px; }
.dialogBtn {
  background-color: transparent;
  color: #05c0b8;
  border: none;
  width: 100%;
  padding: 8px;
  font-weight: bold;
  cursor: pointer;
}
</style>
