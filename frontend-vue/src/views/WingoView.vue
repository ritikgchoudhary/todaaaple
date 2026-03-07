<template>
  <div class="wingo-page">
    <div class="wingo-container">
      <!-- Winning Dialog -->
      <div v-if="winningDialog.show" class="modal-overlay">
        <div class="winning-card">
          <div class="winning-header">
            <img :src="'/images/winBadge.png'" alt="Win Badge" class="badge-img" />
          </div>
          <div class="winning-content">
            <h2 class="congrats-text">Congratulations</h2>
            <p class="game-info">Wingo {{ gameType }} Minute Period - {{ winningDialog.period }}</p>
            <p class="result-text">Result - {{ winningDialog.color }}</p>
            <h3 class="winning-amount">+{{ winningDialog.amount }}</h3>
            <p class="winning-label">Total Winning</p>
            <button @click="winningDialog.show = false" class="close-win-btn">Close</button>
          </div>
        </div>
      </div>

      <!-- Warning/Alert Dialog -->
      <div v-if="alertDialog.show" class="modal-overlay" @click="alertDialog.show = false">
        <div class="alert-box">
          <p>{{ alertDialog.message }}</p>
        </div>
      </div>

      <!-- Rules Dialog -->
      <div v-if="rulesDialog.show" class="modal-overlay" @click.self="rulesDialog.show = false">
        <div class="rules-box">
          <div class="rules-header">Rules of guess:</div>
          <div class="rules-content">
            <p>{{ gameType }} minutes 1 issue, 2 minutes and 30 seconds to order, 30 seconds to show the lottery result. It opens all day. The total number of trade is 480 issues.</p>
            <p>If you spend 100 rupees to trade, after deducting 2 rupees service fee, your contract amount is 98 rupees:</p>
            <p>1. JOIN GREEN: if the result shows 1,3,7,9, you will get (98*2) 196 rupees; If the result shows 5, you will get (98*1.5) 147rupees.</p>
            <p>2. JOIN RED: if the result shows 2,4,6,8, you will get (98*2) 196 rupees; If the result shows 0, you will get (98*1.5) 147 rupees.</p>
            <p>3. JOIN VIOLET: if the result shows 0 or 5, you will get (98*4.5) 441 rupees.</p>
            <p>4. SELECT NUMBER: if the result is the same as the number you selected, you will get (98*9) 882 rupees.</p>
          </div>
          <button @click="rulesDialog.show = false" class="rules-ok-btn">OK</button>
        </div>
      </div>

      <!-- Presale Rules Dialog -->
      <div v-if="presaleDialog.show" class="modal-overlay">
        <div class="rules-box presale-box">
          <div class="rules-header">Presale management rule</div>
          <div class="rules-content">
            <p style="color: red">Please confirm you are not from one of below states:</p>
            <p>Andhra Pradesh, Bihar, Chhattisgarh, Gujarat, Haryana, Himachal Pradesh, Jammu and Kashmir, Jharkhand, Karnataka, Odisha, Rajasthan, Tamil Nadu, Tripura, Telangana, Uttar Pradesh, Uttarakhand</p>
            <p style="color: red">Presale management rule</p>
            <p>1.1 Presale definition: refers to a sales model in which a merchant provides a product or service plan...</p>
            <p>Note: I have carefully read all contents and agree to continue with my own risk.</p>
          </div>
          <button @click="confirmPresale" class="rules-ok-btn">Confirm</button>
        </div>
      </div>

      <!-- Top Balance Header -->
      <header class="wingo-header">
        <div class="header-left">
          <div class="header-label">Available Balance</div>
          <div class="header-balance">₹ {{ auth.user?.balance?.toFixed(2) || '0.00' }}</div>
          <div class="header-uid">UID: {{ auth.user?.uid || '...' }}</div>
        </div>
        <div class="header-right">
          <div class="header-icon-btn" @click="rulesDialog.show = true" title="Rules">
            <img :src="'/images/rule.png'" height="18" />
          </div>
          <router-link to="/deposit" class="header-icon-btn recharge-btn">
            <img :src="'/images/recharge.png'" height="20" />
            <span>Recharge</span>
          </router-link>
        </div>
      </header>

      <!-- Minute Tabs -->
      <div class="minute-tabs">
        <button class="tab-item" :class="{ active: gameId === '1' }" @click="router.push('/wingo/1')">
          <div class="tab-icon"><img :src="'/images/timer1.png'" height="20" /></div>
          <span>1 Min</span>
        </button>
        <button class="tab-item" :class="{ active: gameId === '3' }" @click="router.push('/wingo/3')">
          <div class="tab-icon"><img :src="'/images/timer1.png'" height="20" /></div>
          <span>3 Min</span>
        </button>
        <button class="tab-item" :class="{ active: gameId === '5' }" @click="router.push('/wingo/5')">
          <div class="tab-icon"><img :src="'/images/timer1.png'" height="20" /></div>
          <span>5 Min</span>
        </button>
      </div>

      <!-- Period & Countdown -->
      <div class="period-row">
        <div class="period-info">
          <div class="label">Period</div>
          <div class="value">{{ currentPeriod }}</div>
        </div>
        <div class="timer-info">
          <div class="label" align="center">Count Down</div>
          <div class="timer-boxes">
            <span class="t-box">0</span>
            <span class="t-box">{{ timerMin }}</span>
            <span class="t-sep">:</span>
            <span class="t-box wide">{{ timerSec < 10 ? '0' + timerSec : timerSec }}</span>
          </div>
        </div>
      </div>

      <!-- Main Betting Buttons -->
      <section class="bet-buttons-row">
        <button @click="openBetDrawer('#28c04c', 'Join Green')" :disabled="!canOpen" class="btn-green" :class="{ disabled: !canOpen }">Join Green</button>
        <button @click="openBetDrawer('#f84350', 'Join Red')" :disabled="!canOpen" class="btn-red" :class="{ disabled: !canOpen }">Join Red</button>
        <button @click="openBetDrawer('#8c6ceb', 'Join Violet')" :disabled="!canOpen" class="btn-violet" :class="{ disabled: !canOpen }">Join Violet</button>
      </section>

      <!-- Number Grid -->
      <section class="number-grid-container">
        <div v-for="n in numbers" :key="n.val" 
             @click="canOpen && openBetDrawer('', 'Select ' + n.val, n.color)"
             class="num-circle"
             :class="{ disabled: !canOpen }"
             :style="{ background: !canOpen ? '#dbdbdb' : n.color }">
          {{ n.val }}
        </div>
      </section>

      <!-- Big/Small Buttons -->
      <section class="bet-buttons-row big-small">
        <button @click="openBetDrawer('#2196f3', 'Big')" :disabled="!canOpen" class="btn-big" :class="{ disabled: !canOpen }">Big</button>
        <button @click="openBetDrawer('orange', 'Small')" :disabled="!canOpen" class="btn-small" :class="{ disabled: !canOpen }">Small</button>
      </section>

      <!-- Records Section -->
      <section class="records-container">
        <div class="section-header">
          <span style="color: #333">{{ gameType }} Minutes Record</span>
          <span class="more-link" @click="router.push('/wingo-record/' + gameId)">more ›</span>
        </div>
        <div class="record-table-wrapper">
          <table class="record-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Price</th>
                <th>Number</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in records" :key="row.id">
                <td>{{ row.id }}</td>
                <td>{{ row.price }}</td>
                <td :class="row.number >= 5 ? 'text-green' : 'text-red'">
                  {{ row.number }} {{ row.number >= 5 ? 'Big' : 'Small' }}
                </td>
                <td>
                  <div class="color-dots">
                    <span v-for="c in parseColors(row.color)" :key="c" class="dot" :style="{ backgroundColor: getDotColor(c) }"></span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Bid History Section -->
      <section class="records-container bid-history-container">
        <div class="section-header">
          <span style="color: #333">{{ gameType }} Minutes Bid History</span>
          <span class="more-link" @click="router.push('/wingo-history/' + gameId)">more ›</span>
        </div>
        <div class="bid-list">
          <div v-if="!myHistory || myHistory.length === 0" class="no-records">No Records</div>
          <div v-for="(bid, idx) in myHistory" :key="idx" class="bid-card">
            <div class="bid-card-top">
              <div>
                <div class="bid-amt">₹{{ bid.amount }}</div>
                <div class="bid-note">CONTRACTMONEY</div>
              </div>
              <div class="bid-date">{{ new Date(bid.date).toLocaleString() }}</div>
            </div>
            <div class="bid-card-details">
              <div class="detail-row">
                <span class="lbl">Period:</span> <span class="val">{{ bid.period }}</span>
                <span class="lbl">Select:</span> <span class="val" :style="{ color: getSelectColor(bid.select) }">{{ bid.select }}</span>
              </div>
              <div class="detail-row">
                <span class="lbl">Status:</span> <span class="val" :class="bid.status.toLowerCase()">{{ bid.status }}</span>
                <span class="lbl">Winning:</span> <span class="val" :class="{ success: bid.winning > 0, red: bid.winning === 0 }">{{ bid.winning }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Bet Drawer -->
      <Transition name="slide-up">
        <div v-if="drawer.show" class="drawer-overlay" @click.self="drawer.show = false">
          <div class="drawer-content">
            <div class="drawer-header" :style="{ backgroundColor: drawer.color || '#0d9488' }">
              {{ drawer.title }}
            </div>
            <div class="drawer-body">
              <div class="drawer-row">
                <div class="c-label">Contract Money</div>
                <div class="c-options">
                  <button v-for="v in [1, 10, 500, 1000]" :key="v" 
                          @click="drawer.selectedBase = v"
                          :class="{ active: drawer.selectedBase === v }">{{ v }}</button>
                </div>
              </div>
              <div class="drawer-row">
                <div class="c-label">Number</div>
                <div class="c-options">
                  <button v-for="v in [3, 5, 10]" :key="v" 
                          @click="drawer.multiplier = v"
                          :class="{ active: drawer.multiplier === v }">{{ v }}</button>
                </div>
              </div>
              <div class="amount-entry">
                <span class="curr-symbol">₹</span>
                <input type="number" v-model.number="drawer.totalAmount" class="amount-field" />
              </div>
              <div class="qty-control">
                <button @click="drawer.multiplier = Math.max(1, drawer.multiplier - 1)">-</button>
                <span class="qty-val">{{ drawer.multiplier }}</span>
                <button @click="drawer.multiplier++">+</button>
              </div>
              <div class="agreement-row">
                <label>
                  <input type="checkbox" v-model="drawer.agreed" />
                  I agree the <span @click="presaleDialog.show = true" class="link-text">Presale management rule</span>
                </label>
              </div>
              <div class="total-summary">
                Amount: ₹{{ drawer.totalAmount }}
              </div>
              <div class="drawer-buttons">
                <button @click="drawer.show = false" class="cancel-btn">Cancel</button>
                <button @click="handleConfirmBet" class="confirm-btn" :style="{ backgroundColor: drawer.color || '#0d9488' }" :disabled="isSubmitting">
                  {{ isSubmitting ? 'Processing...' : 'Confirm' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Loader -->
      <div v-if="isLoading" class="modal-overlay">
        <div class="loader-content">
          <div class="loading-spinner"></div>
          <p>Please Wait!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUiStore } from '../stores/ui'
import * as wingoApi from '../api/wingo'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()

const gameId = computed(() => route.params.id || '1')
const gameType = computed(() => gameId.value)
const isSubmitting = ref(false)
const isLoading = ref(false)

const currentPeriod = ref('...')
const timerTotal = ref(0)
const timerMin = computed(() => Math.floor(timerTotal.value / 60))
const timerSec = computed(() => Math.floor(timerTotal.value % 60))

const records = ref([])
const myHistory = ref([])
const canOpen = ref(true)

const winningDialog = ref({ show: false, period: '', color: '', amount: '0.00' })
const rulesDialog = ref({ show: false })
const presaleDialog = ref({ show: false })
const alertDialog = ref({ show: false, message: '' })

const drawer = ref({
  show: false,
  color: '',
  title: '',
  selectedBase: 10,
  multiplier: 1,
  totalAmount: 10,
  agreed: true
})

const numbers = [
  { val: 0, color: 'linear-gradient(180deg, #f84350, #8c6ceb)' },
  { val: 1, color: '#28c04c' },
  { val: 2, color: '#f84350' },
  { val: 3, color: '#28c04c' },
  { val: 4, color: '#f84350' },
  { val: 5, color: 'linear-gradient(180deg, #28c04c, #8c6ceb)' },
  { val: 6, color: '#f84350' },
  { val: 7, color: '#28c04c' },
  { val: 8, color: '#f84350' },
  { val: 9, color: '#28c04c' }
]

const cutoffSeconds = computed(() => (gameId.value === '1' ? 10 : 30))

watch(() => drawer.value.selectedBase, (val) => { drawer.value.totalAmount = val * drawer.value.multiplier })
watch(() => drawer.value.multiplier, (val) => { drawer.value.totalAmount = val * drawer.value.selectedBase })

// Hide bottom nav when drawer is open
watch(() => drawer.value.show, (isOpen) => {
  if (isOpen) {
    ui.hideBottomNav()
  } else {
    ui.showBottomNav()
  }
})

function openBetDrawer(color, title, bgOverride = null) {
  if (!auth.isLoggedIn) { router.push('/login'); return }
  drawer.value = {
    show: true,
    color: bgOverride || (color === 'orange' ? '#ffa500' : color),
    title,
    selectedBase: 10,
    multiplier: 1,
    totalAmount: 10,
    agreed: drawer.value.agreed
  }
}

async function handleConfirmBet() {
  if (!drawer.value.agreed) { showAlert("Please agree to presale rule first !"); return }
  isSubmitting.value = true
  try {
    const res = await wingoApi.placeBid(gameId.value, {
      bidOn: drawer.value.title,
      bidAmount: drawer.value.totalAmount,
      userId: auth.user.id
    })
    if (res.data === 'Done') {
      showAlert('Bet placed successfully!')
      drawer.value.show = false
      auth.user.balance -= drawer.value.totalAmount
      fetchData()
    } else {
      showAlert(res.data?.message || 'Failed')
    }
  } catch (err) {
    showAlert(err.response?.data?.error || 'Error')
  } finally {
    isSubmitting.value = false
  }
}

function showAlert(msg) {
  alertDialog.value = { show: true, message: msg }
  setTimeout(() => alertDialog.value.show = false, 2500)
}

function confirmPresale() {
  presaleDialog.value.show = false
  drawer.value.agreed = true
}

async function updateTimer() {
  try {
    const res = await wingoApi.getTimer(gameId.value)
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      const lastRec = res.data[0]
      const duration = gameId.value === '1' ? 60 : (gameId.value === '3' ? 180 : 300)
      const now = Date.now()
      
      // Use lastRec.date if available, otherwise fallback to a safe default
      const lastEndDate = lastRec.date || now
      const remaining = (lastEndDate / 1000 + duration) - (now / 1000)
      
      timerTotal.value = Math.max(0, Math.floor(remaining))
      currentPeriod.value = lastRec.id ? String(parseInt(lastRec.id) + 1) : '...'
      canOpen.value = timerTotal.value > cutoffSeconds.value
    } else {
      currentPeriod.value = 'Loading...'
    }
  } catch (err) {
    console.error("Timer update failed:", err)
  }
}

async function fetchData() {
  try {
    const [recRes, myRes] = await Promise.all([
      wingoApi.getRecords(gameId.value),
      auth.user?.id ? wingoApi.getMyHistory(gameId.value, auth.user.id) : { data: [] }
    ])
    
    if (recRes.data && Array.isArray(recRes.data)) {
      records.value = recRes.data
    } else {
      records.value = []
    }
    
    if (myRes.data) {
      myHistory.value = Array.isArray(myRes.data) ? myRes.data : []
    }
  } catch (err) {
    console.error("Fetch data failed:", err)
  }
}

const parseColors = (c) => c ? c.split(' ') : []
const getDotColor = (name) => {
  const n = name.toLowerCase()
  if (n.includes('red')) return '#f84350'
  if (n.includes('green')) return '#28c04c'
  if (n.includes('violet')) return '#8c6ceb'
  return '#94a3b8'
}
const getSelectColor = (s) => {
  if (s.includes('Green')) return '#28c04c'
  if (s.includes('Red')) return '#f84350'
  if (s.includes('Violet')) return '#8c6ceb'
  return '#2196f3'
}

let timerInterval = null
onMounted(() => {
  updateTimer()
  fetchData()
  timerInterval = setInterval(() => {
    if (timerTotal.value > 0) {
      timerTotal.value--
      canOpen.value = timerTotal.value > cutoffSeconds.value
    } else {
      updateTimer()
      fetchData()
    }
  }, 1000)
})

onUnmounted(() => { 
  if (timerInterval) clearInterval(timerInterval)
  ui.showBottomNav() // Ensure nav is restored if user navigates away
})
watch(() => route.params.id, () => { updateTimer(); fetchData() })
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

:root {
  --primary: #0d9488;
  --primary-dark: #0f766e;
  --bg-color: #f8fafc;
  --card-bg: #ffffff;
  --text-main: #1e293b;
  --text-muted: #64748b;
  --green: #22c55e;
  --red: #ef4444;
  --violet: #8b5cf6;
  --blue: #3b82f6;
  --orange: #f59e0b;
}

.wingo-page {
  background: #f1f5f9;
  min-height: 100vh;
  font-family: 'Outfit', sans-serif;
  color: #1e293b;
}

.wingo-container {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  background: #fff;
  min-height: 100vh;
  position: relative;
  padding-bottom: 90px;
  box-shadow: 0 0 40px rgba(0,0,0,0.05);
}

/* Header Refinement */
.wingo-header {
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.2);
}

.header-label { font-size: 11px; font-weight: 500; letter-spacing: 0.5px; opacity: 0.9; text-transform: uppercase; }
.header-balance { font-size: 1.5rem; font-weight: 700; margin: 4px 0; letter-spacing: -0.5px; }
.header-uid { font-size: 11px; opacity: 0.8; font-weight: 400; }

.header-right { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
.header-icon-btn { cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.2s ease; }
.header-icon-btn:active { transform: scale(0.9); }
.recharge-btn { background: rgba(255,255,255,0.15); padding: 6px 12px; border-radius: 100px; gap: 6px; font-size: 12px; font-weight: 600; color: #fff; text-decoration: none; backdrop-filter: blur(4px); }

/* Tabs Refinement */
.minute-tabs {
  display: flex;
  padding: 12px;
  gap: 10px;
  background: #f8fafc;
}
.tab-item {
  flex: 1;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}
.tab-item.active {
  background: #fff;
  border-color: #0d9488;
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.1);
  transform: translateY(-2px);
}
.tab-item span { font-size: 12px; font-weight: 600; color: #64748b; }
.tab-item.active span { color: #0d9488; }
.tab-icon { opacity: 0.4; transition: opacity 0.3s; }
.tab-item.active .tab-icon { opacity: 1; }

/* Period & Timer Box */
.period-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  margin: 10px 12px;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);
}
.period-info .label { color: #94a3b8; font-size: 11px; text-transform: uppercase; font-weight: 600; margin-bottom: 4px; }
.period-info .value { font-size: 1.1rem; font-weight: 700; color: #1e293b; }

.timer-info { text-align: right; }
.timer-info .label { color: #94a3b8; font-size: 11px; text-transform: uppercase; font-weight: 600; margin-bottom: 6px; }
.timer-boxes { display: flex; gap: 4px; justify-content: flex-end; }
.t-box {
  background: #f1f5f9;
  width: 20px; height: 26px;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 600; border-radius: 4px; color: #0d9488;
}
.t-box.wide { width: 40px; }
.t-sep { font-size: 16px; font-weight: 700; color: #cbd5e1; }

/* Betting Buttons Grid */
.bet-buttons-row { padding: 12px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.bet-buttons-row button {
  height: 48px; border: none; border-radius: 14px; color: #fff; font-weight: 600; font-size: 14px;
  cursor: pointer; transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
.bet-buttons-row button:active { transform: scale(0.95); box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.btn-green { background: linear-gradient(135deg, #22c55e 0%, #15803d 100%); }
.btn-red { background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); }
.btn-violet { background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%); }
.btn-big { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); }
.btn-small { background: linear-gradient(135deg, #f59e0b 0%, #b45309 100%); }
.btn-big, .btn-small { grid-column: span 1; }

.disabled { opacity: 0.5; filter: grayscale(1); cursor: not-allowed !important; transform: none !important; }

/* Number Grid */
.number-grid-container {
  padding: 10px 12px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}
.num-circle {
  aspect-ratio: 1;
  width: auto; height: auto;
  border-radius: 12px;
  color: #fff; display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 700; cursor: pointer;
  transition: all 0.2s; box-shadow: 0 4px 8px rgba(0,0,0,0.05);
}
.num-circle:active { transform: scale(0.9); }

/* Records Tables */
.records-container { padding: 20px 16px; background: #fff; margin-top: 15px; border-radius: 24px 24px 0 0; box-shadow: 0 -10px 20px rgba(0,0,0,0.02); }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.section-header span:first-child { font-size: 16px; font-weight: 700; color: #1e293b; }
.more-link { color: #0d9488; font-size: 12px; font-weight: 600; cursor: pointer; padding: 4px 8px; background: #f0fdfa; border-radius: 8px; }

.record-table { width: 100%; border-collapse: separate; border-spacing: 0 8px; font-size: 13px; text-align: center; }
.record-table th { color: #94a3b8; font-weight: 500; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; padding-bottom: 8px; }
.record-table td { padding: 12px 4px; background: #f8fafc; font-weight: 500; color: #1e293b; }
.record-table td:first-child { border-radius: 10px 0 0 10px; }
.record-table td:last-child { border-radius: 0 10px 10px 0; }

.text-green { color: #22c55e; }
.text-red { color: #ef4444; }

.bid-card { margin-top: 12px; padding: 16px; background: #f8fafc; border-radius: 16px; border: 1px solid #f1f5f9; transition: transform 0.2s; }
.bid-card:active { transform: scale(0.98); }
.bid-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
.bid-amt { font-weight: 700; font-size: 1.1rem; color: #1e293b; }
.bid-note { font-size: 10px; color: #94a3b8; font-weight: 600; text-transform: uppercase; }
.bid-date { font-size: 11px; color: #94a3b8; }
.bid-card-details { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; border-top: 1px dashed #e2e8f0; pt: 12px; }
.detail-row { display: flex; align-items: center; gap: 6px; font-size: 12px; }
.lbl { color: #64748b; font-weight: 500; }
.val { font-weight: 700; color: #1e293b; }

/* Modals & Popups */
.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 10000; animation: fadeIn 0.3s; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.winning-card { width: 90%; max-width: 320px; background: #fff; border-radius: 24px; text-align: center; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
.badge-img { height: 120px; margin: 20px 0; object-fit: contain; }
.winning-amount { font-size: 2.2rem; color: #22c55e; font-weight: 800; letter-spacing: -1px; margin: 10px 0; }
.congrats-text { font-size: 1.2rem; font-weight: 700; color: #1e293b; }
.winning-label { color: #64748b; font-size: 0.9rem; margin-bottom: 15px; }
.close-win-btn { width: 100%; padding: 16px; border: none; background: #22c55e; color: #fff; font-weight: 700; cursor: pointer; transition: filter 0.2s; }
.close-win-btn:active { filter: brightness(0.9); }

/* Drawer Styling */
.drawer-content { width: 100%; max-width: 480px; margin: 0 auto; background: #fff; border-radius: 30px 30px 0 0; padding-bottom: calc(constant(safe-area-inset-bottom) + 10px); }
.drawer-header { height: 60px; font-weight: 700; font-size: 1.1rem; border-radius: 30px 30px 0 0; letter-spacing: 0.5px; }
.drawer-body { padding: 20px 0; }
.drawer-row { padding: 12px 24px; }
.c-options { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.c-options button { height: 40px; border-radius: 10px; background: #f1f5f9; font-weight: 600; color: #64748b; border: 1px solid transparent; transition: all 0.2s; }
.c-options button.active { background: #fff; border-color: #0d9488; color: #0d9488; box-shadow: 0 4px 10px rgba(13, 148, 136, 0.1); }

.amount-entry { margin: 15px 24px; background: #f8fafc; border-radius: 12px; padding: 14px 20px; border: 1px solid #e2e8f0; }
.amount-field { font-weight: 700; color: #0d9488; font-size: 1.2rem; }

.qty-control { background: #f1f5f9; margin: 0 24px; padding: 8px; border-radius: 100px; display: inline-flex; width: calc(100% - 48px); justify-content: space-between; align-items: center; }
.qty-control button { width: 36px; height: 36px; background: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: #0d9488; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

.drawer-buttons { padding: 20px 24px; display: flex; gap: 12px; }
.drawer-buttons button { height: 50px; border-radius: 16px; font-weight: 700; flex: 1; font-size: 15px; }
.confirm-btn { box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3); }

/* Common styles */
@media (max-width: 380px) {
  .header-balance { font-size: 1.2rem; }
  .tab-item span { font-size: 10px; }
  .num-circle { font-size: 14px; }
}

.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); }

.dot { font-size: 0; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); }
</style>
