<template>
  <div class="wingo-page">
    <div class="wingo-container">
      <!-- Winning Dialog (once per win; cross = close and don't show again) -->
      <div v-if="winningDialog.show" class="modal-overlay">
        <div class="winning-card">
          <button type="button" class="win-close-x" aria-label="Close" @click="closeWinAndNeverShowAgain">×</button>
          <img src="/images/winBadge.png" alt="Winner" class="badge-img" />
          <div class="winning-content">
            <div class="congrats-text">Congratulations</div>
            <div class="game-info">Wingo {{ gameType }} Minute Period - {{ winningDialog.period }}</div>
            <div class="result-text">Result - {{ winningDialog.color }}</div>
            <div class="winning-amount">+{{ winningDialog.amount }}</div>
            <div class="total-winning-label">Total Winning</div>
            <button @click="closeWinAndNeverShowAgain" class="close-win-btn">Close</button>
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
          <div class="header-balance">₹ {{ (auth.user?.balance || 0).toFixed(2) }}</div>
          <div class="header-uid">No. {{ auth.user?.id }}</div>
        </div>
        <div class="header-right">
          <div style="cursor: pointer; line-height: 1" @click="rulesDialog.show = true">
            <img :src="'/images/rule.png'" height="17" class="icon-filter" />
          </div>
          <router-link to="/deposit" style="line-height: 0; margin-top: 5px;">
            <img :src="'/images/recharge.png'" height="22" />
          </router-link>
        </div>
      </header>

      <!-- Minute Tabs -->
      <nav class="minute-tabs">
        <router-link v-for="t in [1,3,5]" :key="t" :to="'/wingo/'+t" 
                     class="tab-btn" :class="['t'+t, { active: gameId === String(t) }]">
          <span>{{ t }} Min</span>
          <img :src="'/images/timer1.png'" height="14" width="14" style="object-fit: contain" />
        </router-link>
      </nav>

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
              <tr v-for="row in records.slice(0, 10)" :key="row.id">
                <td>{{ row.id }}</td>
                <td>{{ row.price }}</td>
                <td>
                  <span class="record-number" :style="{ color: getNumberColor(row.number) }">{{ row.number }}</span>
                  <span class="record-size">{{ row.number >= 5 ? 'Big' : 'Small' }}</span>
                </td>
                <td>
                  <div class="color-dots">
                    <span v-for="c in parseColors(row.color)" :key="c" class="dot" :style="{ backgroundColor: getDotColor(c) }"></span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="more-footer" @click="router.push('/wingo-record/' + gameId)">
            View More <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </div>
        </div>
      </section>

      <!-- Bid History Section -->
      <section class="records-container bid-history-container">
        <div class="section-header">
          <span style="color: #333">{{ gameType }} Minutes Bid History</span>
        </div>
        <div class="bid-list">
          <div v-if="!myHistory || myHistory.length === 0" class="no-records">No Records</div>
          <div v-for="(bid, idx) in last5BidHistory" :key="idx" class="bid-card">
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
          <div v-if="myHistory && myHistory.length > 5" class="more-footer" @click="router.push('/wingo-history/' + gameId)">
            View More <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
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
const last5BidHistory = computed(() => (myHistory.value || []).slice(0, 5))
const canOpen = ref(true)
const isUpdating = ref(false)
const isWaiting = ref(false)

const winningDialog = ref({ show: false, period: '', color: '', amount: '0.00' })
const lastShownWinKey = ref(null)
const currentWinKey = ref(null) // so we can save to localStorage when user closes

const WINGO_WIN_SEEN_KEY = 'wingo_win_seen'

function getSeenWinKeys() {
  try {
    const raw = localStorage.getItem(WINGO_WIN_SEEN_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch (_) { return [] }
}

function markWinAsSeen(key) {
  const seen = getSeenWinKeys()
  if (seen.includes(key)) return
  seen.push(key)
  if (seen.length > 100) seen.shift()
  localStorage.setItem(WINGO_WIN_SEEN_KEY, JSON.stringify(seen))
}

function closeWinAndNeverShowAgain() {
  if (currentWinKey.value) markWinAsSeen(currentWinKey.value)
  winningDialog.value = { ...winningDialog.value, show: false }
}
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
      auth.refreshUser()
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
  if (isUpdating.value) return
  isUpdating.value = true
  try {
    const res = await wingoApi.getTimer(gameId.value)
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      const lastRec = res.data[0]
      const duration = gameId.value === '1' ? 60 : (gameId.value === '3' ? 180 : 300)
      const now = Date.now()
      
      const lastRecTime = Number(lastRec.date) || now
      const nextEnd = lastRecTime + (duration * 1000)
      let remaining = Math.floor((nextEnd - now) / 1000)
      
      if (remaining <= 0) {
        timerTotal.value = 0
        isWaiting.value = true
        // Keep current period same or increment based on logic? 
        // If we see an OLD period and timer is 0, we stay on that ID+1.
        currentPeriod.value = lastRec.id ? String(parseInt(lastRec.id) + 1) : '...'
      } else {
        timerTotal.value = remaining
        isWaiting.value = false
        currentPeriod.value = lastRec.id ? String(parseInt(lastRec.id) + 1) : '...'
      }
      canOpen.value = timerTotal.value > cutoffSeconds.value
    }
  } catch (err) {
    console.error("Timer update failed:", err)
  } finally {
    isUpdating.value = false
  }
}

function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    updateTimer()
    fetchData()
  }
}

async function fetchData() {
  try {
    const [recRes, myRes] = await Promise.all([
      wingoApi.getRecords(gameId.value),
      auth.user?.id ? wingoApi.getFullHistory(gameId.value, auth.user.id) : { data: [] }
    ])
    
    if (recRes.data && Array.isArray(recRes.data)) {
      records.value = recRes.data
    } else {
      records.value = []
    }
    
    if (myRes.data && myRes.data !== 'No Data') {
      const list = Array.isArray(myRes.data) ? myRes.data : []
      myHistory.value = list
      // Show win popup once per win: only if this win key was never seen (localStorage)
      const latest = list[0]
      const winAmount = latest && (typeof latest.winning === 'number' ? latest.winning : parseFloat(latest.winning))
      if (latest && winAmount > 0) {
        const period = String(latest.period ?? '')
        const dateMs = latest.date != null ? (typeof latest.date === 'number' ? latest.date : new Date(latest.date).getTime()) : 0
        const dateSec = Math.floor(dateMs / 1000)
        const amountNum = Number(winAmount)
        const key = `w1-${period}-${dateSec}-${amountNum}`
        const alreadySeen = getSeenWinKeys().includes(key)
        if (!alreadySeen) {
          markWinAsSeen(key)
          lastShownWinKey.value = key
          currentWinKey.value = key
          winningDialog.value = {
            show: true,
            period: latest.period ?? '',
            color: getResultColorLabel(latest.select),
            amount: (typeof winAmount === 'number' ? winAmount : parseFloat(winAmount) || 0).toFixed(2)
          }
        }
      }
    } else {
      myHistory.value = []
    }
  } catch (err) {
    console.error("Fetch data failed:", err)
  }
}

function getResultColorLabel(select) {
  if (!select) return '—'
  const s = String(select)
  if (s.includes('Green')) return 'Green'
  if (s.includes('Red')) return 'Red'
  if (s.includes('Violet')) return 'Violet'
  if (s.includes('Big')) return 'Big'
  if (s.includes('Small')) return 'Small'
  if (/Select\s*\d+/.test(s)) return s.replace(/Select\s*/i, '') // e.g. "Select 5" -> "5"
  return s
}

// Same colors as game number grid: 0,5=violet; 1,3,7,9=green; 2,4,6,8=red
function getNumberColor(num) {
  const n = Number(num)
  if (n === 0 || n === 5) return '#8c6ceb'
  if ([1, 3, 7, 9].includes(n)) return '#28c04c'
  if ([2, 4, 6, 8].includes(n)) return '#f84350'
  return '#64748b'
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
let syncInterval = null

onMounted(() => {
  auth.refreshUser()
  updateTimer()
  fetchData()
  
  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  timerInterval = setInterval(() => {
    if (timerTotal.value > 0) {
      timerTotal.value--
      canOpen.value = timerTotal.value > cutoffSeconds.value
      isWaiting.value = false
    } else {
      isWaiting.value = true
      updateTimer()
      fetchData()
    }
  }, 1000)

  // Periodic resync every 10 seconds to correct drift
  syncInterval = setInterval(() => {
    updateTimer()
  }, 10000)
})

onUnmounted(() => { 
  if (timerInterval) clearInterval(timerInterval)
  if (syncInterval) clearInterval(syncInterval)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  ui.showBottomNav() // Ensure nav is restored if user navigates away
})
watch(() => route.params.id, () => { updateTimer(); fetchData() })
</script>

<style scoped>
.wingo-page { background: #f5f5f5; min-height: 100vh; font-family: var(--font-app); }
.wingo-container { width: 100%; max-width: 480px; margin: 0 auto; background: #fff; min-height: 100vh; position: relative; padding-bottom: 80px; }

.wingo-header { background-color: #0d9488; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; color: #fff; }
.header-left { min-width: 0; flex: 1; }
.header-label { font-size: 13px; opacity: 1; }
.header-balance { font-size: 1rem; font-weight: 700; margin: 1px 0; }
.header-uid { font-size: 12px; margin-top: 10px; }
.header-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0; }
.icon-filter { filter: brightness(0) invert(1); cursor: pointer; }

.minute-tabs { display: flex; padding: 16px 12px; gap: 0; }
.tab-btn { flex: 1; height: 52px; background: #fff; color: #000; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 14px; text-decoration: none; border: none; }
.tab-btn.t1 { border-radius: 17px 0 17px 0; }
.tab-btn.t3 { border-radius: 17px; }
.tab-btn.t5 { border-radius: 0 17px 0 17px; }
.tab-btn.active { background-color: #00b8a9; color: #fff; }
.tab-btn span { margin-bottom: 2px; }

.period-row { display: flex; justify-content: space-between; padding: 10px 16px; margin-top: 5px; }
.period-info .label { color: grey; font-size: 12px; margin-bottom: 5px; }
.period-info .value { font-size: 1.4rem; font-weight: 500; }
.timer-info .label { color: #333; font-size: 13px; margin-bottom: 5px; text-align: center; }
.timer-boxes { display: flex; align-items: center; gap: 4px; }
.t-box { background: #f2f2f2; width: 22px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 20px; border-radius: 4px; color: #000; }
.t-box.wide { width: 44px; }
.t-sep { font-size: 20px; font-weight: 400; padding: 0 2px; color: #000; }

.bet-buttons-row { padding: 16px 12px; display: flex; gap: 12px; }
.bet-buttons-row button { flex: 1; height: 44px; border: none; border-radius: 25px; color: #fff; font-weight: 500; font-size: 14px; cursor: pointer; box-shadow: 0 3px 1px -2px rgba(0,0,0,.2),0 2px 2px 0 rgba(0,0,0,.14),0 1px 5px 0 rgba(0,0,0,.12); }
.btn-green { background: #28c04c; }
.btn-red { background: #f84350; }
.btn-violet { background: #8c6ceb; }
.btn-big { background: #2196f3; }
.btn-small { background: orange; }
.disabled { background: #dbdbdb !important; cursor: not-allowed; box-shadow: none !important; }

.number-grid-container { padding: 8px 12px; display: grid; grid-template-columns: repeat(5, 1fr); justify-items: center; gap: 10px; }
.num-circle { width: 50px; height: 50px; border-radius: 50%; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 18px; cursor: pointer; box-shadow: 0 3px 1px -2px rgba(0,0,0,.2),0 2px 2px 0 rgba(0,0,0,.14),0 1px 5px 0 rgba(0,0,0,.12); }

.records-container { padding: 16px; border-top: 10px solid #f5f5f5; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 14px; font-weight: 700; }
.more-footer { padding: 12px; text-align: center; color: #0d9488; font-size: 14px; font-weight: 600; cursor: pointer; border-top: 1px solid #f1f1f1; display: flex; align-items: center; justify-content: center; gap: 4px; transition: background 0.2s; }
.more-footer:active { background: #f9f9f9; }

.record-table { width: 100%; border-collapse: collapse; font-size: 12px; text-align: center; }
.record-table th { color: #64748B; padding-bottom: 12px; border-bottom: 2px solid #E2E8F0; font-weight: 600; font-size: 12px; }
.record-table td { padding: 10px 0; border-bottom: 1px solid #F1F5F9; font-size: 13px; }
.record-number { font-weight: 800; font-size: 1.1em; }
.record-size { margin-left: 4px; color: #64748b; font-weight: 600; font-size: 0.95em; }
.text-green { color: #16A34A; font-weight: bold; }
.text-red { color: #DC2626; font-weight: bold; }
.color-dots { display: flex; justify-content: center; gap: 6px; }
.dot { width: 14px; height: 14px; border-radius: 50%; }

.bid-card { margin-top: 10px; padding: 10px; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.1); border-radius: 4px; border: 1px solid #eee; }
.bid-card-top { display: flex; justify-content: space-between; margin-bottom: 20px; }
.bid-amt { font-weight: bold; font-size: 1rem; }
.bid-note { font-size: 11px; color: grey; }
.bid-date { font-size: 14px; color: #333; }
.bid-card-details { display: flex; justify-content: space-evenly; gap: 10px; }
.detail-row { display: flex; flex-direction: column; gap: 5px; font-size: 13px; }
.lbl { color: #333; }
.val { font-weight: bold; }
.success { color: #28c04c; }
.red { color: red; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000; }
.winning-card { position: relative; width: 300px; background: #fff; border-radius: 0; text-align: center; overflow: hidden; }
.win-close-x {
  position: absolute; top: 8px; right: 8px; width: 36px; height: 36px; border: none; background: rgba(0,0,0,0.08);
  border-radius: 50%; font-size: 24px; line-height: 1; color: #333; cursor: pointer; z-index: 1; padding: 0; display: flex; align-items: center; justify-content: center;
}
.win-close-x:hover { background: rgba(0,0,0,0.12); }
.win-close-x:active { opacity: 0.8; }
.badge-img { height: 150px; margin-top: 10px; }
.winning-content { padding: 0 20px 24px; }
.congrats-text { font-size: 22px; font-weight: bold; margin-bottom: 12px; color: #000; }
.game-info { font-size: 13px; color: #333; margin-bottom: 6px; }
.result-text { font-size: 15px; font-weight: 600; color: #333; margin-bottom: 12px; }
.winning-amount { font-size: 28px; color: #16a34a; font-weight: bold; margin: 8px 0 4px; }
.total-winning-label { font-size: 14px; color: #333; margin-bottom: 16px; }
.close-win-btn { width: 100%; height: 44px; border: none; background: #0d9488; color: #fff; font-weight: bold; cursor: pointer; border-radius: 8px; }
.badge-img { width: 100%; max-width: 200px; height: auto; object-fit: contain; margin-top: 16px; display: block; margin-left: auto; margin-right: auto; }
.winning-card { border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
.close-win-btn:active { opacity: 0.9; }

.alert-box { background: #000; opacity: 0.6; color: #fff; padding: 10px 20px; border-radius: 0; font-size: 14px; height: 50px; display: flex; align-items: center; }

.rules-box { width: 90%; max-width: 400px; background: #fff; border-radius: 4px; padding: 20px; }
.rules-header { font-weight: bold; border-bottom: none; padding-bottom: 10px; margin-bottom: 10px; font-size: 12px; }
.rules-content { font-size: 12px; line-height: 1.6; max-height: 400px; overflow-y: auto; color: #333; }
.rules-ok-btn { width: auto; margin-top: 15px; height: 36px; border: none; background: transparent; color: #3f51b5; font-weight: bold; float: right; cursor: pointer; }

.drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: flex-end; z-index: 9999; }
.drawer-content { width: 100%; max-width: 480px; margin: 0 auto; background: #fff; border-radius: 0; }
.drawer-header { height: 50px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1rem; }
.drawer-body { padding: 0; }
.drawer-row { padding: 10px 20px; border-bottom: none; }
.c-label { font-size: 14px; margin-bottom: 8px; color: #333; }
.c-options { display: flex; gap: 8px; justify-content: space-evenly; }
.c-options button { flex: 1; height: 36px; border: none; background: #D8D8D8; border-radius: 4px; cursor: pointer; }
.c-options button.active { background: grey; color: #fff; }
.amount-entry { display: flex; align-items: center; background: #fafafa; padding: 10px 20px; margin-bottom: 0; }
.curr-symbol { font-weight: bold; margin-right: 15px; }
.amount-field { flex: 1; border: none; background: transparent; font-size: 16px; outline: none; }
.qty-control { display: flex; align-items: center; justify-content: center; gap: 20px; padding: 10px 20px; }
.qty-control button { width: 32px; height: 32px; border: none; background: transparent; font-size: 20px; cursor: pointer; }
.qty-val { font-size: 16px; font-weight: 400; }
.agreement-row { font-size: 12px; text-align: center; padding: 15px 20px; color: #000; }
.link-text { color: green; cursor: pointer; text-decoration: none; }
.total-summary { text-align: center; font-weight: bold; padding: 15px 20px; font-size: 14px; }
.drawer-buttons { display: flex; height: 50px; }
.drawer-buttons button { flex: 1; height: 50px; border: none; font-weight: 400; cursor: pointer; font-size: 14px; }
.cancel-btn { background: #D8D8D8; color: #000; }
.confirm-btn { color: #fff; }

.loader-content { background: #000; opacity: 0.6; padding: 20px; border-radius: 0; color: #fff; text-align: center; min-width: 150px; height: 100px; }
.loading-spinner { border: 4px solid #fff; border-top-color: transparent; width: 40px; height: 40px; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 10px; }
@keyframes spin { to { transform: rotate(360deg); } }

.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); }
</style>
