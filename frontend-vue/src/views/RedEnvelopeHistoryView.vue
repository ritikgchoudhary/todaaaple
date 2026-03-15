<template>
  <div class="page">
    <div class="mobileContainer">
      <header class="header">
        <svg @click="router.back()" class="backIcon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        <div class="headerTitle">Red Envelope History</div>
      </header>

      <div class="contentWrapper">
        <div class="tableContainer">
          <table class="customTable">
            <thead>
              <tr>
                <th>Code</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in envelops" :key="row.id">
                <td class="smallText">{{ row.id }}</td>
                <td>{{ row.amount }}</td>
                <td :class="row.expired ? 'text-red' : 'text-green'">{{ row.expired ? 'Claimed' : 'Active' }}</td>
                <td>
                  <div v-if="!row.expired" class="actionBtns">
                    <button class="btnRedeem" @click="handleRedeem(row.id)">Redeem</button>
                    <button class="btnCopy" @click="copyCode(row.id)">Copy</button>
                  </div>
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
          <span class="loaderText">Please Wait!</span>
        </div>
      </div>

      <!-- Message Dialog -->
      <div v-if="dialog.open" class="dialogOverlay" @click="dialog.open = false">
        <div class="dialogContent" @click.stop>
          <div class="dialogMessage">{{ dialog.body }}</div>
          <button class="dialogBtn" @click="dialog.open = false">OK</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUserEnvelop, redeemEnvelop } from '../api/envelope'

const router = useRouter()

const envelops = ref([])
const loader = ref(false)
const dialog = ref({ open: false, body: '' })

onMounted(async () => {
  const loggedInUserStr = localStorage.getItem('user')
  if (!loggedInUserStr) {
    router.push('/login')
    return
  }
  const foundUser = JSON.parse(loggedInUserStr)
  
  try {
    const response = await getUserEnvelop(foundUser.result.id)
    envelops.value = response.data
  } catch (err) {}
})

const copyCode = (id) => {
  navigator.clipboard.writeText(`${window.location.origin}/getRedEnvelop/${id}`)
  dialog.value = { open: true, body: 'Copied Successfully' }
}

const handleRedeem = async (id) => {
  loader.value = true
  const loggedInUserStr = localStorage.getItem('user')
  const foundUser = JSON.parse(loggedInUserStr)

  try {
    const response = await redeemEnvelop(id, foundUser.result.id)
    dialog.value = { open: true, body: `Successfully Redeemed ${response.data.amount}` }
    
    // Refresh
    const refresh = await getUserEnvelop(foundUser.result.id)
    envelops.value = refresh.data
  } catch (err) {
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
  font-family: var(--font-app);
}

.mobileContainer {
  width: 100%;
  max-width: min(430px, 100vw);
  min-height: 100vh;
  background-color: #fff;
  position: relative;
}

.header {
  background-color: white;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid #f1f5f9;
}

.backIcon {
  cursor: pointer;
  width: 20px;
  height: 20px;
}

.headerTitle {
  color: black;
  flex-grow: 1;
  text-align: center;
  font-weight: 500;
  margin-right: 20px;
  font-size: 16px;
}

.contentWrapper {
  padding: 0;
}

.tableContainer {
  width: 100%;
  overflow-x: auto;
}
.customTable {
  width: 100%;
  border-collapse: collapse;
}
.customTable th {
  font-weight: bold;
  padding: 10px;
  text-align: center;
  border-bottom: 1px solid #eee;
  color: black;
  font-size: 14px;
}
.customTable td {
  padding: 10px;
  text-align: center;
  border-bottom: 1px solid #eee;
  color: black;
  font-size: 14px;
}

.smallText {
  font-size: 10px !important;
}

.text-red { color: red; font-weight: bold; }
.text-green { color: green; font-weight: bold; }

.actionBtns {
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: center;
}

.btnRedeem {
  background-color: green;
  color: white;
  border: none;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}
.btnCopy {
  background-color: blue;
  color: white;
  border: none;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
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
}
</style>
