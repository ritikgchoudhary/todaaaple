<template>
  <div class="page">
    <div class="mobileContainer">
      <header class="header">
        <svg @click="router.back()" class="backIcon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        <div class="headerTitle">Full Promotion Record</div>
      </header>

      <div class="contentWrapper">
        <p class="subtitle">Get full details of your total invites including today.</p>

        <div class="levelGrid">
          <button v-for="(_, index) in 7" :key="index"
                  @click="level = index"
                  :class="['levelBtn', level === index ? 'levelBtnActive' : 'levelBtnInactive']"
                  :style="index === 0 ? 'grid-column: 1 / -1;' : ''">
            Level {{ index + 1 }}
          </button>
        </div>

        <div class="tableContainer">
          <table class="customTable">
            <thead>
              <tr>
                <th>Phone</th>
                <th>Total<br/>Recharge</th>
                <th>Total<br/>Withdr</th>
                <th>Live<br/>Bal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="phone in currentLevelPhones" :key="phone">
                <td>{{ phone }}</td>
                <td class="text-green">₹{{ getLevelData(phone, 'totalRecharge') }}</td>
                <td class="text-red">₹{{ getLevelData(phone, 'totalWithdrawal') }}</td>
                <td>
                  <div v-if="liveBalance[phone] !== undefined" class="font-bold">
                    ₹{{ liveBalance[phone].toFixed(2) }}
                  </div>
                  <button v-else class="checkBtn" @click="fetchLiveBalance(phone)">Check</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Loading Dialog -->
      <div v-if="loader" class="loaderOverlay">
        <div class="loaderBox">
          <div class="spinner"></div>
          <span class="loaderText">Loading...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getPromotionFull, getPromotionLiveBalance } from '../api/promotion'

const router = useRouter()
const levelData = ref({})
const liveBalance = ref({})
const loader = ref(false)
const level = ref(0)

onMounted(async () => {
  loader.value = true
  const loggedInUserStr = localStorage.getItem('user')
  if (!loggedInUserStr) {
    router.push('/login')
    return
  }

  const foundUser = JSON.parse(loggedInUserStr)
  try {
    const response = await getPromotionFull(foundUser.result.id)
    levelData.value = response.data
  } catch (error) {
    router.push('/login')
  } finally {
    loader.value = false
  }
})

const currentLevelPhones = computed(() => {
  const current = levelData.value[`level${level.value}`]
  return current ? Object.keys(current) : []
})

const getLevelData = (phone, field) => {
  return levelData.value[`level${level.value}`]?.[phone]?.[field] || 0
}

const fetchLiveBalance = async (phone) => {
  const loggedInUserStr = localStorage.getItem('user')
  const foundUser = JSON.parse(loggedInUserStr)
  try {
    const response = await getPromotionLiveBalance(foundUser.result.id, phone)
    liveBalance.value = { ...liveBalance.value, [response.data.phone]: response.data.amount }
  } catch (error) {
    console.log(error)
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

.subtitle {
  color: #666;
  text-align: center;
  margin-bottom: 15px;
  font-size: 14px;
}

.levelGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 20px;
}

.levelBtn {
  border: 1px solid #05c0b8;
  border-radius: 8px;
  padding: 8px;
  font-size: 13px;
  cursor: pointer;
  background: transparent;
  color: #05c0b8;
}

.levelBtnActive {
  background-color: #05c0b8;
  color: white;
}

.tableContainer {
  border-radius: 10px;
  border: 1px solid #eee;
  overflow: hidden;
}

.customTable {
  width: 100%;
  border-collapse: collapse;
}

.customTable th {
  background-color: #f5f5f5;
  font-size: 11px;
  font-weight: bold;
  padding: 8px;
  text-align: center;
  border-bottom: 1px solid #eee;
  color: black;
}

.customTable td {
  font-size: 11px;
  padding: 8px;
  text-align: center;
  border-bottom: 1px solid #eee;
  color: #333;
}

.text-green { color: green; }
.text-red { color: red; }
.font-bold { font-weight: bold; }

.checkBtn {
  background-color: #05c0b8;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 2px 8px;
  font-size: 10px;
  cursor: pointer;
}

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
  background-color: rgba(0, 0, 0, 0.8);
  padding: 20px;
  border-radius: 15px;
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

.loaderText { color: white; font-size: 13px; margin-top: 15px; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
