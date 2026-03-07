<template>
  <div class="page">
    <div class="mobileContainer">
      <!-- Loading Overlay -->
      <div v-if="loader" class="loaderOverlay">
        <div class="loaderBox">
          <div class="spinner"></div>
          <span class="loaderText">Loading...</span>
        </div>
      </div>

      <!-- Header -->
      <header class="header">
        <svg @click="router.back()" class="backIcon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        <div class="headerTitle">Affiliate Dashboard</div>
      </header>

      <div class="contentWrapper">
        <!-- Balance Card -->
        <div class="balanceCard">
          <div class="cardLabel">Withdrawable Balance</div>
          <div class="balanceAmount">₹ {{ balance.toFixed(2) }}</div>
          <div class="totalIncomeBox">
            <span class="totalIncomeLabel">Total Affiliate Income</span>
            <span class="totalIncomeValue">₹ {{ stats.total.toFixed(2) }}</span>
          </div>
        </div>

        <h3 class="sectionTitle">Income Breakdown</h3>
        
        <div class="statsGrid">
          <div class="statCard">
            <span class="statIcon">👤</span>
            <span class="statLabel">Direct Registration</span>
            <span class="statValue" style="color: #3B82F6">₹{{ stats.direct.toFixed(2) }}</span>
          </div>
          <div class="statCard">
            <span class="statIcon">✅</span>
            <span class="statLabel">KYC Income</span>
            <span class="statValue" style="color: #10B981">₹{{ stats.kyc.toFixed(2) }}</span>
          </div>
          <div class="statCard">
            <span class="statIcon">💸</span>
            <span class="statLabel">Withdrawal Fee</span>
            <span class="statValue" style="color: #F59E0B">₹{{ stats.withdrawal.toFixed(2) }}</span>
          </div>
          <div class="statCard">
            <span class="statIcon">🚀</span>
            <span class="statLabel">Upgrade Income</span>
            <span class="statValue" style="color: #8B5CF6">₹{{ stats.upgrade.toFixed(2) }}</span>
          </div>
        </div>

        <h3 class="sectionTitle">Recent Earnings</h3>

        <div v-if="logs.length === 0" class="emptyLogs">
          <p>No commission records yet</p>
        </div>
        
        <div v-else class="logsTableWrapper">
          <table class="logsTable">
            <thead>
              <tr>
                <th>USER / ID</th>
                <th>TYPE</th>
                <th class="text-right">COMM.</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(log, idx) in logs" :key="idx">
                <td>
                  <div class="logUsername">{{ log.fromUserName }}</div>
                  <div class="logTxnId">{{ log.transactionId }}</div>
                </td>
                <td>
                  <span class="logTypeBadge">{{ log.type }}</span>
                  <div class="logDate">{{ new Date(log.date).toLocaleDateString() }}</div>
                </td>
                <td class="text-right">
                  <div class="logAmount">+₹{{ log.amount }}</div>
                  <div class="logBaseAmount">Base: ₹{{ log.baseAmount }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAffiliateStats } from '../api/affiliate'

const router = useRouter()

const stats = ref({
  total: 0,
  direct: 0,
  kyc: 0,
  withdrawal: 0,
  upgrade: 0
})
const logs = ref([])
const balance = ref(0)
const loader = ref(true)

onMounted(async () => {
  const loggedInUserStr = localStorage.getItem('user')
  if (!loggedInUserStr) {
    router.push('/login')
    return
  }

  try {
    const user = JSON.parse(loggedInUserStr)
    const { data } = await getAffiliateStats(user.result.id)
    
    if (data.success) {
      const statsMap = {}
      data.data.stats.forEach(s => statsMap[s._id] = s.total)

      stats.value = {
        direct: (statsMap['Direct Registration'] || 0) + (statsMap['Level 2 Registration'] || 0),
        kyc: statsMap['KYC'] || 0,
        withdrawal: statsMap['Withdrawal Fee'] || 0,
        upgrade: statsMap['Upgrade'] || 0,
        total: data.data.stats.reduce((acc, curr) => acc + curr.total, 0)
      }
      balance.value = data.data.withdrawableBalance
      logs.value = data.data.recentLogs
    }
  } catch (error) {
    console.error("Error fetching affiliate stats:", error)
  } finally {
    loader.value = false
  }
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #F8FAFC;
  display: flex;
  justify-content: center;
  font-family: "Roboto", "Helvetica", "Arial", sans-serif;
}

.mobileContainer {
  width: 100%;
  max-width: min(430px, 100vw);
  min-height: 100vh;
  background-color: #fff;
  position: relative;
  padding-bottom: 20px;
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

.balanceCard {
  padding: 25px;
  background: linear-gradient(135deg, #05c0b8 0%, #039691 100%);
  color: white;
  border-radius: 20px;
  margin-bottom: 25px;
  box-shadow: 0 10px 20px rgba(5, 192, 184, 0.2);
}

.cardLabel {
  font-size: 14px;
  opacity: 0.9;
}

.balanceAmount {
  font-size: 32px;
  font-weight: 800;
  margin: 10px 0;
}

.totalIncomeBox {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(255,255,255,0.2);
}

.totalIncomeLabel {
  font-size: 12px;
  opacity: 0.8;
  display: block;
}

.totalIncomeValue {
  font-size: 18px;
  font-weight: 600;
  display: block;
  margin-top: 4px;
}

.sectionTitle {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 15px;
  color: #1E293B;
}

.statsGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 30px;
}

.statCard {
  padding: 15px;
  border-radius: 15px;
  border: 1px solid #E2E8F0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #fff;
}

.statIcon {
  font-size: 20px;
  margin-bottom: 5px;
}

.statLabel {
  font-size: 12px;
  color: #64748B;
  font-weight: 500;
}

.statValue {
  font-size: 18px;
  font-weight: 700;
  margin-top: 4px;
}

.emptyLogs {
  padding: 40px 20px;
  text-align: center;
  border: 1px dashed #CBD5E1;
  border-radius: 15px;
  color: #94A3B8;
  font-size: 14px;
}

.logsTableWrapper {
  overflow-x: auto;
}

.logsTable {
  width: 100%;
  border-collapse: collapse;
}

.logsTable th {
  text-align: left;
  font-size: 12px;
  font-weight: 700;
  color: #64748B;
  padding: 8px 10px;
  border-bottom: 1px solid #F1F5F9;
}

.logsTable td {
  padding: 12px 10px;
  border-bottom: 1px solid #F1F5F9;
}

.text-right {
  text-align: right !important;
}

.logUsername {
  font-size: 14px;
  font-weight: 600;
  color: #1E293B;
}

.logTxnId {
  font-size: 12px;
  color: #94A3B8;
  margin-top: 2px;
}

.logTypeBadge {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 12px;
  background-color: #F1F5F9;
  color: #475569;
  font-weight: 600;
  text-transform: uppercase;
}

.logDate {
  font-size: 12px;
  color: #94A3B8;
  margin-top: 4px;
}

.logAmount {
  color: #10B981;
  font-weight: 700;
  font-size: 14px;
}

.logBaseAmount {
  font-size: 12px;
  color: #94A3B8;
  margin-top: 2px;
}

/* Loader */
.loaderOverlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.loaderBox {
  background-color: rgba(0,0,0,0.7);
  width: 100px;
  height: 100px;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}
.loaderText {
  color: white;
  font-size: 12px;
  margin-top: 10px;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
