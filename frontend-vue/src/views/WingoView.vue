<template>
  <div class="wingo-page">
    <div class="mobileContainer">
      <!-- Top Header -->
      <header class="wingoHeader">
        <button @click="router.back()" class="backBtn">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <span class="pageTitle">Win Go 1Min</span>
        <div class="walletBalance">
          <img src="https://img.bzvm68.com/site_common/H5_7_mobile/footer_icon/footer_deposit.png" alt="" class="walletIcon" />
          <span>₹{{ (auth.user?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }) }}</span>
        </div>
      </header>

      <!-- Game Status Card -->
      <div class="gameStatusRow">
        <div class="periodInfo">
          <div class="label">Period</div>
          <div class="periodCode">{{ currentPeriod }}</div>
        </div>
        <div class="timerInfo">
          <div class="label">Count Down</div>
          <div class="timerRow">
            <span class="timeBox">0</span>
            <span class="timeBox">{{ Math.floor(timeLeft / 10) }}</span>
            <span class="timeBox">{{ timeLeft % 10 }}</span>
          </div>
        </div>
      </div>

      <!-- Betting Area -->
      <div class="bettingSection">
        <div class="colorGroup">
          <button @click="openBet('Green')" class="colorBtn greenLine">Green</button>
          <button @click="openBet('Violet')" class="colorBtn violetLine">Violet</button>
          <button @click="openBet('Red')" class="colorBtn redLine">Red</button>
        </div>

        <div class="numberGrid">
          <button v-for="n in 10" :key="n-1" 
            @click="openBet('Number', n-1)" 
            class="numBtn" 
            :class="getNumberClass(n-1)"
          >
            {{ n-1 }}
          </button>
        </div>

        <div class="sizeGroup">
          <button @click="openBet('Big')" class="sizeBtn big">Big</button>
          <button @click="openBet('Small')" class="sizeBtn small">Small</button>
        </div>
      </div>

      <!-- Result Tabs -->
      <div class="resultSection">
        <div class="tabHeader">
          <button @click="activeTab = 'record'" :class="{ active: activeTab === 'record' }">Game History</button>
          <button @click="activeTab = 'my'" :class="{ active: activeTab === 'my' }">My Results</button>
        </div>

        <div v-if="activeTab === 'record'" class="recordTable">
          <div class="tableRow header">
            <span>Period</span>
            <span>Number</span>
            <span>Big/Small</span>
            <span>Color</span>
          </div>
          <div v-for="r in records" :key="r.id" class="tableRow">
            <span class="periodText">{{ r.id }}</span>
            <span class="numText" :class="getColorByNumber(r.number)">{{ r.number }}</span>
            <span class="sizeText">{{ r.number >= 5 ? 'Big' : 'Small' }}</span>
            <div class="colorDots">
              <span v-for="c in getColorsByNumber(r.number)" :key="c" class="dot" :class="c"></span>
            </div>
          </div>
        </div>

        <div v-else class="myHistory">
          <div v-if="!myHistory.length" class="empty">No betting records</div>
          <div v-for="h in myHistory" :key="h.period" class="historyCard">
            <div class="hRow">
              <span class="hPeriod">{{ h.period }}</span>
              <span class="hStatus" :class="h.status">{{ h.status }}</span>
            </div>
            <div class="hRow">
              <span class="hSelect">{{ h.select }}</span>
              <span class="hAmount">₹{{ h.amount }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bet Dialog (Simple implementation) -->
      <Transition name="fade">
        <div v-if="betDialog.show" class="modalOverlay" @click.self="betDialog.show = false">
          <div class="modalContent">
            <h3>Bet on <span :class="betDialog.colorClass">{{ betDialog.select }}</span></h3>
            <div class="amountOptions">
              <button v-for="a in [1, 10, 100, 1000]" :key="a" 
                @click="betDialog.amount = a"
                :class="{ active: betDialog.amount === a }"
              >₹{{ a }}</button>
            </div>
            <div class="multiplierRow">
              <button @click="betDialog.qty = Math.max(1, betDialog.qty - 1)">-</button>
              <input type="number" v-model.number="betDialog.qty" />
              <button @click="betDialog.qty++">+</button>
            </div>
            <div class="totalRow">
              Total Amount: <span>₹{{ betDialog.amount * betDialog.qty }}</span>
            </div>
            <div class="modalActions">
              <button @click="betDialog.show = false" class="cancel">Cancel</button>
              <button @click="confirmBet" class="confirm" :disabled="isSubmitting">
                {{ isSubmitting ? 'Processing...' : 'Confirm' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Toast -->
      <Transition name="fade">
        <div v-if="toast.show" :class="['toast', toast.type]">{{ toast.message }}</div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import * as wingoApi from '../api/wingo'

const router = useRouter()
const auth = useAuthStore()

const currentPeriod = ref('...')
const timeLeft = ref(60)
const activeTab = ref('record')
const records = ref([])
const myHistory = ref([])
const isSubmitting = ref(false)

const betDialog = ref({
  show: false,
  select: '',
  amount: 10,
  qty: 1,
  colorClass: '',
  param: null
})

const toast = ref({ show: false, message: '', type: 'success' })

async function updateTimer() {
  try {
    const res = await wingoApi.getTimer1()
    if (res.data && res.data.length) {
      const lastRec = res.data[0]
      currentPeriod.value = String(parseInt(lastRec.id) + 1)
      const now = new Date()
      const end = new Date(lastRec.date)
      // Wingo usually resets balance on period change
      const elapsed = Math.floor((now - end) / 1000)
      timeLeft.value = Math.max(0, 60 - (elapsed % 60))
    }
  } catch (err) {}
}

async function fetchData() {
  try {
    const [recRes, myRes] = await Promise.all([
      wingoApi.getRecords1(),
      auth.user?.id ? wingoApi.getMyHistory1(auth.user.id) : { data: [] }
    ])
    if (recRes.data && Array.isArray(recRes.data)) records.value = recRes.data
    if (myRes.data && Array.isArray(myRes.data)) myHistory.value = myRes.data
  } catch (err) {}
}

function openBet(type, value = null) {
  if (!auth.isLoggedIn) {
    router.push('/login')
    return
  }
  betDialog.value = {
    show: true,
    select: value !== null ? `Number ${value}` : type,
    amount: 10,
    qty: 1,
    colorClass: value !== null ? getColorByNumber(value) : type.toLowerCase(),
    param: value !== null ? `Select ${value}` : type === 'Green' ? 'Join Green' : type === 'Red' ? 'Join Red' : type === 'Violet' ? 'Join Violet' : type
  }
}

async function confirmBet() {
  isSubmitting.value = true
  try {
    const total = betDialog.value.amount * betDialog.value.qty
    const res = await wingoApi.placeBid1({
      bidOn: betDialog.value.param,
      bidAmount: total,
      userId: auth.user.id,
      game: '1minute'
    })
    
    if (res.data === 'Done') {
      showToast('Bet placed successfully!')
      betDialog.value.show = false
      // Update local wallet balance
      auth.user.balance -= total
      fetchData()
    } else {
      showToast(res.data?.message || 'Failed to place bet', 'error')
    }
  } catch (err) {
    showToast(err.response?.data?.error || 'Server error', 'error')
  } finally {
    isSubmitting.value = false
  }
}

function showToast(msg, type = 'success') {
  toast.value = { show: true, message: msg, type }
  setTimeout(() => toast.value.show = false, 3000)
}

function getNumberClass(n) {
  if ([1,3,7,9].includes(n)) return 'green'
  if ([2,4,6,8].includes(n)) return 'red'
  if (n === 0) return 'violet-red'
  if (n === 5) return 'violet-green'
}
function getColorByNumber(n) {
  if ([1,3,7,9].includes(n)) return 'greenText'
  if ([2,4,6,8].includes(n)) return 'redText'
  return 'violetText'
}
function getColorsByNumber(n) {
  if (n === 0) return ['violet', 'red']
  if (n === 5) return ['violet', 'green']
  if ([1,3,7,9].includes(n)) return ['green']
  return ['red']
}

let timerInt = null
onMounted(() => {
  updateTimer()
  fetchData()
  timerInt = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 1) {
      setTimeout(() => { updateTimer(); fetchData(); }, 1000)
    }
  }, 1000)
})

onUnmounted(() => {
  if (timerInt) clearInterval(timerInt)
})
</script>

<style scoped>
.wingo-page { background: #f1f5f9; min-height: 100vh; }
.mobileContainer { 
  width: 100%; max-width: min(430px, 100vw); margin: 0 auto; 
  padding: 0 0 90px; background: #fff; box-sizing: border-box; 
  min-height: 100vh;
}

.wingoHeader {
  background: #fff; padding: 12px 16px; border-bottom: 1px solid #f1f5f9;
  display: flex; align-items: center; justify-content: space-between;
  position: sticky; top: 0; z-index: 10;
}
.backBtn { background: none; border: none; padding: 4px; color: #334155; }
.pageTitle { font-weight: 700; font-size: 1rem; color: #1e293b; }
.walletBalance { 
  display: flex; align-items: center; gap: 6px; background: #f0f9ff;
  padding: 6px 12px; border-radius: 20px; color: #0369a1; font-weight: 700;
  font-size: 0.85rem;
}
.walletIcon { width: 18px; height: 18px; }

.gameStatusRow {
  display: flex; justify-content: space-between; align-items: flex-end;
  padding: 20px 16px; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: #fff;
}
.periodInfo .label, .timerInfo .label { font-size: 0.75rem; opacity: 0.7; margin-bottom: 8px; }
.periodCode { font-size: 1.2rem; font-weight: 800; letter-spacing: 1px; }

.timerRow { display: flex; gap: 4px; }
.timeBox { 
  background: #334155; padding: 6px 8px; border-radius: 4px; 
  font-size: 1.1rem; font-weight: 800; color: #fbbf24;
}

.bettingSection { padding: 20px 16px; background: #fff; }
.colorGroup { display: flex; gap: 12px; margin-bottom: 20px; }
.colorBtn { 
  flex: 1; padding: 12px; border: none; border-radius: 12px;
  font-weight: 700; color: #fff; transition: opacity 0.2s;
}
.greenLine { background: #10b981; }
.violetLine { background: #a855f7; }
.redLine { background: #ef4444; }

.numberGrid { 
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px;
  margin-bottom: 20px;
}
.numBtn { 
  aspect-ratio: 1; border: none; border-radius: 50%; 
  color: #fff; font-weight: 800; font-size: 1.1rem;
}
.numBtn.green { background: #10b981; }
.numBtn.red { background: #ef4444; }
.numBtn.violet-red { background: linear-gradient(to bottom right, #a855f7 50%, #ef4444 50%); }
.numBtn.violet-green { background: linear-gradient(to bottom right, #a855f7 50%, #10b981 50%); }

.sizeGroup { display: flex; gap: 12px; }
.sizeBtn { 
  flex: 1; padding: 12px; border: none; border-radius: 12px;
  font-weight: 700; font-size: 1rem; color: #fff;
}
.sizeBtn.big { background: #f59e0b; }
.sizeBtn.small { background: #3b82f6; }

.resultSection { margin-top: 12px; }
.tabHeader { display: flex; border-bottom: 1px solid #f1f5f9; padding: 0 16px; }
.tabHeader button { 
  padding: 14px 20px; background: none; border: none; border-bottom: 2px solid transparent;
  font-size: 0.9rem; font-weight: 700; color: #64748b;
}
.tabHeader button.active { color: #2563eb; border-color: #2563eb; }

.tableRow { display: flex; align-items: center; padding: 12px 16px; border-bottom: 1px solid #f8fafc; font-size: 0.85rem; }
.tableRow.header { font-weight: 700; color: #94a3b8; background: #f8fafc; }
.tableRow span { flex: 1; text-align: center; }
.periodText { color: #334155; font-weight: 600; }
.numText { font-size: 1.1rem; font-weight: 800; }
.greenText { color: #10b981; }
.redText { color: #ef4444; }
.violetText { color: #a855f7; }

.colorDots { flex: 1; display: flex; justify-content: center; gap: 4px; }
.dot { width: 10px; height: 10px; border-radius: 50%; }
.dot.green { background: #10b981; }
.dot.red { background: #ef4444; }
.dot.violet { background: #a855f7; }

.myHistory { padding: 12px 16px; }
.historyCard { 
  background: #f8fafc; padding: 12px; border-radius: 12px; margin-bottom: 12px;
  border: 1px solid #f1f5f9;
}
.hRow { display: flex; justify-content: space-between; margin-bottom: 6px; font-weight: 600; }
.hPeriod { font-size: 0.8rem; color: #94a3b8; }
.hStatus { font-size: 0.75rem; text-transform: uppercase; }
.hStatus.Pending { color: #f59e0b; }
.hStatus.Win { color: #10b981; }
.hStatus.Loss { color: #ef4444; }
.empty { text-align: center; padding: 40px; color: #94a3b8; font-size: 0.9rem; }

/* Modal */
.modalOverlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5); 
  display: flex; align-items: flex-end; justify-content: center; z-index: 100;
}
.modalContent {
  width: 100%; max-width: min(430px, 100vw); background: #fff;
  border-radius: 24px 24px 0 0; padding: 24px 20px; box-sizing: border-box;
}
.modalContent h3 { margin-bottom: 20px; font-size: 1.2rem; text-align: center; }
.amountOptions { display: flex; gap: 10px; margin-bottom: 20px; }
.amountOptions button {
  flex: 1; padding: 10px; border: 1px solid #e2e8f0; background: #fff;
  border-radius: 10px; font-weight: 700; color: #64748b;
}
.amountOptions button.active { background: #2563eb; color: #fff; border-color: #2563eb; }

.multiplierRow { display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 24px; }
.multiplierRow button { width: 40px; height: 40px; border-radius: 50%; border: 1px solid #e2e8f0; font-size: 1.2rem; }
.multiplierRow input { width: 60px; text-align: center; font-size: 1.2rem; font-weight: 700; border: none; }

.totalRow { text-align: center; font-size: 1rem; font-weight: 600; margin-bottom: 24px; }
.totalRow span { color: #2563eb; font-size: 1.2rem; font-weight: 800; }

.modalActions { display: flex; gap: 12px; }
.modalActions button { flex: 1; padding: 14px; border-radius: 12px; font-weight: 700; border: none; }
.modalActions .cancel { background: #f1f5f9; color: #64748b; }
.modalActions .confirm { background: #2563eb; color: #fff; }

.toast { 
  position: fixed; top: 80px; left: 50%; transform: translateX(-50%);
  padding: 12px 24px; border-radius: 8px; color: #fff; font-weight: 600;
  z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.toast.success { background: #10b981; }
.toast.error { background: #ef4444; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
