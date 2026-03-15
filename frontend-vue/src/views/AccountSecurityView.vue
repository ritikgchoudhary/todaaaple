<template>
  <div class="security-page">
    <div class="mobileContainer">
      <!-- Header -->
      <header class="header">
        <svg @click="router.back()" class="backIcon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        <div class="headerTitle">Account Security</div>
      </header>

      <!-- Menu List -->
      <div class="menuList">
        <router-link v-for="item in securityItems" :key="item.path" :to="item.path" class="menuItem">
          <span class="label">{{ item.label }}</span>
          <svg class="chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const securityItems = [
  { label: 'Modify Name', path: '/accountSecurity/name' },
  { label: 'Modify Login Password', path: '/accountSecurity/password' },
  { label: 'Modify Payment Password', path: '/accountSecurity/payment' }
]
</script>

<style scoped>
.security-page { min-height: 100vh; background-color: #F1F5F9; display: flex; justify-content: center; font-family: var(--font-app); }
.mobileContainer { width: 100%; max-width: 500px; min-height: 100vh; background-color: #fff; position: relative; }

.header { background-color: #05c0b8; padding: 15px 20px; display: flex; align-items: center; position: sticky; top: 0; z-index: 100; }
.backIcon { cursor: pointer; color: white; }
.headerTitle { color: white; flex-grow: 1; text-align: center; font-weight: 600; font-size: 16px; margin-right: 20px; }

.menuList { margin-top: 10px; }
.menuItem { display: flex; align-items: center; justify-content: space-between; padding: 20px; text-decoration: none; color: #333; border-bottom: 1px solid #f0f0f0; transition: background 0.1s; }
.menuItem:active { background: #f9f9f9; }
.menuItem .label { font-size: 16px; }
.chevron { flex-shrink: 0; }
</style>
