<template>
  <div class="page">
    <div class="mobileContainer">
      <header class="header">
        <svg @click="router.back()" class="backIcon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        <div class="headerTitle">Apply Record</div>
      </header>

      <div class="tableHeader">
        <div class="col-5">DATE</div>
        <div class="col-4">AMOUNT</div>
        <div class="col-3 text-right">STATUS</div>
      </div>

      <div v-if="record?.bonusRecord?.length > 0" class="recordList">
        <div v-for="(item, index) in record.bonusRecord" :key="index" class="recordItem">
          <div class="col-5">
            <div class="dateText">{{ new Date(item.date).toLocaleDateString() }}</div>
            <div class="timeText">{{ new Date(item.date).toLocaleTimeString() }}</div>
          </div>
          <div class="col-4">
            <div class="amountText">₹{{ item.amount }}</div>
          </div>
          <div class="col-3 text-right">
            <div class="statusSuccess">Success</div>
          </div>
        </div>
      </div>
      <div v-else class="emptyState">
        No records found
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import API from '../api/client'

const router = useRouter()
const record = ref(null)

onMounted(async () => {
  const loggedInUserStr = localStorage.getItem('user')
  if (!loggedInUserStr) {
    router.push('/login')
    return
  }

  const foundUser = JSON.parse(loggedInUserStr)
  try {
    const response = await API.get(`/getUser/${foundUser.result.id}`)
    record.value = response.data[0]
  } catch (error) {
    // Interceptor in client.js will handle 401 redirect
  }
})
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

.tableHeader {
  display: flex;
  padding: 15px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eee;
  font-weight: bold;
  color: #666;
  font-size: 12px;
}

.col-5 { flex: 0 0 41.666%; }
.col-4 { flex: 0 0 33.333%; }
.col-3 { flex: 0 0 25%; }
.text-right { text-align: right; }

.recordItem {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
  background-color: white;
}

.dateText { font-size: 13px; color: #333; }
.timeText { font-size: 11px; color: #999; }
.amountText { font-weight: bold; font-size: 14px; }
.statusSuccess { color: #4caf50; font-weight: bold; font-size: 13px; }

.emptyState {
  text-align: center;
  margin-top: 50px;
  color: #999;
}
</style>
