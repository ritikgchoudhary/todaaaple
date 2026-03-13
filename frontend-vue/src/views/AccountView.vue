<template>
  <div class="account-page">
    <div class="mobileContainer">
      <!-- Profile Header (Teal Style) -->
      <header class="profileHeader">
        <div class="userMain">
          <div class="userLeft">
            <div class="avatarCircle">
              <img src="https://img.icons8.com/bubbles/100/user.png" alt="Avatar" width="50" height="50" v-if="auth.user?.avatar" :src="auth.user.avatar" />
              <img src="https://img.icons8.com/bubbles/100/user-male.png" alt="Avatar" width="50" height="50" v-else />
            </div>
            <div class="userDetails">
               <div class="userName">{{ auth.user?.username || auth.user?.phone || 'User' }}</div>
               <div class="userId">ID: {{ auth.user?.id || '0000' }}</div>
            </div>
          </div>
          <router-link to="/accountSecurity" class="settingsIconBtn">
            <img src="https://img.icons8.com/fluency/48/settings.png" width="24" height="24" alt="Settings" />
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
            <div class="qaIcon recharge">
              <img src="https://img.icons8.com/color/96/money-box.png" width="30" height="30" />
            </div>
            <span>Recharge</span>
         </router-link>
         <router-link to="/withdrawal" class="qaItem">
            <div class="qaIcon withdraw">
              <img src="https://img.icons8.com/fluency/48/withdrawal.png" width="30" height="30" />
            </div>
            <span>Withdraw</span>
         </router-link>
      </div>

      <!-- Menu List -->
      <div class="menuWrapper">
        <router-link v-for="item in filteredMenuItems" :key="item.path" :to="item.path" class="menuItem">
          <div class="menuItemLeft">
            <div class="iconBox" :style="{ backgroundColor: item.bg }">
              <img :src="item.img" width="24" height="24" :alt="item.label" />
            </div>
            <span class="itemLabel">{{ item.label }}</span>
          </div>
          <svg class="chevron" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </router-link>

        <!-- Download App -->
        <a v-if="apkDownloadUrl" :href="apkDownloadUrl" target="_blank" class="menuItem">
          <div class="menuItemLeft">
            <div class="iconBox" style="background-color: #E0F2FE;">
               <img src="https://img.icons8.com/color/96/android-os.png" width="24" height="24" alt="Download App" />
            </div>
            <span class="itemLabel" style="color: #0284c7; font-weight: 800;">Download App</span>
          </div>
          <svg class="chevron" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </a>

        <!-- Logout -->
        <button @click="handleLogout" class="menuItem logoutItem">
          <div class="menuItemLeft">
            <div class="iconBox logoutIcon">
               <img src="https://img.icons8.com/fluency/48/exit.png" width="20" height="20" />
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
const apkDownloadUrl = ref('')

async function fetchBalance() {
  if (!auth.user?.id) return
  try {
    const res = await walletApi.getUserHome(auth.user.id)
    if (res.data && res.data.length > 0) {
      userBalance.value = res.data[0].balance || 0
    }
    const settings = await walletApi.getSiteSettings()
    if (settings.data && settings.data.apkDownloadUrl) {
      apkDownloadUrl.value = settings.data.apkDownloadUrl
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
    if (item.label === 'API Docs' || item.label === 'Manage Games' || item.label === 'Global Dashboard') {
      return isAdmin.value
    }
    return true
  })
})

// Colorful Icons mapping
const icons = {
  agent: 'https://img.icons8.com/color/96/conference.png',
  salary: 'https://img.icons8.com/fluency/48/money-bag-euro.png',
  bonus: 'https://img.icons8.com/fluency/48/gift.png',
  invite: 'https://img.icons8.com/fluency/48/add-user-group-man-man.png',
  history: 'https://img.icons8.com/fluency/48/time-machine.png',
  envelope: 'https://img.icons8.com/color/96/filled-message.png',
  promotion: 'https://img.icons8.com/fluency/48/commercial.png',
  wallet: 'https://img.icons8.com/fluency/48/wallet.png',
  bank: 'https://img.icons8.com/fluency/48/bank.png',
  security: 'https://img.icons8.com/fluency/48/shield.png',
  info: 'https://img.icons8.com/fluency/48/info.png',
  help: 'https://img.icons8.com/fluency/48/help.png',
  code: 'https://img.icons8.com/fluency/48/code.png',
  dashboard: 'https://img.icons8.com/fluency/48/dashboard.png'
}

const tealBg = 'rgba(15, 118, 110, 0.08)'
const tealColor = '#0F766E'

const menuItems = [
  { label: 'Earning as an Agent', path: '/agent-earning', img: icons.agent, bg: '#E0F2FE' },
  { label: 'My Daily Salary', path: '/mySalary', img: icons.salary, bg: '#F0F9FF' },
  { label: 'My Invitation Bonus', path: '/invitationBonus', img: icons.bonus, bg: '#FEF3C7' },
  { label: 'Invite Friends', path: '/invite', img: icons.invite, bg: '#ECFDF5' },
  { label: 'Withdrawal History', path: '/withdrawalHistory', img: icons.history, bg: '#F1F5F9' },
  { label: 'Red Envelope', path: '/redenvelope', img: icons.envelope, bg: '#FEE2E2' },
  { label: 'My Promotion', path: '/mypromotion', img: icons.promotion, bg: '#E0E7FF' },
  { label: 'My Wallet', path: '/wallet', img: icons.wallet, bg: '#DCFCE7' },
  { label: 'My Bank', path: '/bank', img: icons.bank, bg: '#F3E8FF' },
  { label: 'Account Security', path: '/accountSecurity', img: icons.security, bg: '#F8FAFC' },
  { label: 'About Us', path: '/about-us', img: icons.info, bg: '#F1F5F9' },
  { label: 'Customer Service', path: '/help', img: icons.help, bg: '#FDF2F8' },
  { label: 'API Docs', path: '/api-docs', img: icons.code, bg: '#F1F5F9' },
  { label: 'Manage Games', path: '/admin/games', img: icons.security, bg: '#FFF7ED' },
  { label: 'Global Dashboard', path: '/masterAdmin', img: icons.dashboard, bg: '#F0FDFA' },
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
