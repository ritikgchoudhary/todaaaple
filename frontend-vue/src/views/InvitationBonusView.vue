<template>
  <div class="page">
    <div class="mobileContainer">
      <!-- Header -->
      <header class="header">
        <svg @click="router.back()" class="backIcon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        <div class="headerTitle">Invitation Bonus</div>
      </header>

      <div class="contentWrapper">
        <div class="section">
          <div class="sectionTitle">Invite friends and deposit</div>
          <div class="sectionSub">Invite friends to register and recharge to receive rewards</div>
          <div class="sectionSub">Activity date: 2000-01-01 - 2099-01-01</div>
        </div>

        <div class="actionWrap">
          <div class="btnGrid">
            <router-link to="/invitationRewardRule" class="gridBtn">
              <button class="topButton">Invitation Rules</button>
            </router-link>
            <router-link to="/invitationRecord" class="gridBtn">
              <button class="topButton">Invitation Record</button>
            </router-link>
          </div>
        </div>

        <div class="section">
          <div class="sectionTitle">Current Progress</div>
          <div class="sectionSub">
            Total Invitees: {{ inviteData.totalInvitees }} | Qualified Invitees: {{ inviteData.qualifiedInvitees }}
          </div>
        </div>

        <!-- Claimed Rewards History -->
        <div v-if="inviteData.previousClaimed && inviteData.previousClaimed.length > 0" class="tableWrap">
          <div class="sectionTitle text-center mb-10">Claimed Rewards</div>
          <div class="tableContainer">
            <table class="customTable">
              <thead>
                <tr>
                  <th>Invitees</th>
                  <th>Reward</th>
                  <th>Claimed On</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(claim, index) in inviteData.previousClaimed" :key="index" :class="index % 2 === 0 ? 'bg-white' : 'bg-green'">
                  <td class="text-center">{{ claim.invitees }}</td>
                  <td class="text-center">₹{{ claim.reward }}</td>
                  <td class="text-center">{{ formatDate(claim.claimedAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Eligible Tiers Table -->
        <div v-if="inviteData.eligibleTiers && inviteData.eligibleTiers.length > 0" class="tableWrap">
          <div class="sectionTitle text-center mb-10">Available Rewards</div>
          <div class="tableContainer">
            <table class="customTable">
              <thead>
                <tr>
                  <th>Required Invitees</th>
                  <th>Recharge Required</th>
                  <th>Reward</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(tier, index) in inviteData.eligibleTiers" :key="index" :class="index % 2 === 0 ? 'bg-white' : 'bg-green'">
                  <td class="text-center">{{ tier.invitees }}</td>
                  <td class="text-center">₹{{ tier.rechargeAmount }}</td>
                  <td class="text-center">₹{{ tier.reward }}</td>
                  <td class="text-center">
                    <button class="claimBtn" @click="handleClaim(tier.tier)">Claim</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Remaining Targets Table -->
        <div v-if="inviteData.remainingTargets && inviteData.remainingTargets.length > 0" class="tableWrap">
          <div class="sectionTitle text-center mb-10">Upcoming Targets</div>
          <div class="tableContainer">
            <table class="customTable">
              <thead>
                <tr>
                  <th>Target Reward</th>
                  <th>Required Invitees</th>
                  <th>Recharge Required</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(target, index) in inviteData.remainingTargets" :key="index" :class="index % 2 === 0 ? 'bg-white' : 'bg-green'">
                  <td class="text-center">₹{{ target.reward }}</td>
                  <td class="text-center">
                    {{ inviteData.qualifiedInvitees }}/{{ target.invitees }}
                    <div class="microText">({{ target.remaining }} more needed)</div>
                  </td>
                  <td class="text-center">₹{{ target.rechargeAmount }}</td>
                  <td class="text-center">
                    <div class="progressBarBg">
                      <div class="progressBarFill" :style="{ width: Math.min(100, (inviteData.qualifiedInvitees / target.invitees) * 100) + '%' }"></div>
                    </div>
                    <div class="microText mt-4">{{ Math.round((inviteData.qualifiedInvitees / target.invitees) * 100) }}%</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Message Dialog -->
      <div v-if="messageDialog.open" class="dialogOverlay" @click="messageDialog.open = false">
        <div :class="['dialogContent', messageDialog.isError ? 'dialogError' : 'dialogSuccess']" @click.stop>
          <div class="dialogIcon">
            <svg v-if="messageDialog.isError" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D32F2F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div :class="['dialogMessage', messageDialog.isError ? 'text-red' : 'text-green']">{{ messageDialog.message }}</div>
          <button :class="['dialogBtn', messageDialog.isError ? 'btnError' : 'btnSuccess']" @click="messageDialog.open = false">
            {{ messageDialog.isError ? 'Try Again' : 'OK' }}
          </button>
        </div>
      </div>

      <!-- Loader Overlay -->
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
import { useRouter } from 'vue-router'
import { getInviteBonusData, claimInvitationBonus } from '../api/bonus'

const router = useRouter()

const inviteData = ref({
  totalInvitees: 0,
  qualifiedInvitees: 0,
  eligibleTiers: [],
  remainingTargets: [],
  previousClaimed: []
})

const messageDialog = ref({
  open: false,
  message: '',
  isError: false
})
const loader = ref(true)

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-IN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

const fetchData = async () => {
  const loggedInUserStr = localStorage.getItem('user')
  if (!loggedInUserStr) {
    router.push('/login')
    return
  }
  
  try {
    const user = JSON.parse(loggedInUserStr)
    const response = await getInviteBonusData(user.result.id)
    inviteData.value = response.data
  } catch (error) {
    console.error(error)
  } finally {
    loader.value = false
  }
}

onMounted(() => {
  fetchData()
})

const handleClaim = async (tier) => {
  loader.value = true
  try {
    const loggedInUserStr = localStorage.getItem('user')
    const user = JSON.parse(loggedInUserStr)
    const response = await claimInvitationBonus(user.result.id, tier)
    
    messageDialog.value = {
      open: true,
      message: `Successfully claimed Tier ${response.data.tier} bonus of ₹${response.data.amount}!`,
      isError: false
    }
    await fetchData()
  } catch (error) {
    messageDialog.value = {
      open: true,
      message: error.response?.data || 'Failed to claim bonus',
      isError: true
    }
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
  padding-bottom: calc(100px + env(safe-area-inset-bottom));
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
  padding: 10px 16px;
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
  font-weight: bold;
  margin-right: 20px;
  font-size: 18px;
}

.contentWrapper {
  padding-bottom: 20px;
}

.section {
  padding: 14px;
  margin: 10px 12px 0;
  background-color: #f5f5f5;
  border-radius: 10px;
  text-align: center;
}

.sectionTitle {
  font-size: 16px;
  font-weight: 800;
  color: #05c0b8;
}

.sectionSub {
  font-size: 13px;
  color: #0F172A;
  opacity: 0.9;
  margin-top: 4px;
}

.actionWrap {
  margin: 10px 12px;
}

.btnGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.gridBtn {
  text-decoration: none;
  display: block;
}

.topButton {
  width: 100%;
  background-color: #f5f5f5;
  color: #05c0b8;
  padding: 10px;
  font-size: 13px;
  font-weight: 800;
  border: none;
  border-radius: 4px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.08);
  cursor: pointer;
}

.tableWrap {
  margin: 15px 12px 20px;
}

.tableContainer {
  border-radius: 10px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.customTable {
  width: 100%;
  min-width: 560px;
  border-collapse: collapse;
}

.customTable th {
  background-color: #05c0b8;
  color: white;
  font-weight: 800;
  font-size: 12px;
  padding: 10px 8px;
  white-space: nowrap;
  text-align: center;
}

.customTable td {
  color: black;
  font-size: 12px;
  padding: 10px 8px;
  white-space: nowrap;
}

.bg-white { background-color: #FFFFFF; }
.bg-green { background-color: #F1F8E9; }
.text-center { text-align: center; }
.mb-10 { margin-bottom: 10px; }

.claimBtn {
  background-color: #05c0b8;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 800;
  font-size: 12px;
  padding: 6px 10px;
  cursor: pointer;
}

.microText {
  font-size: 10px;
  color: black;
}
.mt-4 { margin-top: 4px; }

.progressBarBg {
  width: 100%;
  background-color: #E0E0E0;
  border-radius: 10px;
  overflow: hidden;
  height: 8px;
}

.progressBarFill {
  background-color: #05c0b8;
  height: 100%;
  transition: width 0.3s ease;
}

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
  padding: 20px;
  border-radius: 10px;
  width: 80%;
  max-width: 300px;
  text-align: center;
}

.dialogError { background-color: #FFEBEE; }
.dialogSuccess { background-color: #E8F5E9; }
.text-red { color: #D32F2F; }
.text-green { color: #2E7D32; }

.dialogIcon {
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
}

.dialogMessage {
  font-size: 16px;
  margin-bottom: 15px;
}

.dialogBtn {
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: bold;
  cursor: pointer;
}

.btnError { background-color: #D32F2F; }
.btnSuccess { background-color: #2E7D32; }
</style>
