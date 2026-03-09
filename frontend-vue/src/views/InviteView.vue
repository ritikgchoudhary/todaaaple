<template>
  <div class="invite-page">
    <div class="mobile-container">
      <!-- Sticky Header -->
      <header class="header">
        <div class="header-content">
          <router-link to="/account" class="back-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </router-link>
          <h1 class="header-title">Invite Friends</h1>
          <div class="header-placeholder"></div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="content">
        <!-- Banner Illustration -->
        <div class="banner">
          <div class="banner-overlay"></div>
          <div class="banner-text">
            <h2>Invite & Earn</h2>
            <p>Share the joy with friends and get unlimited rewards!</p>
          </div>
          <div class="banner-img">
             <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="white" stroke-width="0.5" stroke-dasharray="2 2"/><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="white" stroke-width="1.5"/><circle cx="8.5" cy="7" r="4" stroke="white" stroke-width="1.5"/><line x1="20" y1="8" x2="20" y2="14" stroke="white" stroke-width="1.5"/><line x1="23" y1="11" x2="17" y2="11" stroke="white" stroke-width="1.5"/></svg>
          </div>
        </div>

        <!-- Referral Link Card -->
        <div class="card link-card shadow-premium">
          <div class="card-header">
            <h3>My Referral Link</h3>
            <span class="reward-tag">Extra 10% Bonus</span>
          </div>
          <div class="link-box">
            <input type="text" :value="referralLink" readonly ref="linkInput" />
            <button @click="copyLink" class="copy-btn">
              <span v-if="!copied">Copy</span>
              <span v-else class="copied-text">Copied!</span>
            </button>
          </div>
          <p class="hint">Your unique link to invite friends directly.</p>
        </div>

        <!-- Invitation Details -->
        <div class="info-section">
          <h3>How it works</h3>
          <div class="steps">
            <div class="step">
              <div class="step-num">1</div>
              <div class="step-content">
                <h4>Share your link</h4>
                <p>Send your referral link or QR code to your friends.</p>
              </div>
            </div>
            <div class="step">
              <div class="step-num">2</div>
              <div class="step-content">
                <h4>Friends register</h4>
                <p>Your friends sign up using your unique referral code.</p>
              </div>
            </div>
            <div class="step">
              <div class="step-num">3</div>
              <div class="step-content">
                <h4>Get rewarded</h4>
                <p>Enjoy lifelong commission and instant bonuses on their activity.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- QR Code Placeholder (Styled UI) -->
        <div class="card qr-card glass-card">
          <h3>Personal QR Code</h3>
          <div class="qr-box">
            <div class="qr-placeholder">
              <svg width="150" height="150" viewBox="0 0 24 24" fill="none" stroke="#05c0b8" stroke-width="1"><path d="M3 3h4v4H3zM17 3h4v4h-4zM3 17h4v4H3zM14 14h3M17 17h3M14 17h1M20 14h1M14 20h7M10 10h1M10 14h1M14 10h1M17 10h1M20 10h1"/><path d="M7 3v4M3 7h4M21 7h-4M17 3v4M7 17v4M3 17h4"/></svg>
            </div>
          </div>
          <p class="qr-hint">Scan this QR code to register instantly.</p>
        </div>
      </main>

      <!-- Toast Notification -->
      <Transition name="fade">
        <div v-if="copied" class="toast">
          Link copied to clipboard!
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const copied = ref(false)
const linkInput = ref(null)

const referralLink = computed(() => {
  const baseUrl = window.location.origin
  const userId = auth.user?.id || ''
  return `${baseUrl}/login/${userId}`
})

const copyLink = () => {
  if (linkInput.value) {
    linkInput.value.select()
    document.execCommand('copy')
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}
</script>

<style scoped>
.invite-page {
  min-height: 100vh;
  background-color: #f8fafc;
  display: flex;
  justify-content: center;
  font-family: 'Inter', sans-serif;
}

.mobile-container {
  width: 100%;
  max-width: min(430px, 100vw);
  background-color: #fff;
  min-height: 100vh;
  position: relative;
}

/* Header */
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #f1f5f9;
}

.header-content {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.back-link {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  text-decoration: none;
}

.header-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
}
.header-placeholder { width: 40px; }

/* Banner */
.banner {
  margin: 16px;
  background: linear-gradient(135deg, #05c0b8 0%, #0d9488 100%);
  border-radius: 20px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 140px;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at top right, rgba(255,255,255,0.2), transparent);
}

.banner-text {
  position: relative;
  z-index: 1;
  color: white;
  max-width: 60%;
}

.banner-text h2 {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0 0 4px 0;
}

.banner-text p {
  font-size: 0.85rem;
  opacity: 0.9;
  line-height: 1.4;
  margin: 0;
}

.banner-img {
  position: relative;
  z-index: 1;
  opacity: 0.8;
}

/* Cards */
.card {
  margin: 16px;
  padding: 20px;
  border-radius: 20px;
  background: #fff;
  border: 1px solid #f1f5f9;
}

.link-card {
  margin-top: -30px;
  position: relative;
  z-index: 2;
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-header h3 {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.reward-tag {
  font-size: 0.7rem;
  font-weight: 800;
  color: #0d9488;
  background: #f0fdfa;
  padding: 4px 10px;
  border-radius: 8px;
  text-transform: uppercase;
}

.link-box {
  display: flex;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 4px;
  gap: 4px;
}

.link-box input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 8px 12px;
  font-size: 0.85rem;
  color: #64748b;
  outline: none;
}

.copy-btn {
  background: #0d9488;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-btn:active { transform: scale(0.95); }

.copied-text { font-weight: 700; }

.hint {
  font-size: 0.75rem;
  color: #94a3b8;
  margin: 12px 0 0 0;
  text-align: center;
}

/* Info Section */
.info-section {
  padding: 0 20px;
  margin-top: 8px;
}

.info-section h3 {
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 16px;
}

.steps {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.step {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.step-num {
  width: 28px;
  height: 28px;
  background: #05c0b8;
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.85rem;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(5, 192, 184, 0.3);
}

.step-content h4 {
  font-size: 0.9rem;
  font-weight: 700;
  color: #334155;
  margin: 0 0 4px 0;
}

.step-content p {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

/* QR Card */
.qr-card {
  text-align: center;
  background: #fff;
  border: 1px solid #f1f5f9;
}

.qr-card h3 {
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 16px;
}

.qr-box {
  display: flex;
  justify-content: center;
  padding: 16px;
}

.qr-placeholder {
  width: 180px;
  height: 180px;
  background: #f8fafc;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #e2e8f0;
}

.qr-hint {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-top: 12px;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 23, 42, 0.9);
  color: white;
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  z-index: 1000;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
