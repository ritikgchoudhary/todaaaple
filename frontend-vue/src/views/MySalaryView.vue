<template>
  <div class="page">
    <div class="mobileContainer">
      <!-- Loader Overlay -->
      <div v-if="loader" class="loaderOverlay">
        <div class="loaderBox">
          <div class="spinner"></div>
          <span class="loaderText">Please Wait!</span>
        </div>
      </div>

      <!-- Messages Dialog -->
      <div v-if="dialog.open" class="dialogOverlay" @click="dialog.open = false">
        <div class="dialogContent" @click.stop>
          <p>{{ dialog.body }}</p>
          <button @click="dialog.open = false" class="closeBtn">OK</button>
        </div>
      </div>

      <!-- Header -->
      <header class="header">
        <svg @click="router.back()" class="backIcon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        <div class="headerTitle">Daily Salary</div>
      </header>

      <div class="contentWrapper">
        <!-- Claiming Time Status -->
        <div :class="['statusBanner', isClaimingTime ? 'successBanner' : 'errorBanner']">
          {{ isClaimingTime ? '✅ Claiming Time: 12:00 AM - 10:00 AM' : '⏰ Claiming Time: 12:00 AM - 10:00 AM (Previous Day Performance)' }}
        </div>

        <div class="level1Members">Total Level 1 Members: {{ invite?.[0]?.members || 0 }}</div>

        <!-- Highest Available Level Display -->
        <div v-if="highestAvailable > 0" class="highestLevelBanner">
          <div class="highestLevelTitle">🏆 Highest Available Level: {{ highestAvailable }}</div>
          <div class="highestLevelSub">You can only claim this level.</div>
        </div>

        <!-- Member Progress Section -->
        <div v-if="memberProgress && memberProgress.length > 0" class="memberProgressContainer">
          <button @click="showProgress = !showProgress" class="progressToggleBtn">
            <span>Member Activity</span>
            <svg v-if="showProgress" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>

          <div v-if="showProgress" class="progressContent">
            <div class="tableWrapper">
              <table class="customTable">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Level</th>
                    <th>Bid Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(member, index) in memberProgress" :key="index" :class="{ 'altRow': index % 2 === 0 }">
                    <td>{{ member.name }}</td>
                    <td>{{ member.level === 'level0' ? 'Direct' : `Level ${member.level.replace('level', '')}` }}</td>
                    <td>₹{{ member.bidAmount.toLocaleString() }}</td>
                    <td>
                      <span :class="['statusChip', member.active ? 'activeChip' : 'inactiveChip']">
                        {{ member.active ? "Active" : "Inactive" }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="progressFooter">
              <span>Active Members: {{ memberProgress.filter(m => m.active).length }}/{{ memberProgress.length }}</span>
              <span>Total Bid: ₹{{ memberProgress.reduce((sum, member) => sum + member.bidAmount, 0).toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <!-- Salary Table -->
        <div class="tableWrapper mt-20">
          <table class="customTable">
            <thead>
              <tr>
                <th>Active Players</th>
                <th>Total Bid</th>
                <th>Daily Salary</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in invite" :key="row.id" 
                  :class="{'highlightRow': row.id === highestAvailable, 'altRow': row.id !== highestAvailable && index % 2 === 0}">
                <td class="text-center">
                  <div>Total: {{ row.active.current }} / {{ row.active.target }}</div>
                  <div class="smallText">Direct: {{ row.active.level0 }} / {{ row.active.required.level0 }}</div>
                  <div class="microText">Recharges: {{ row.active.downlineRecharge }} / {{ row.active.required.downlineRecharge }}</div>
                  <div v-if="row.active.current >= row.active.target && row.active.level0 >= row.active.required.level0 && row.active.downlineRecharge >= row.active.required.downlineRecharge" class="completedText">Completed</div>
                </td>
                <td class="text-center">
                  <div>₹{{ row.bid.current.toLocaleString() }}</div>
                  <div class="smallText">Target: ₹{{ row.bid.target.toLocaleString() }}</div>
                  <div v-if="row.bid.current >= row.bid.target" class="completedText">Completed</div>
                </td>
                <td class="text-center">
                  <div class="boldText">₹{{ row.salary.toLocaleString() }}</div>
                  <div v-if="row.id === highestAvailable" class="completedText mt-5">HIGHEST AVAILABLE</div>
                </td>
                <td class="text-center">
                  <div v-if="row.claimed" class="completedText">Done</div>
                  <button v-else-if="row.eligible && row.id === highestAvailable" 
                          @click="handleSubmit(row.id)" 
                          :disabled="!isClaimingTime"
                          :class="['actionBtn', isClaimingTime ? 'btnActive' : 'btnDisabled']">
                    {{ isClaimingTime ? 'Claim Now' : 'Not Time' }}
                  </button>
                  <div v-else-if="row.eligible && row.id < highestAvailable" class="autoCompleteText">Auto-Complete</div>
                  <div v-else class="incompleteText">Incomplete</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="text-center mt-20">
          <button @click="ruleDialog = true" class="howItWorksBtn">How it works?</button>
        </div>
      </div>

      <!-- Rules Dialog -->
      <div v-if="ruleDialog" class="dialogOverlay" @click="ruleDialog = false">
        <div class="dialogContent largeDialog" @click.stop>
          <h2 class="dialogTitle text-center">AGENT DAILY SALARY</h2>
          
          <div class="tableWrapper mb-20">
            <table class="customTable">
              <thead>
                <tr>
                  <th>LEVEL</th>
                  <th>SALARY</th>
                  <th>REQUIREMENTS</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(tier, index) in rulesTiers" :key="index" :class="{'altRow': index % 2 === 0}">
                  <td>{{ tier.level }}</td>
                  <td>₹{{ tier.salary }}</td>
                  <td class="pre-line">{{ tier.reqs }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 class="dialogTitleLeft">TERMS AND CONDITIONS / नियम और शर्तें</h3>
          <ul class="rulesList">
            <li>
              Active Player is counted only if they bet minimum ₹300 in a day<br/>
              <span class="subRule">सक्रिय खिलाड़ी तभी गिना जाएगा जब वह दिन में न्यूनतम ₹300 का बेट करे</span>
            </li>
            <li>
              Level 1 players are your direct referrals<br/>
              <span class="subRule">लेवल 1 के खिलाड़ी आपके सीधे रेफरल हैं</span>
            </li>
            <li>
              Downline Recharge is counted from all levels (Level 1-7 for users) when they make a deposit<br/>
              <span class="subRule">डाउनलाइन रिचार्ज सभी लेवल से गिना जाता है (यूजर्स के लिए लेवल 1-7) जब वे डिपॉजिट करते हैं</span>
            </li>
            <li>
              Total Bid is the sum of all bets placed by active players in a day<br/>
              <span class="subRule">कुल बेट एक दिन में सभी सक्रिय खिलाड़ियों द्वारा लगाए गए बेट का योग है</span>
            </li>
            <li>
              <strong>You can only claim the HIGHEST available salary level per day</strong><br/>
              <span class="subRule">आप प्रति दिन केवल उच्चतम उपलब्ध सैलरी लेवल ही क्लेम कर सकते हैं</span>
            </li>
            <li>
              <strong>Salary can only be claimed between 12:00 AM - 10:00 AM for previous day performance</strong><br/>
              <span class="subRule">सैलरी पिछले दिन के प्रदर्शन के लिए केवल 12:00 AM - 10:00 AM के बीच ही क्लेम की जा सकती है</span>
            </li>
            <li>
              Same IP, Same Bank details, or Same Phone number cannot claim Daily Salary<br/>
              <span class="subRule">समान IP, समान बैंक विवरण, या समान फोन नंबर से डेली सैलरी नहीं क्लेम की जा सकती</span>
            </li>
            <li>
              For exceptional performance, contact your Agency for better offers<br/>
              <span class="subRule">उत्कृष्ट प्रदर्शन के लिए, बेहतर ऑफर के लिए अपनी एजेंसी से संपर्क करें</span>
            </li>
          </ul>
          
          <div class="text-center mt-20">
            <button @click="ruleDialog = false" class="closeBtn">Close</button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getSalaryTask, claimSalary } from '../api/salary'

const router = useRouter()

const invite = ref([])
const memberProgress = ref([])
const showProgress = ref(false)
const highestAvailable = ref(0)
const isClaimingTime = ref(false)

const dialog = ref({ open: false, body: '' })
const loader = ref(true)
const ruleDialog = ref(false)

const rulesTiers = [
  { level: "Level 1", salary: 600, reqs: "10 Active Players (5 Level 1)\n3 Downline Recharge\n₹5,000 Total Bid" },
  { level: "Level 2", salary: 1100, reqs: "20 Active Players (8 Level 1)\n6 Downline Recharge\n₹10,000 Total Bid" },
  { level: "Level 3", salary: 2600, reqs: "40 Active Players (11 Level 1)\n9 Downline Recharge\n₹20,000 Total Bid" },
  { level: "Level 4", salary: 4100, reqs: "60 Active Players (14 Level 1)\n13 Downline Recharge\n₹30,000 Total Bid" },
  { level: "Level 5", salary: 6100, reqs: "80 Active Players (17 Level 1)\n16 Downline Recharge\n₹40,000 Total Bid" },
  { level: "Level 6", salary: 8100, reqs: "100 Active Players (21 Level 1)\n19 Downline Recharge\n₹50,000 Total Bid" },
  { level: "Level 7", salary: 10000, reqs: "125 Active Players (24 Level 1)\n22 Downline Recharge\n₹62,500 Total Bid" },
  { level: "Level 8", salary: 13000, reqs: "150 Active Players (27 Level 1)\n25 Downline Recharge\n₹75,000 Total Bid" },
  { level: "Level 9", salary: 20000, reqs: "200 Active Players (30 Level 1)\n28 Downline Recharge\n₹100,000 Total Bid" }
]

const checkClaimingTime = () => {
  const now = new Date()
  const hours = now.getHours()
  return hours >= 0 && hours < 10 // 12am to 10am
}

onMounted(async () => {
  const loggedInUserStr = localStorage.getItem('user')
  if (!loggedInUserStr) {
    router.push('/login')
    return
  }

  isClaimingTime.value = checkClaimingTime()

  try {
    const user = JSON.parse(loggedInUserStr)
    const response = await getSalaryTask(user.result.id)
    
    if (response.data.tasks) {
      invite.value = response.data.tasks
      memberProgress.value = response.data.memberProgress || []
      highestAvailable.value = response.data.highestAvailable || 0
    } else {
      invite.value = response.data
    }
  } catch (error) {
    console.error(error)
  } finally {
    loader.value = false
  }
})

const handleSubmit = async (id) => {
  if (!isClaimingTime.value) {
    dialog.value = { open: true, body: 'Salary can only be claimed between 12:00 AM - 10:00 AM for previous day performance.' }
    return
  }

  if (id !== highestAvailable.value) {
    dialog.value = { open: true, body: 'You can only claim the highest available salary level.' }
    return
  }

  loader.value = true
  try {
    const loggedInUserStr = localStorage.getItem('user')
    const user = JSON.parse(loggedInUserStr)
    await claimSalary(user.result.id, id)
    
    dialog.value = { open: true, body: `Successfully Claimed Salary Level ${id}!` }
    // Optionally refresh data here instead of goBack
    setTimeout(() => {
      router.back()
    }, 2000)
  } catch (error) {
    dialog.value = { open: true, body: error.response?.data || 'An error occurred while claiming salary.' }
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
  padding: 20px 0;
}

.statusBanner {
  margin: 0 20px 20px;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  font-weight: bold;
  font-size: 14px;
}
.successBanner { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
.errorBanner { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }

.level1Members {
  text-align: center;
  margin-top: 20px;
  color: black;
  font-size: 15px;
}

.highestLevelBanner {
  margin: 20px;
  padding: 15px;
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  text-align: center;
}
.highestLevelTitle { color: #856404; font-weight: bold; font-size: 15px; }
.highestLevelSub { color: #856404; font-size: 14px; margin-top: 4px; }

.memberProgressContainer {
  margin: 20px;
}
.progressToggleBtn {
  width: 100%;
  background-color: #05c0b8;
  color: white;
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  border: none;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
}
.progressContent {
  background-color: white;
  padding: 15px;
  border-radius: 0 0 10px 10px;
  border: 1px solid #eee;
  border-top: none;
}
.progressFooter {
  display: flex;
  justify-content: space-between;
  color: black;
  padding: 10px 10px 0;
  font-size: 14px;
}

.tableWrapper {
  width: 100%;
  overflow-x: auto;
}
.customTable {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  color: black;
}
.customTable th {
  background-color: #05c0b8;
  color: white;
  font-weight: bold;
  padding: 10px;
  text-align: center;
}
.customTable td {
  padding: 10px;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
}
.altRow { background-color: #f5f5f5; }
.highlightRow { background-color: #e8f5e8; border: 2px solid #05c0b8; }

.statusChip {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
}
.activeChip { background-color: #A1E8CC; color: #006400; }
.inactiveChip { background-color: #FFD4D4; color: #B00020; }

.text-center { text-align: center; }
.smallText { font-size: 12px; margin-top: 4px; }
.microText { font-size: 10px; margin-top: 2px; }
.boldText { font-weight: bold; }
.completedText { font-size: 10px; color: #05c0b8; font-weight: bold; }
.autoCompleteText { font-size: 12px; color: #ffa500; font-weight: bold; }
.incompleteText { font-size: 12px; color: black; }
.mt-5 { margin-top: 5px; }
.mt-20 { margin-top: 20px; }
.mb-20 { margin-bottom: 20px; }

.actionBtn {
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
}
.btnActive { background-color: #05c0b8; color: white; }
.btnDisabled { background-color: #ccc; color: white; cursor: not-allowed; }

.howItWorksBtn {
  background-color: #05c0b8;
  color: white;
  padding: 10px 20px;
  font-weight: bold;
  border-radius: 4px;
  border: none;
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
.loaderText { color: white; font-size: 12px; margin-top: 10px; }
@keyframes spin { to { transform: rotate(360deg); } }

.dialogContent {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 300px;
  text-align: center;
}
.largeDialog {
  max-width: 450px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  text-align: left;
}
.dialogTitle {
  color: #05c0b8;
  font-size: 24px;
  margin-bottom: 20px;
}
.dialogTitleLeft {
  color: #05c0b8;
  font-size: 18px;
  font-weight: bold;
  margin: 15px 0;
}
.closeBtn {
  background-color: #05c0b8;
  color: white;
  padding: 8px 20px;
  border: none;
  border-radius: 4px;
  margin-top: 15px;
  cursor: pointer;
}
.pre-line { white-space: pre-line; }

.rulesList {
  padding-left: 20px;
  color: black;
  font-size: 14px;
}
.rulesList li { margin-bottom: 12px; line-height: 1.4; }
.subRule { font-size: 13px; opacity: 0.8; }
</style>
