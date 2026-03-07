<template>
  <div class="wallet-page">
    <div class="mobileContainer">
      <!-- Header -->
      <header class="header">
        <div class="headerTop">
          <svg @click="router.back()" class="backIcon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          <div class="headerTitle">My Wallet</div>
        </div>
        <div class="userInfo">
          <div class="userName">{{ auth.user?.username || 'User' }}</div>
          <div class="avatarBox">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="0" stroke-linecap="round" stroke-linejoin="round" class="avatarIcon"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
        </div>
      </header>

      <!-- Wallet Card -->
      <div class="walletCard">
        <div class="balanceLabel">Total Assets</div>
        <div class="balanceValue">₹ {{ (userBalance || 0).toFixed(2) }}</div>

        <div class="cashableRow">
          <span>Cashable Balance</span>
          <span class="cashableAmt">₹ {{ (cashableBalance || 0).toFixed(2) }}</span>
        </div>

        <div class="actionButtons">
          <router-link to="/deposit" class="btn rechargeBtn">Recharge</router-link>
          <router-link to="/withdrawal" class="btn withdrawBtn">Withdraw</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import * as walletApi from '../api/wallet'

const router = useRouter()
const auth = useAuthStore()
const userBalance = ref(0)
const cashableBalance = ref(0)

async function fetchWalletData() {
  if (!auth.user?.id) return
  try {
    const res = await walletApi.getUserHome(auth.user.id)
    if (res.data) {
      userBalance.value = parseFloat(res.data.balance || 0)
      const withWallet = parseFloat(res.data.withWallet || 0)
      cashableBalance.value = (withWallet < userBalance.value) ? withWallet : userBalance.value
    }
  } catch (err) {}
}

onMounted(() => {
  fetchWalletData()
})
</script>

<style scoped>
.wallet-page {
  min-height: 100vh;
  background-color: #F1F5F9;
  display: flex;
  justify-content: center;
  font-family: system-ui, -apple-system, sans-serif;
}
.mobileContainer {
  width: 100%;
  max-width: 500px;
  min-height: 100vh;
  background-color: #fff;
  position: relative;
}

.header {
  background-color: #05c0b8;
  padding: 20px 20px 60px;
  color: white;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
}
.headerTop {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
.backIcon { cursor: pointer; }
.headerTitle {
  flex-grow: 1;
  text-align: center;
  font-weight: 600;
  font-size: 18px;
  margin-right: 20px;
}

.userInfo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
}
.userName { font-weight: bold; font-size: 18px; }
.avatarBox { opacity: 0.9; }

.walletCard {
  margin: -50px 20px 20px;
  padding: 24px;
  border-radius: 15px;
  background-color: white;
  box-shadow: 0 4px 25px rgba(0,0,0,0.08);
  position: relative;
  z-index: 2;
}
.balanceLabel { color: #666; font-size: 14px; margin-bottom: 8px; }
.balanceValue { color: #05c0b8; font-size: 2rem; font-weight: 800; margin-bottom: 24px; }

.cashableRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #888;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #eee;
}
.cashableAmt { color: #333; font-weight: 700; }

.actionButtons {
  display: flex;
  gap: 12px;
}
.btn {
  flex: 1;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-weight: 700;
  text-decoration: none;
  font-size: 15px;
  transition: opacity 0.2s;
}
.btn:active { opacity: 0.8; }
.rechargeBtn { background-color: #05c0b8; color: white; }
.withdrawBtn { border: 2px solid #05c0b8; color: #05c0b8; }
</style>
