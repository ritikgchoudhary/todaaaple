<template>
  <div class="page">
    <div class="mobileContainer">
      <!-- Header -->
      <header class="header">
        <svg @click="router.back()" class="backIcon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        <div class="headerTitle">Offer History</div>
      </header>

      <div class="contentWrapper">
        <!-- Filters -->
        <div class="filterContainer">
          <div class="filterRow">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#05c0b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            <span class="filterTitle">Filter Transactions</span>
          </div>
          
          <div class="inputGroup">
            <label class="inputLabel">Category</label>
            <select v-model="category" class="customSelect">
              <option value="all">All Categories</option>
              <option value="salary">Salary</option>
              <option value="invitation">Invitation</option>
              <option value="recharge">Recharge</option>
              <option value="referral">Referral</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div class="filterRow mt-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#05c0b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span class="filterTitle">Date Range</span>
          </div>

          <div class="dateButtons">
            <button v-for="opt in dateOptions" :key="opt.value" 
                    @click="handleDateFilterChange(opt.value)"
                    :class="['dateBtn', dateFilter === opt.value ? 'dateBtnActive' : 'dateBtnOutline']">
              {{ opt.label }}
            </button>
          </div>

          <transition name="fade">
            <div v-if="showCustomDatePicker" class="customDateWrap">
              <div class="dateInputs">
                <div class="inputGroup half">
                  <label class="inputLabel">Start</label>
                  <input type="date" v-model="startDate" class="customInput" />
                </div>
                <div class="inputGroup half">
                  <label class="inputLabel">End</label>
                  <input type="date" v-model="endDate" class="customInput" />
                </div>
              </div>
              <button @click="applyCustomDateFilter" 
                      :disabled="!startDate || !endDate"
                      :class="['applyBtn', (!startDate || !endDate) ? 'applyDisabled' : '']">
                Apply Range
              </button>
            </div>
          </transition>
        </div>

        <!-- Transactions List -->
        <div class="tableContainer">
          <div v-if="filteredTransactions.length > 0">
            <div v-for="(tx, index) in filteredTransactions" :key="index" class="txCard">
              <div class="txLeft">
                <div class="txType">{{ tx.type }}</div>
                <div class="txDate">{{ new Date(tx.date).toLocaleString() }}</div>
              </div>
              <div class="txRight">
                <div class="txAmount">₹ {{ tx.amount }}</div>
                <div :class="['statusChip', getStatusClass(tx.status)]">{{ tx.status }}</div>
              </div>
            </div>
          </div>
          <div v-else class="emptyState">
            No transactions found.
          </div>
        </div>
      </div>

      <!-- Loading Dialog -->
      <div v-if="loader" class="loaderOverlay">
        <div class="loaderBox">
          <div class="spinner"></div>
          <span class="loaderText">Loading...</span>
        </div>
      </div>

      <!-- Error Dialog -->
      <div v-if="error.open" class="dialogOverlay" @click="error.open = false">
        <div class="dialogContent" @click.stop>
          <div class="dialogMessage">{{ error.message }}</div>
          <button class="dialogBtn" @click="error.open = false">OK</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getOfferTransactions } from '../api/bonus'

const router = useRouter()

const allTransactions = ref([])
const filteredTransactions = ref([])
const loader = ref(true)
const error = ref({ open: false, message: '' })

// Filters
const category = ref('all')
const dateFilter = ref('all')
const showCustomDatePicker = ref(false)
const startDate = ref('')
const endDate = ref('')

const dateOptions = [
  { label: 'All', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Week', value: 'thisWeek' },
  { label: 'Month', value: 'thisMonth' },
  { label: 'Custom', value: 'custom' },
]

onMounted(async () => {
  const loggedInUserStr = localStorage.getItem('user')
  if (!loggedInUserStr) {
    router.push('/login')
    return
  }

  try {
    const user = JSON.parse(loggedInUserStr)
    const response = await getOfferTransactions(user.result.id)
    allTransactions.value = response.data || []
    filteredTransactions.value = response.data || []
  } catch (err) {
    error.value = { open: true, message: 'Failed to load transactions' }
  } finally {
    loader.value = false
  }
})

watch([category, dateFilter, allTransactions], () => {
  if (dateFilter.value !== 'custom' || (dateFilter.value === 'custom' && startDate.value && endDate.value)) {
    applyFilters()
  }
})

const handleDateFilterChange = (filter) => {
  if (filter === 'custom') {
    showCustomDatePicker.value = true
  } else {
    showCustomDatePicker.value = false
    dateFilter.value = filter
  }
}

const applyCustomDateFilter = () => {
  if (startDate.value && endDate.value) {
    dateFilter.value = 'custom'
    showCustomDatePicker.value = false
    applyFilters()
  }
}

const applyFilters = () => {
  let result = [...allTransactions.value]

  if (category.value !== 'all') {
    result = result.filter(tx => tx.type && tx.type.toLowerCase().includes(category.value.toLowerCase()))
  }

  if (dateFilter.value !== 'all') {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const thisWeekStart = new Date(today)
    thisWeekStart.setDate(today.getDate() - today.getDay())
    
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
    lastMonthEnd.setHours(23, 59, 59, 999)

    switch (dateFilter.value) {
      case 'today':
        result = result.filter(tx => new Date(tx.date) >= today)
        break
      case 'yesterday':
        result = result.filter(tx => {
          const d = new Date(tx.date)
          return d >= yesterday && d < today
        })
        break
      case 'thisWeek':
        result = result.filter(tx => new Date(tx.date) >= thisWeekStart)
        break
      case 'thisMonth':
        result = result.filter(tx => new Date(tx.date) >= thisMonthStart)
        break
      case 'lastMonth':
        result = result.filter(tx => {
          const d = new Date(tx.date)
          return d >= lastMonthStart && d <= lastMonthEnd
        })
        break
      case 'custom':
        if (startDate.value && endDate.value) {
          const startDt = new Date(startDate.value)
          const endDt = new Date(endDate.value)
          endDt.setHours(23, 59, 59, 999)
          result = result.filter(tx => {
            const d = new Date(tx.date)
            return d >= startDt && d <= endDt
          })
        }
        break
    }
  }

  filteredTransactions.value = result
}

const getStatusClass = (status) => {
  if (!status) return 'statusDefault'
  switch (status.toLowerCase()) {
    case 'completed': return 'statusSuccess'
    case 'pending': return 'statusPending'
    case 'failed': return 'statusFailed'
    default: return 'statusDefault'
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
  background-color: #f1f5f9;
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
  padding: 0;
}

.filterContainer {
  background-color: white;
  border-radius: 16px;
  padding: 16px;
  margin: 16px;
  box-shadow: 0px 2px 8px rgba(0,0,0,0.1);
}

.filterRow {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.filterTitle {
  color: black;
  font-weight: 500;
  margin-left: 8px;
  font-size: 14px;
}
.mt-10 { margin-top: 10px; }

.inputGroup {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
}
.inputLabel {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}
.customSelect, .customInput {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
  background: white;
  color: black;
}
.customSelect:focus, .customInput:focus {
  outline: none;
  border-color: #05c0b8;
}

.dateButtons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.dateBtn {
  font-size: 10px;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #05c0b8;
  font-weight: 600;
}
.dateBtnOutline {
  background-color: transparent;
  color: #05c0b8;
}
.dateBtnActive {
  background-color: #05c0b8;
  color: white;
}

.customDateWrap {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 8px;
  margin-top: 10px;
}
.dateInputs {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}
.half { width: 50%; margin-bottom: 0; }
.applyBtn {
  width: 100%;
  background-color: #05c0b8;
  color: white;
  border: none;
  padding: 8px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}
.applyDisabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.tableContainer {
  padding: 0 16px;
}
.txCard {
  background: white;
  margin-bottom: 10px;
  padding: 15px;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0px 1px 3px rgba(0,0,0,0.05);
}
.txLeft { display: flex; flex-direction: column; }
.txType { font-weight: bold; color: #333; font-size: 14px; }
.txDate { color: #666; font-size: 12px; margin-top: 4px; }
.txRight { text-align: right; }
.txAmount { font-weight: bold; color: #05c0b8; font-size: 14px; margin-bottom: 4px; }

.statusChip {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
}
.statusSuccess { background: #e8f5e9; color: #2e7d32; }
.statusPending { background: #fff3e0; color: #ef6c00; }
.statusFailed { background: #ffebee; color: #c62828; }
.statusDefault { background: #f5f5f5; color: #616161; }

.emptyState {
  background: white;
  padding: 30px;
  text-align: center;
  border-radius: 10px;
  color: #666;
  font-size: 14px;
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
