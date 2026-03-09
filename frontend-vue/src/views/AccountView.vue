<template>
  <div class="account-page">
    <div class="mobileContainer">
      <!-- Profile Header (Teal Style) -->
      <header class="profileHeader">
        <div class="userMain">
          <div class="userLeft">
            <div class="avatarCircle">
              <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="0" stroke-linecap="round" stroke-linejoin="round" class="avatarIcon"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div class="userDetails">
               <div class="userName">{{ auth.user?.username || auth.user?.phone || 'User' }}</div>
               <div class="userId">ID: {{ auth.user?.id || '0000' }}</div>
            </div>
          </div>
          <router-link to="/accountSecurity" class="settingsIconBtn">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </router-link>
        </div>
        
        <!-- Balance View -->
        <div class="balanceSection">
          <div class="balanceAmount">₹ {{ (userBalance || 0).toFixed(2) }}</div>
          <div class="balanceLabel">Account Balance</div>
        </div>
      </header>

      <!-- Quick Actions -->
      <div class="quickActions">
         <router-link to="/deposit" class="qaItem">
            <div class="qaIcon recharge"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></div>
            <span>Recharge</span>
         </router-link>
         <router-link to="/withdrawal" class="qaItem">
            <div class="qaIcon withdraw"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2"/><path d="M18 12h4"/></svg></div>
            <span>Withdraw</span>
         </router-link>
      </div>

      <!-- Menu List -->
      <div class="menuWrapper">
        <router-link v-for="item in filteredMenuItems" :key="item.path" :to="item.path" class="menuItem">
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import * as walletApi from '../api/wallet'

const router = useRouter()
const auth = useAuthStore()
const userBalance = ref(0)

async function fetchBalance() {
  if (!auth.user?.id) return
  try {
    const res = await walletApi.getUserHome(auth.user.id)
    if (res.data && res.data.length > 0) {
      userBalance.value = res.data[0].balance || 0
    }
  } catch (err) {}
}

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}

const isAdmin = computed(() => {
  return auth.user?.phone === 9988776655
})

const filteredMenuItems = computed(() => {
  return menuItems.filter(item => {
    if (item.label === 'API Docs' || item.label === 'Manage Games') {
      return isAdmin.value
    }
    return true
  })
})

// SVG Icons
const icons = {
  agent: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
  salary: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
  bonus: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>',
  history: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>',
  envelope: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
  promotion: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
  wallet: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2"/><path d="M18 12h4"/></svg>',
  bank: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="19" width="20" height="3"/><polyline points="3 19 3 10 12 3 21 10 21 19"/><line x1="12" y1="19" x2="12" y2="10"/><line x1="8" y1="19" x2="8" y2="14"/><line x1="16" y1="19" x2="16" y2="14"/></svg>',
  security: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  info: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  help: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>',
  code: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>'
}

const tealBg = 'rgba(15, 118, 110, 0.08)'
const tealColor = '#0F766E'

const menuItems = [
  { label: 'Earning as an Agent', path: '/agent-earning', svg: icons.agent, bg: tealBg, color: tealColor },
  { label: 'My Daily Salary', path: '/mySalary', svg: icons.salary, bg: tealBg, color: tealColor },
  { label: 'My Invitation Bonus', path: '/invitationBonus', svg: icons.bonus, bg: tealBg, color: tealColor },
  { label: 'Invite Friends', path: '/invite', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>', bg: '#F0FDF4', color: '#16A34A' },
  { label: 'Withdrawal History', path: '/withdrawalHistory', svg: icons.history, bg: '#F1F5F9', color: '#64748B' },
  { label: 'Red Envelope', path: '/redenvelope', svg: icons.envelope, bg: tealBg, color: tealColor },
  { label: 'My Promotion', path: '/mypromotion', svg: icons.promotion, bg: tealBg, color: tealColor },
  { label: 'My Wallet', path: '/wallet', svg: icons.wallet, bg: tealBg, color: tealColor },
  { label: 'My Bank', path: '/bank', svg: icons.bank, bg: tealBg, color: tealColor },
  { label: 'Account Security', path: '/accountSecurity', svg: icons.security, bg: tealBg, color: tealColor },
  { label: 'About Us', path: '/about-us', svg: icons.info, bg: tealBg, color: tealColor },
  { label: 'Customer Service', path: '/help', svg: icons.help, bg: tealBg, color: tealColor },
  { label: 'API Docs', path: '/api-docs', svg: icons.code, bg: tealBg, color: tealColor },
  { label: 'Manage Games', path: '/admin/games', svg: icons.security, bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
]

onMounted(fetchBalance)
</script>

<style scoped>
.account-page {
  min-height: 100vh;
  background-color: #F1F5F9;
  display: flex;
  justify-content: center;
}
.mobileContainer {
  width: 100%;
  max-width: min(430px, 100vw);
  background-color: #fff;
  min-height: 100vh;
  padding-bottom: 80px;
}

.profileHeader {
  background: linear-gradient(135deg, #05c0b8 0%, #0d9488 100%);
  padding: 30px 20px 40px;
  color: white;
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
  box-shadow: 0 4px 20px rgba(15, 118, 110, 0.2);
}

.userMain { display: flex; align-items: center; justify-content: space-between; margin-bottom: 30px; }
.userLeft { display: flex; align-items: center; gap: 14px; }
.avatarCircle {
  width: 60px; height: 60px; border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex; align-items: center; justify-content: center;
  border: 2px solid rgba(255,255,255,0.3);
}
.userDetails { display: flex; flex-direction: column; }
.userName { font-weight: 800; font-size: 1.15rem; letter-spacing: 0.01em; }
.userId { font-size: 12px; opacity: 0.85; font-weight: 500; margin-top: 2px; }

.settingsIconBtn {
  width: 44px; height: 44px; border-radius: 50%;
  background: rgba(255,255,255,0.15);
  display: flex; align-items: center; justify-content: center;
  color: white; text-decoration: none;
  transition: all 0.2s;
}
.settingsIconBtn:active { transform: scale(0.95); background: rgba(255,255,255,0.25); }

.balanceSection { text-align: center; }
.balanceAmount { font-size: 2.25rem; font-weight: 900; letter-spacing: -0.02em; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.balanceLabel { font-size: 13px; opacity: 0.9; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px; }

.quickActions {
  display: flex; gap: 16px; padding: 0 20px; margin-top: -30px;
}
.qaItem {
  flex: 1; background: #fff; border-radius: 18px; padding: 16px;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.06);
  text-decoration: none; color: #1e293b; transition: all 0.2s;
}
.qaItem:active { transform: translateY(2px); box-shadow: 0 5px 15px rgba(0,0,0,0.04); }

.qaIcon {
  width: 48px; height: 48px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
}
.recharge { background: rgba(5, 192, 184, 0.1); color: #05c0b8; }
.withdraw { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.qaItem span { font-weight: 700; font-size: 14px; }

.menuWrapper { padding: 20px; }
.menuItem {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 12px; border-bottom: 1px solid #f1f5f9;
  text-decoration: none; color: inherit; transition: background 0.2s;
}
.menuItem:active { background-color: #f8fafc; }
.menuItemLeft { display: flex; align-items: center; gap: 16px; }
.iconBox {
  width: 40px; height: 40px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}
.itemLabel { font-weight: 600; color: #1e293b; font-size: 15px; }
.chevron { color: #94a3b8; }

.logoutItem { border-bottom: none; margin-top: 10px; width: 100%; background: none; border: none; cursor: pointer; text-align: left; }
.logoutIcon { background: rgba(220, 38, 38, 0.08); color: #dc2626; }
.dangerText { color: #dc2626; }
</style>
