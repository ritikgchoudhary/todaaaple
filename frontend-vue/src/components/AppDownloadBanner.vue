<template>
  <div v-if="visible" class="app-download-banner-wrap">
    <div class="app-download-banner">
      <button type="button" class="banner-close" aria-label="Close" @click="close">×</button>
      <div class="banner-brand">
        <img :src="siteLogoUrl || '/favicon.svg'" alt="" class="banner-logo" />
      </div>
      <button type="button" class="banner-download-btn" @click="onDownload">Download</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUiStore } from '../stores/ui'
import * as walletApi from '../api/wallet'

const BANNER_CLOSED_KEY = 'app_download_banner_closed'

const ui = useUiStore()
const visible = ref(false)
const siteLogoUrl = ref('')
const apkDownloadUrl = ref('')

function close() {
  visible.value = false
  try {
    sessionStorage.setItem(BANNER_CLOSED_KEY, '1')
  } catch (_) {}
}

function onDownload() {
  if (apkDownloadUrl.value) {
    window.open(apkDownloadUrl.value, '_blank')
  } else if (ui.installPrompt) {
    ui.triggerInstallPrompt()
  } else {
    alert("To install the App:\n\n1. Tap your browser's menu (3 dots or share button)\n2. Select 'Add to Home Screen'")
  }
}

onMounted(async () => {
  try {
    const closed = sessionStorage.getItem(BANNER_CLOSED_KEY)
    if (closed) return
    const res = await walletApi.getSiteSettings()
    if (res?.data?.siteLogoUrl) siteLogoUrl.value = res.data.siteLogoUrl
    if (res?.data?.apkDownloadUrl) apkDownloadUrl.value = res.data.apkDownloadUrl
    visible.value = true
  } catch (_) {
    visible.value = true
  }
})
</script>

<style scoped>
/* Same width as main content (mobile-container) and BottomNav */
.app-download-banner-wrap {
  width: 100%;
  max-width: min(430px, 100vw);
  margin: 0 auto;
  padding-top: env(safe-area-inset-top, 0);
}

.app-download-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.banner-close {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  font-size: 24px;
  line-height: 1;
  color: #000;
  cursor: pointer;
  padding: 0;
}

.banner-brand {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.banner-logo {
  height: 24px;
  width: auto;
  max-width: 52px;
  object-fit: contain;
}

.banner-download-btn {
  flex-shrink: 0;
  padding: 10px 20px;
  border: none;
  border-radius: 999px;
  background: #f97316;
  color: #1f2937;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.banner-download-btn:active {
  opacity: 0.9;
}
</style>
