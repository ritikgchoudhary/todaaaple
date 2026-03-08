<template>
  <div class="page">
    <div class="mobileContainer">
      <header class="header">
        <svg @click="router.back()" class="backIcon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        <div class="headerTitle">My Promotion</div>
      </header>

      <!-- Bonus Dialog -->
      <div v-if="dialogBonus.open" class="dialogOverlay" @click="dialogBonus.open = false">
        <div class="dialogContent" @click.stop>
          <div class="dialogMessage">{{ dialogBonus.body }}</div>
          <button class="dialogBtn" @click="dialogBonus.open = false">OK</button>
        </div>
      </div>

      <!-- Rule Dialog -->
      <div v-if="ruleDialog" class="dialogOverlay" @click="ruleDialog = false">
        <div class="dialogContent" @click.stop>
          <h3 class="ruleTitle">Bonus Rules</h3>
          <p class="ruleText">If level 1 contribution reaches 10,000 and above you will get 25% extra bonus.</p>
          <button class="dialogBtn mt-15" @click="ruleDialog = false">Close</button>
        </div>
      </div>

      <div class="contentWrapper">
        <!-- Bonus Card -->
        <div class="bonusCard">
          <div class="bonusCardFlex">
            <div>
              <div class="bonusAmount">₹ {{ user?.bonus ? user.bonus.toFixed(2) : '0.00' }}</div>
              <div class="bonusLabel">My Bonus</div>
            </div>
            <div>
              <router-link to="/mypromotion/apply" class="actionChipLink">
                <span class="actionChip">Apply to Balance</span>
              </router-link>
            </div>
          </div>
        </div>

        <!-- Action Links -->
        <div class="section actionLinks">
          <router-link to="/applyRecord" class="textLink">Apply Record</router-link>
          <span class="divider">|</span>
          <router-link to="/invite" class="textLink">Invite Friends</router-link>
        </div>

        <!-- Members Stats -->
        <div class="section">
          <div class="teamDataHeader">
            <div class="teamDataTitle">Team Data</div>
            <div class="activeTodayText">
              Active Today: <span class="activeCount">{{ members[`level${level}`] ? members[`level${level}`].active : 0 }}</span>
            </div>
          </div>

          <!-- Level Selector -->
          <div class="levelGrid">
            <button v-for="(_, index) in 7" :key="index" 
                    @click="level = index"
                    :class="['levelBtn', level === index ? 'levelBtnActive' : 'levelBtnInactive']">
              Level {{ index + 1 }}
            </button>
          </div>

          <div class="statsGrid">
            <div class="statBox">
              <div class="statLabel">Total People</div>
              <div class="statValue">{{ members[`level${level}`] ? members[`level${level}`].total : 0 }}</div>
            </div>
            <div class="statBox">
              <div class="statLabel">Contribution</div>
              <div class="statValue">
                ₹ {{ user && user[`level${level}contribution`] ? user[`level${level}contribution`].toFixed(2) : '0.00' }}
              </div>
            </div>
          </div>

          <div v-if="level === 0" class="level0Actions">
            <button class="claimBonusBtn" @click="handleClaimBonus">Claim Bonus</button>
            <button class="howBtn" @click="ruleDialog = true">How?</button>
          </div>
        </div>

        <!-- View Details Links -->
        <div class="viewDetailsGrid">
          <router-link :to="`/promotionRecord/${user?.id}`" class="blockLink">
            <button class="btnDark">View All Members</button>
          </router-link>
          <router-link :to="`/promotionRecordNew/${user?.id}`" class="blockLink">
            <button class="btnOutlineDark">View Today's</button>
          </router-link>
        </div>
      </div>

      <!-- Loading Dialog -->
      <div v-if="loader" class="loaderOverlay">
        <div class="loaderBox">
          <div class="spinner"></div>
          <span class="loaderText">Please Wait...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getPromotionMembers, claimContriBonus } from '../api/promotion'
import API from '../api/client'

const router = useRouter()

const members = ref({
  level0: { active: 0, total: 0 },
  level1: { active: 0, total: 0 },
  level2: { active: 0, total: 0 },
  level3: { active: 0, total: 0 },
  level4: { active: 0, total: 0 },
  level5: { active: 0, total: 0 },
  level6: { active: 0, total: 0 },
})

const dialogBonus = ref({ open: false, body: '' })
const ruleDialog = ref(false)
const loader = ref(false)
const user = ref(null)
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
    const memRes = await getPromotionMembers(foundUser.result.id)
    members.value = { ...members.value, ...memRes.data }
    
    const userRes = await API.get(`/getUser/${foundUser.result.id}`)
    user.value = userRes.data[0]
  } catch (error) {
    // Interceptor in client.js will handle 401 redirect
  } finally {
    loader.value = false
  }
})

const handleClaimBonus = async () => {
  loader.value = true
  const loggedInUserStr = localStorage.getItem('user')
  const foundUser = JSON.parse(loggedInUserStr)

  try {
    const response = await claimContriBonus(foundUser.result.id)
    dialogBonus.value = { open: true, body: response.data }
  } catch (error) {
    console.error(error)
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
  padding-bottom: 20px;
}

.bonusCard {
  background-color: #05c0b8;
  color: white;
  padding: 20px;
  border-radius: 15px;
  margin: 20px;
  box-shadow: 0 4px 10px rgba(5, 192, 184, 0.3);
}

.bonusCardFlex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bonusAmount {
  font-size: 28px;
  font-weight: bold;
}

.bonusLabel {
  font-size: 14px;
  opacity: 0.9;
}

.actionChipLink {
  text-decoration: none;
}

.actionChip {
  background-color: white;
  color: #05c0b8;
  font-weight: bold;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  display: inline-block;
}

.section {
  margin: 0 20px 20px;
  padding: 15px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.actionLinks {
  display: flex;
  justify-content: space-around;
  padding: 15px 10px;
}

.textLink {
  text-decoration: none;
  color: #333;
  font-size: 14px;
  font-weight: bold;
}

.divider {
  color: #ddd;
}

.teamDataHeader {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 15px;
}

.teamDataTitle {
  color: #05c0b8;
  font-size: 16px;
  font-weight: bold;
}

.activeTodayText {
  font-size: 12px;
  color: #666;
}

.activeCount {
  color: #05c0b8;
  font-weight: bold;
}

.levelGrid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 20px;
}

.levelBtn {
  font-weight: bold;
  border-radius: 8px;
  padding: 8px 5px;
  font-size: 12px;
  border: none;
  cursor: pointer;
}

.levelBtnActive {
  background-color: #05c0b8;
  color: white;
}

.levelBtnInactive {
  background-color: #f5f5f5;
  color: #666;
}

.statsGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.statBox {
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 8px;
}

.statLabel {
  color: grey;
  font-size: 12px;
}

.statValue {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.level0Actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.claimBonusBtn {
  background-color: #05c0b8;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

.howBtn {
  background-color: transparent;
  color: #05c0b8;
  border: 1px solid #05c0b8;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

.viewDetailsGrid {
  padding: 0 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.blockLink {
  text-decoration: none;
  display: block;
}

.btnDark {
  width: 100%;
  background-color: #333;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

.btnOutlineDark {
  width: 100%;
  background-color: transparent;
  color: #333;
  border: 1px solid #333;
  padding: 10px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
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
  font-weight: bold;
}
.ruleTitle {
  color: #05c0b8;
  font-size: 18px;
  margin-bottom: 10px;
}
.ruleText {
  color: #333;
  font-size: 14px;
  text-align: left;
}
.mt-15 { margin-top: 15px; }
</style>
