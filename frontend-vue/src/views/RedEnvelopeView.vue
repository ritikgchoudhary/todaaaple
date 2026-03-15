<template>
  <div class="page">
    <div class="mobileContainer">
      <header class="header">
        <svg @click="router.back()" class="backIcon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        <div class="headerTitle">Red Envelope</div>
      </header>

      <div class="contentWrapper">
        <form @submit.prevent="handleSubmit">
          <div class="inputGroup">
            <label class="inputLabel">Type</label>
            <select v-model="formData.type" class="customInput">
              <option value="Fixed amount">Fixed Amount</option>
              <option value="Lucky Draw">Lucky Draw</option>
            </select>
          </div>

          <div class="inputGroup">
            <label class="inputLabel">Total Bonus Amount</label>
            <input type="number" v-model="formData.amount" class="customInput" required />
          </div>

          <div class="inputGroup">
            <label class="inputLabel">Number of Envelopes</label>
            <input type="number" v-model="formData.qty" class="customInput" required />
          </div>

          <div class="inputGroup">
            <label class="inputLabel">OTP</label>
            <div class="otpContainer">
              <input type="number" v-model="formData.code" class="customInput otpInput" required />
              <button type="button" class="otpBtn" @click="sendOTP" :disabled="canRun && counter > 0">
                {{ canRun && counter > 0 ? counter : 'OTP' }}
              </button>
            </div>
          </div>

          <button type="submit" class="actionBtn">Create Envelope</button>
          
          <button type="button" class="historyBtn" @click="router.push('/redEnvelopeHistory')">
            Historical Records
          </button>
        </form>
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { createEnvelop, sendOTPEnv } from '../api/envelope'
import API from '../api/client'

const router = useRouter()

const formData = ref({ amount: 0, type: 'Fixed amount', qty: 0, code: '' })
const user = ref(null)
const loader = ref(false)
const dialog = ref({ open: false, body: '' })

const canRun = ref(false)
const counter = ref(90)
let timer = null

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
  } catch (e) {
    // Interceptor in client.js will handle 401 redirect
  }
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const sendOTP = async () => {
  if (!user.value?.phone) return
  counter.value = 90
  canRun.value = true
  
  timer = setInterval(() => {
    counter.value--
    if (counter.value <= 0) {
      clearInterval(timer)
      canRun.value = false
    }
  }, 1000)

  try {
    await sendOTPEnv({ phone: user.value.phone })
  } catch (e) {
    console.error("Error sending OTP")
  }
}

const handleSubmit = async () => {
  loader.value = true
  const loggedInUserStr = localStorage.getItem('user')
  const foundUser = JSON.parse(loggedInUserStr)

  try {
    const payload = {
      ...formData.value,
      userId: foundUser.result.id,
      auth: `Bearer ${foundUser.token}`
    }
    await createEnvelop(payload)
    loader.value = false
    router.push('/redEnvelopeHistory')
  } catch (err) {
    loader.value = false
    dialog.value = { open: true, body: err.response?.data?.error || "Error creating envelope" }
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

.contentWrapper {
  padding: 20px;
}

.inputGroup {
  margin-bottom: 20px;
}
.inputLabel {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}
.customInput {
  width: 100%;
  padding: 15px 12px;
  background-color: #f5f5f5;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  color: black;
  box-sizing: border-box;
}
.customInput:focus {
  outline: 1px solid #05c0b8;
}

.otpContainer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.otpInput {
  flex: 1;
}
.otpBtn {
  background-color: #05c0b8;
  color: white;
  margin-left: 10px;
  height: 48px;
  min-width: 80px;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
}
.otpBtn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.actionBtn {
  width: 100%;
  height: 50px;
  border-radius: 25px;
  background-color: #05c0b8;
  color: white;
  font-size: 16px;
  font-weight: bold;
  border: none;
  margin-top: 20px;
  cursor: pointer;
}
.historyBtn {
  width: 100%;
  height: 50px;
  border-radius: 25px;
  background-color: #757575;
  color: white;
  font-size: 16px;
  font-weight: bold;
  border: none;
  margin-top: 15px;
  cursor: pointer;
}

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
  background-color: rgba(0,0,0,0.7);
  width: 100px; height: 100px;
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
  border-radius: 12px;
  text-align: center;
  width: 80%;
  max-width: 300px;
}
.dialogMessage { color: black; margin-bottom: 15px; }
.dialogBtn {
  background-color: #05c0b8;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
}
</style>
