<template>
  <nav class="bottomNav">
    <router-link to="/account" class="navItem" :class="{ active: route.path === '/account' }">
      <img :src="route.path === '/account' ? 'https://img.bzvm68.com/site_common/H5_7_mobile/footer_icon/footer_account_active.png' : 'https://img.bzvm68.com/site_common/H5_7_mobile/footer_icon/footer_account.png'" alt="" class="navIconImg" />
      <span class="navLabel">Account</span>
    </router-link>
    <router-link to="/deposit" class="navItem" :class="{ active: route.path === '/deposit' }">
      <img src="https://img.bzvm68.com/site_common/H5_7_mobile/footer_icon/footer_deposit.png" alt="" class="navIconImg" />
      <span class="navLabel">Deposit</span>
    </router-link>
    <router-link to="/" class="navItem" :class="{ active: route.path === '/' }">
      <img :src="route.path === '/' ? 'https://img.bzvm68.com/site_common/H5_7_mobile/footer_icon/footer_home_active.png' : 'https://img.bzvm68.com/site_common/H5_7_mobile/footer_icon/footer_home.png'" alt="" class="navIconImg" />
      <span class="navLabel">Home</span>
    </router-link>
    <router-link to="/wingo/1" class="navItem" :class="{ active: route.path.startsWith('/wingo') }">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="navIconImg">
        <rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect>
        <path d="M6 12h4"></path>
        <path d="M8 10v4"></path>
        <path d="M15 13h.01"></path>
        <path d="M18 11h.01"></path>
      </svg>
      <span class="navLabel">Wingo</span>
    </router-link>
    <router-link to="/help" class="navItem" :class="{ active: route.path === '/help' }">
      <img src="https://img.bzvm68.com/site_common/H5_7_mobile/footer_icon/footer_customService.png" alt="" class="navIconImg" />
      <span class="navLabel">Help</span>
    </router-link>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<style scoped>
.bottomNav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: min(430px, 100vw);
  box-sizing: border-box;
  padding: 8px 0 max(8px, env(safe-area-inset-bottom));
  padding-left: max(12px, env(safe-area-inset-left));
  padding-right: max(12px, env(safe-area-inset-right));
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.08);
  z-index: 9999;
  border-top: 1px solid #f1f5f9;
}
.navItem {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  text-decoration: none;
  color: #666;
  font-size: 0.7rem;
  font-weight: 500;
  border-radius: 8px;
}
.navItem.active {
  color: #2563eb;
  font-weight: 700;
}
.navIconImg {
  width: 24px;
  height: 24px;
  object-fit: contain;
}
.navLabel {
  font-size: 0.7rem;
}
</style>
