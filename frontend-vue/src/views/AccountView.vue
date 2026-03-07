<template>
  <div class="account-page">
    <div class="mobileContainer">
      <!-- Profile Header -->
      <header class="profileHeader">
        <div class="userMain">
          <div class="userLeft">
            <div class="avatarCircle">
              <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="0" stroke-linecap="round" stroke-linejoin="round" class="avatarIcon"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div class="userName">{{ auth.user?.username || auth.user?.phone || 'User' }}</div>
          </div>
          <router-link to="/accountSecurity" class="settingsIconBtn">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </router-link>
        </div>
        
        <!-- Balance View (Swapped Label/Value to match React) -->
        <div class="balanceSection">
          <div class="balanceValue">₹ {{ (userBalance || 0).toFixed(2) }}</div>
          <div class="balanceLabel">Account Balance</div>
        </div>
      </header>

      <!-- Menu List -->
      <div class="menuWrapper">
        <router-link v-for="item in menuItems" :key="item.path" :to="item.path" class="menuItem">
          <div class="menuItemLeft">
            <div class="iconBox" :style="{ backgroundColor: item.bg, color: item.color }">
              <span v-html="item.svg"></span>
            </div>
            <span class="itemLabel">{{ item.label }}</span>
          </div>
          <svg class="chevron" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </router-link>

        <!-- Logout -->
        <button @click="handleLogout" class="menuItem logoutItem">
          <div class="menuItemLeft">
            <div class="iconBox logoutIcon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            </div>
            <span class="itemLabel dangerText">Sign Out</span>
          </div>
          <svg class="chevron" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
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

// SVG Icons (Lucide implementation)
const icons = {
  agent: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>',
  salary: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
  bonus: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>',
  history: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>',
  envelope: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
  promotion: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
  wallet: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2"/><path d="M18 12h4"/></svg>',
  bank: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="19" width="20" height="3"/><polyline points="3 19 3 10 12 3 21 10 21 19"/><line x1="12" y1="19" x2="12" y2="10"/><line x1="8" y1="19" x2="8" y2="14"/><line x1="16" y1="19" x2="16" y2="14"/></svg>',
  security: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  info: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  help: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>',
  code: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>'
}

const tealBg = 'rgba(15, 118, 110, 0.08)'
const tealColor = '#0F766E'
const blueBg = 'rgba(2, 132, 199, 0.08)'
const blueColor = '#0284c7'
const indigoBg = 'rgba(79, 70, 229, 0.08)'
const indigoColor = '#4f46e5'
const slateBg = 'rgba(100, 116, 139, 0.08)'
const slateColor = '#64748b'

const menuItems = [
  { label: 'Earning as an Agent', path: '/agent-earning', svg: icons.agent, bg: tealBg, color: tealColor },
  { label: 'My Daily Salary', path: '/mySalary', svg: icons.salary, bg: tealBg, color: tealColor },
  { label: 'My Invitation Bonus', path: '/invitationBonus', svg: icons.bonus, bg: tealBg, color: tealColor },
  { label: 'My Offer History', path: '/offer-history', svg: icons.history, bg: tealBg, color: tealColor },
  { label: 'Red Envelope', path: '/redenvelope', svg: icons.envelope, bg: tealBg, color: tealColor },
  { label: 'My Promotion', path: '/mypromotion', svg: icons.promotion, bg: tealBg, color: tealColor },
  { label: 'My Wallet', path: '/wallet', svg: icons.wallet, bg: blueBg, color: blueColor },
  { label: 'My Bank', path: '/bank', svg: icons.bank, bg: blueBg, color: blueColor },
  { label: 'Account Security', path: '/accountSecurity', svg: icons.security, bg: indigoBg, color: indigoColor },
  { label: 'About Us', path: '/about-us', svg: icons.info, bg: slateBg, color: slateColor },
  { label: 'Customer Service', path: '/help', svg: icons.help, bg: slateBg, color: slateColor },
  { label: 'API Docs', path: '/api-docs', svg: icons.code, bg: slateBg, color: slateColor },
]

async function handleLogout() {
  auth.logout()
  router.push('/login')
}

async function fetchBalance() {
  if (!auth.user?.id) return
  try {
    const res = await walletApi.getUserHome(auth.user.id)
    if (res.data?.balance) userBalance.value = parseFloat(res.data.balance)
  } catch (err) {}
}

onMounted(() => {
  fetchBalance()
})
</script>

<style scoped>
.account-page { min-height: 100vh; background: #f1f5f9; font-family: system-ui, -apple-system, sans-serif; display: flex; justify-content: center; }
.mobileContainer { width: 100%; max-width: 500px; min-height: 100vh; background: #fff; padding-bottom: 32px; box-shadow: 0 0 10px rgba(0,0,0,0.05); }

.profileHeader { background: #0d9488; background-image: url('/images/myHeader.jpg'); background-size: cover; background-position: center; min-height: 160px; padding: 20px 20px 24px; color: white; display: flex; flexDirection: column; justify-content: space-between; }
.userMain { display: flex; align-items: center; justify-content: space-between; }
.userLeft { display: flex; align-items: center; min-width: 0; }
.avatarCircle { margin-right: 14px; display: flex; align-items: center; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); }
.avatarIcon { font-size: 44px; }
.userName { font-size: 1.125rem; font-weight: 700; letter-spacing: 0.01em; text-shadow: 0 1px 2px rgba(0,0,0,0.2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.settingsIconBtn { color: rgba(255,255,255,0.95); padding: 8px; transition: background 0.2s; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.settingsIconBtn:active { background: rgba(255,255,255,0.15); }

.balanceSection { display: flex; flex-direction: column; align-items: center; padding-top: 10px; }
.balanceValue { font-size: 1.75rem; font-weight: 700; letter-spacing: -0.02em; text-shadow: 0 1px 3px rgba(0,0,0,0.25); }
.balanceLabel { font-size: 0.8125rem; font-weight: 500; opacity: 0.9; margin-top: 4px; }

.menuWrapper { padding: 20px 16px 0; }
.menuItem { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; text-decoration: none; background: none; border: none; width: 100%; cursor: pointer; border-bottom: 1px solid #F1F5F9; transition: background 0.1s; border-radius: 0; }
.menuItem:active { background: #f1f5f9; }

.menuItemLeft { display: flex; align-items: center; gap: 16px; flex: 1; }
.iconBox { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.itemLabel { font-size: 0.9375rem; font-weight: 600; color: #0f172a; }
.chevron { color: #94A3B8; font-size: 18px; }

.logoutIcon { background-color: rgba(220, 38, 38, 0.08); color: #dc2626; }
.dangerText { color: #dc2626; }
.logoutItem { border-bottom: none; margin-top: 10px; padding-bottom: 32px; }
</style>
