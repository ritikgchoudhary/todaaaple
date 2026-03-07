<template>
  <div class="page">
    <div class="mobileContainer">
      <header class="header">
        <svg @click="router.push('/account')" class="backIcon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        <div class="headerTitle">Red Envelope</div>
      </header>

      <div class="redEnvelopeCard">
        <div class="decorativeCircle"></div>
        <svg class="emailIcon" xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>

        <template v-if="result && !result.expired">
          <div class="circle" @click="amount === 0 ? handleClaim() : null">
            <span v-if="amount !== 0" class="amountText">₹{{ amount.toFixed(2) }}</span>
            <span v-else class="claimText">OPEN</span>
          </div>
          <div class="statusMain">
            {{ amount !== 0 ? 'Congratulations!' : 'Tap to open' }}
          </div>
        </template>
        
        <template v-else-if="result && result.expired">
          <div class="statusText">FINISHED</div>
          <div class="subStatusText">I'm sorry you're late!</div>
        </template>
      </div>

      <!-- Loading Dialog -->
      <div v-if="loader" class="loaderOverlay">
        <div class="loaderBox">
          <div class="spinner"></div>
          <span class="loaderText">Please Wait!</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { validateEnvelop, claimEnvelop } from '../api/envelope'

const router = useRouter()
const route = useRoute()

const result = ref(null)
const amount = ref(0)
const loader = ref(false)

onMounted(async () => {
  loader.value = true
  const loggedInUserStr = localStorage.getItem('user')
  if (!loggedInUserStr) {
    router.push('/login')
    return
  }
  const foundUser = JSON.parse(loggedInUserStr)

  try {
    const envelopeId = route.params.id
    const response = await validateEnvelop(envelopeId, foundUser.result.id)
    result.value = response.data
  } catch (err) {
    console.log(err)
  } finally {
    loader.value = false
  }
})

const handleClaim = async () => {
  loader.value = true
  const loggedInUserStr = localStorage.getItem('user')
  const foundUser = JSON.parse(loggedInUserStr)

  try {
    const envelopeId = route.params.id
    const response = await claimEnvelop(envelopeId, foundUser.result.id)
    amount.value = response.data.amount
  } catch (err) {
    console.log(err)
  } finally {
    loader.value = false
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #F1F5F9;
  display: flex;
  justify-content: center;
  font-family: "Roboto", "Helvetica", "Arial", sans-serif;
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

.redEnvelopeCard {
  background-color: #d64040;
  border-radius: 20px;
  padding: 40px 20px;
  margin: 40px 20px;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(214, 64, 64, 0.3);
  position: relative;
  overflow: hidden;
}

.decorativeCircle {
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background-color: rgba(255,255,255,0.1);
  top: -150px;
  left: -50px;
}

.emailIcon {
  margin-bottom: 20px;
  opacity: 0.8;
  z-index: 1;
}

.circle {
  width: 120px;
  height: 120px;
  background-color: #ffd700;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
  transition: transform 0.2s;
  margin-bottom: 20px;
  z-index: 1;
}

.circle:active {
  transform: scale(0.95);
}

.claimText {
  color: #d64040;
  font-weight: bold;
  font-size: 24px;
}

.amountText {
  color: #d64040;
  font-weight: bold;
  font-size: 28px;
}

.statusMain {
  font-size: 18px;
  font-weight: 500;
  z-index: 1;
}

.statusText {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
  z-index: 1;
}

.subStatusText {
  font-size: 16px;
  opacity: 0.9;
  z-index: 1;
}

/* Dialog & Overlays */
.loaderOverlay {
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
</style>
