<template>
  <div class="page">
    <div class="frame">
      <div class="header">
        <svg @click="router.back()" class="backIcon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        <div class="headerTitle">Customer Service</div>
      </div>

      <div style="padding-bottom: 20px;">
        <a :href="telegramLink || 'https://t.me/earningsource111'" class="section" target="_blank" rel="noopener noreferrer">
          <img src="/images/telegram.png" alt="Telegram Channel" class="iconImage" />
          <div class="textContainer">
            <div class="title">Telegram Channel</div>
            <div class="sub">Official Updates & News</div>
          </div>
          <button class="actionButton">Open</button>
        </a>

        <a :href="whatsappLink || 'https://whatsapp.com/channel/0029VaqXwZ1DOQIQesUykz12'" class="section" target="_blank" rel="noopener noreferrer">
          <img src="/images/whatsapp.png" alt="WhatsApp Channel" class="iconImage" />
          <div class="textContainer">
            <div class="title">WhatsApp Channel</div>
            <div class="sub">Join Our Community</div>
          </div>
          <button class="actionButton">Open</button>
        </a>

        <a :href="customerServiceLink || 'https://wa.me/message/6F6ZZQERITWCK1'" class="section" target="_blank" rel="noopener noreferrer">
          <img src="/images/customer-service.png" alt="Live Support" class="iconImage" />
          <div class="textContainer">
            <div class="title">Live Support</div>
            <div class="sub">Recharge & Withdrawal Help</div>
          </div>
          <button class="actionButton">Open</button>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { getSiteSettings } from '../api/home'

const router = useRouter()
const telegramLink = ref('')
const customerServiceLink = ref('')
const whatsappLink = ref('')

onMounted(async () => {
  try {
    const res = await getSiteSettings()
    telegramLink.value = res.data.telegramLink
    customerServiceLink.value = res.data.customerServiceLink
    whatsappLink.value = res.data.whatsappLink
  } catch (err) {}
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #F1F5F9;
  display: flex;
  justify-content: center;
  padding-bottom: calc(60px + env(safe-area-inset-bottom));
}

.frame {
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
  color: white;
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
  font-family: var(--font-app);
}

.section {
  padding: 15px;
  margin: 15px 15px 0;
  background-color: #fff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #f0f0f0;
  transition: transform 0.2s;
  cursor: pointer;
}

.section:active {
  transform: scale(0.98);
}

.iconImage {
  width: 45px;
  height: 45px;
  object-fit: contain;
  margin-right: 20px;
}

.textContainer {
  flex-grow: 1;
  font-family: var(--font-app);
}

.title {
  font-size: 16px;
  font-weight: 700;
  color: #333;
}

.sub {
  font-size: 13px;
  color: #05c0b8;
  margin-top: 2px;
  font-weight: 500;
}

.actionButton {
  background-color: rgba(5, 192, 184, 0.1);
  color: #05c0b8;
  text-transform: none;
  font-weight: 600;
  font-size: 12px;
  padding: 6px 16px;
  border-radius: 20px;
  min-width: auto;
  border: none;
  cursor: pointer;
  font-family: var(--font-app);
}
</style>
