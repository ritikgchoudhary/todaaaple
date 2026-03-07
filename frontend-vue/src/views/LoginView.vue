<template>
  <div class="page">
    <!-- Background image (full viewport) -->
    <div class="bgImage" aria-hidden="true"></div>

    <!-- Main content: mobile-width container on all screen sizes -->
    <div class="mobileContainer">
    <!-- Head: dark solid background (image match) -->
    <div class="head">
      <header class="header">
        <button type="button" class="backBtn" aria-label="Back" @click="router.push('/')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div class="logoWrap">
          <span class="logoClub">CLUB</span>
        </div>
        <div class="langWrap">
          <span class="langFlag" aria-hidden="true">&#127482;&#127480;</span>
          <span class="langText">EN</span>
        </div>
      </header>
    </div>

    <!-- Tabs: always visible for both Login and Register -->
    <div class="tabsWrap">
      <div class="tabs">
        <button type="button" :class="['tab', { tabActive: isLogin }]" @click="isLogin = true">
          <span class="tabIcon" :class="{ accent: isLogin }">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
          </span>
          <span class="tabLabel">Login</span>
        </button>
        <button type="button" :class="['tab', { tabActive: !isLogin }]" @click="isLogin = false">
          <span class="tabIcon" :class="{ accent: !isLogin }">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
          </span>
          <span class="tabLabel">Register</span>
        </button>
      </div>
    </div>

    <!-- Log in panel -->
    <div v-if="isLogin" class="formPanel">
      <form class="form" @submit.prevent="handleSubmit" noValidate autocomplete="off">
        <div class="fieldBlock">
          <label class="fieldLabel">
            <span class="fieldLabelIcon accent"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg></span>
            Phone number
          </label>
          <div class="phoneRow">
            <div class="countryWrap">
              <span class="countryCode">+91</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
            </div>
            <input v-model="formData.phone" name="phone" type="tel" inputmode="numeric" autocomplete="tel" class="input inputPhone" placeholder="8698232243" maxlength="15" />
          </div>
        </div>
        <div class="fieldBlock">
          <label class="fieldLabel">
            <span class="fieldLabelIcon accent"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg></span>
            Password
          </label>
          <div class="inputWrap">
            <input v-model="formData.password" :type="showPassword ? 'text' : 'password'" name="password" class="input" placeholder="Password" />
            <button type="button" class="eyeBtn" @click="showPassword = !showPassword" aria-label="toggle password">
              <svg v-if="!showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><path d="M1 1l22 22"/></svg>
            </button>
          </div>
        </div>
        <button type="submit" class="primaryBtn" :disabled="loader">
          <span v-if="loader" class="btnLoader"></span>
          <span v-else class="btnText">Log in</span>
        </button>
        <button type="button" class="registerBtn" @click="isLogin = false">Register</button>
      </form>
      <div class="formFooter">
        <router-link to="/resetPassword" class="footerLink">
          <span class="footerIcon accent"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg></span>
          <span>Forgot password</span>
        </router-link>
        <a href="#" class="footerLink" @click.prevent>
          <span class="footerIcon accent"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></span>
          <span>Customer Service</span>
        </a>
      </div>
    </div>

    <!-- Register panel (same UI as Login) -->
    <div v-if="!isLogin" class="formPanel">
      <form class="form" @submit.prevent="handleSubmit" noValidate autocomplete="off">
        <div class="fieldBlock">
          <label class="fieldLabel">
            <span class="fieldLabelIcon accent"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg></span>
            Phone number
          </label>
          <div class="phoneRow">
            <div class="countryWrap">
              <span class="countryCode">+91</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
            </div>
            <input v-model="formData.phone" name="phone" type="tel" inputmode="numeric" class="input inputPhone" placeholder="8698232243" maxlength="15" />
          </div>
        </div>
        <div class="fieldBlock">
          <label class="fieldLabel">
            <span class="fieldLabelIcon accent"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg></span>
            Verification Code
          </label>
          <div class="verificationWrap registerVerification">
            <div class="inputWrap flex1">
              <input v-model="formData.code" name="code" type="tel" class="input" placeholder="OTP" maxlength="6" />
            </div>
            <button type="button" class="otpBtn" :disabled="canRun && counter > 0" @click="sendOTP">{{ canRun ? (counter === 0 ? 'Resend' : counter) : 'OTP' }}</button>
          </div>
        </div>
        <div class="fieldBlock">
          <label class="fieldLabel">
            <span class="fieldLabelIcon accent"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg></span>
            Password
          </label>
          <div class="inputWrap">
            <input v-model="formData.password" :type="showPassword ? 'text' : 'password'" name="password" class="input" placeholder="Password" />
            <button type="button" class="eyeBtn" @click="showPassword = !showPassword" aria-label="toggle password">
              <svg v-if="!showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><path d="M1 1l22 22"/></svg>
            </button>
          </div>
        </div>
        <div class="fieldBlock">
          <label class="fieldLabel">
            <span class="fieldLabelIcon accent"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg></span>
            Confirm Password
          </label>
          <div class="inputWrap">
            <input v-model="formData.cpassword" :type="showPassword ? 'text' : 'password'" name="cpassword" class="input" placeholder="Enter Password" />
          </div>
        </div>
        <div class="fieldBlock">
          <label class="fieldLabel">
            <span class="fieldLabelIcon accent"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg></span>
            Recommendation Code
          </label>
          <input v-model="formData.referCode" name="referCode" type="text" class="input" placeholder="Optional" />
        </div>
        <button type="submit" class="primaryBtn" :disabled="loader">
          <span v-if="loader" class="btnLoader"></span>
          <span v-else class="btnText">Sign up</span>
        </button>
        <button type="button" class="registerBtn outlineOnly" @click="isLogin = true">Log in</button>
      </form>
      <div class="formFooter">
        <router-link to="/resetPassword" class="footerLink">
          <span class="footerIcon accent"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg></span>
          <span>Forgot password</span>
        </router-link>
        <a href="#" class="footerLink" @click.prevent>
          <span class="footerIcon accent"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></span>
          <span>Customer Service</span>
        </a>
      </div>
    </div>

    <!-- TOP button -->
    <button type="button" class="topBtn" aria-label="Scroll to top" @click="scrollTop">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 15l-6-6-6 6"/></svg>
      <span>TOP</span>
    </button>

    <!-- Loader -->
    <div v-if="loader" class="loaderOverlay">
      <div class="spinner"></div>
      <p>Please wait...</p>
    </div>

    <!-- Error dialog -->
    <div v-if="openDialog" class="dialogBackdrop" @click.self="openDialog = false">
      <div class="dialogPaper">
        <div class="dialogHeader">
          <span class="dialogTitle">Notice</span>
          <button type="button" class="closeBtn" @click="openDialog = false">×</button>
        </div>
        <p class="dialogBody">{{ dialogBody }}</p>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import * as api from '../api/auth'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const URL = api.url

const formData = reactive({
  phone: '',
  email: '',
  password: '',
  code: '',
  cpassword: '',
  referCode: route.params.id || '',
})

const isLogin = ref(true)
const loginMode = ref('phone')
const loader = ref(false)
const showPassword = ref(false)
const canRun = ref(false)
const counter = ref(90)
const openDialog = ref(false)
const dialogBody = ref('')

const SITE_KEY = '6Le-ej8mAAAAAL_Fl83Pp_iZ5ZLKpyQ8KWuTTF83'

function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function toggleLang() {
  // Language dropdown placeholder
}

onMounted(() => {
  if (route.params.id) formData.referCode = route.params.id
  const loggedInUser = localStorage.getItem('user')
  if (loggedInUser) {
    try {
      const foundUser = JSON.parse(loggedInUser)
      const AuthStr = 'Bearer ' + foundUser.token
      axios
        .get(`${URL}/getUser/${foundUser.result.id}`, { headers: { Authorization: AuthStr } })
        .then(() => router.push('/'))
        .catch(() => router.push('/login'))
    } catch (_) {}
  }
  if (!document.getElementById('recaptcha-key')) {
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`
    script.id = 'recaptcha-key'
    document.body.appendChild(script)
  }
})

let timerId
watch([canRun, counter], () => {
  if (timerId) clearTimeout(timerId)
  if (canRun.value && counter.value > 0) {
    timerId = setTimeout(() => {
      counter.value--
      if (counter.value === 0) canRun.value = false
    }, 1000)
  }
})

function sendOTP(e) {
  e?.preventDefault()
  const phoneStr = String(formData.phone).trim()
  if (phoneStr.length < 3) {
    dialogBody.value = 'Please enter a valid username / number.'
    openDialog.value = true
    return
  }
  counter.value = 90
  canRun.value = true
  if (typeof window !== 'undefined' && window.grecaptcha) {
    window.grecaptcha.ready(() => {
      window.grecaptcha.execute(SITE_KEY, { action: 'submit' }).then((token) => {
        axios.post(`${URL}/sendOTP`, { token, phone: phoneStr }).catch(console.error)
      })
    })
  }
}

async function handleSubmit(e) {
  e.preventDefault()
  loader.value = true
  openDialog.value = false
  try {
    if (isLogin.value) {
      const { data } = await api.signin(formData)
      if (data?.token) {
        authStore.setUser(data)
        router.push(route.query.redirect || '/')
      }
    } else {
      const { data } = await api.signup(formData)
      if (data?.token) {
        authStore.setUser(data)
        router.push(route.query.redirect || '/')
      }
    }
  } catch (err) {
    dialogBody.value = err.response?.data?.error || 'Something went wrong.'
    openDialog.value = true
  }
  loader.value = false
}
</script>

<style scoped>
.page {
  height: 100vh;
  height: 100dvh;
  width: 100%;
  max-width: 100vw;
  margin: 0 auto;
  background: #fff;
  color: #fff;
  padding: 0;
  padding-left: max(20px, env(safe-area-inset-left));
  padding-right: max(20px, env(safe-area-inset-right));
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

/* Container: full height, phone width, black background */
.mobileContainer {
  width: 100%;
  max-width: 430px;
  height: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  margin: 0 auto;
  padding: 20px 20px 24px;
  padding-left: max(20px, env(safe-area-inset-left));
  padding-right: max(20px, env(safe-area-inset-right));
  padding-top: max(20px, env(safe-area-inset-top));
  padding-bottom: max(24px, env(safe-area-inset-bottom));
  box-sizing: border-box;
  position: relative;
  z-index: 1;
  background: #000;
  overflow-y: auto;
}

.bgImage {
  display: none;
}

.bgImage::after {
  display: none;
}

/* Head: very dark solid strip (no transparency) */
.head {
  position: relative;
  background: #0a0a0c;
  margin: 0 -20px 0;
  margin-left: calc(-1 * max(20px, env(safe-area-inset-left)));
  margin-right: calc(-1 * max(20px, env(safe-area-inset-right)));
  padding: 0 20px 0;
  padding-left: max(20px, env(safe-area-inset-left));
  padding-right: max(20px, env(safe-area-inset-right));
  margin-bottom: 24px;
}

.header {
  display: flex;
  align-items: center;
  padding: 12px 0 16px;
}

.backBtn {
  background: none;
  border: none;
  color: #fff;
  width: 44px;
  height: 44px;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.backBtn:hover {
  opacity: 0.9;
}

.logoWrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.logoClub {
  color: #fff;
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.langWrap {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 500;
}
.langFlag { font-size: 1rem; }

.tabsWrap {
  width: 100%;
}
.tabs {
  display: flex;
  gap: 0;
  margin: 12px 0 16px;
  border-bottom: 1px solid rgba(255,255,255,0.2);
}

.tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: rgba(255,255,255,0.6);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 6px 10px;
  position: relative;
  transition: color 0.2s;
}
.tab:hover {
  color: rgba(255,255,255,0.9);
}
.tab.tabActive {
  color: #f59e0b;
  font-weight: 600;
}
.tab.tabActive .tabIcon { color: #f59e0b; }
.tab.tabActive::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 2px;
  background: #f59e0b;
}
.tabIcon {
  color: rgba(255,255,255,0.6);
  display: flex;
  transition: color 0.2s;
}
.tabIcon.accent { color: #f59e0b; }
.tabLabel { white-space: nowrap; }

.accent { color: #f59e0b; }
.fieldBlock { margin-bottom: 12px; }
.fieldLabel {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  font-size: 0.85rem;
  color: #fff;
  font-weight: 500;
}
.fieldLabelIcon { display: flex; }
.fieldLabelIcon.accent { color: #f59e0b; }
.phoneRow {
  display: flex;
  align-items: stretch;
  gap: 0;
  min-height: 42px;
  background: rgba(45,45,52,0.8);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  overflow: hidden;
}
.countryWrap {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 12px;
  min-height: 42px;
  box-sizing: border-box;
  background: rgba(55,55,60,0.8);
  border-right: 1px solid rgba(255,255,255,0.1);
  color: #fff;
  font-size: 0.9rem;
}
.countryWrap svg { opacity: 0.7; flex-shrink: 0; }
.inputPhone {
  flex: 1;
  min-width: 0;
  min-height: 42px;
  padding: 0 12px;
  font-size: 15px;
  border-radius: 0;
  border: none;
  background: transparent;
  color: #fff;
  outline: none;
  box-sizing: border-box;
}
.inputPhone::placeholder {
  color: rgba(255,255,255,0.45);
}
.formFooter {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid rgba(255,255,255,0.1);
}
.footerLink {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: rgba(255,255,255,0.85);
  font-size: 0.8rem;
  text-decoration: none;
}
.footerLink:hover { color: #fff; }
.footerIcon { display: flex; }
.footerIcon.accent { color: #f59e0b; }

.formPanel {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: min(440px, 100%);
  margin: 0 auto;
  padding: 16px 16px 20px;
  box-sizing: border-box;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.fieldRow {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.fieldRow .label {
  flex-shrink: 0;
  width: 100px;
  font-size: 0.95rem;
  color: #fff;
  font-weight: 500;
}

.inputWrap {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(45,45,52,0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  padding: 0 12px;
  min-height: 42px;
  box-sizing: border-box;
}
.inputWrapPhone .inputIcon {
  color: rgba(255,255,255,0.5);
  display: flex;
  flex-shrink: 0;
}
.inputWrap.flex1 {
  min-width: 0;
}

.input {
  flex: 1;
  min-width: 0;
  border: none;
  background: none;
  color: #fff;
  font-size: 15px;
  outline: none;
}
.input::placeholder {
  color: rgba(255,255,255,0.45);
}

/* Responsive: mobile container & phone field */
@media (max-width: 600px) {
  .mobileContainer { padding: 0 16px; padding-left: max(16px, env(safe-area-inset-left)); padding-right: max(16px, env(safe-area-inset-right)); }
  .head { margin-left: calc(-1 * max(16px, env(safe-area-inset-left))); margin-right: calc(-1 * max(16px, env(safe-area-inset-right))); padding: 0 16px; padding-left: max(16px, env(safe-area-inset-left)); padding-right: max(16px, env(safe-area-inset-right)); margin-bottom: 20px; }
  .formPanel { padding: 20px 16px 24px; width: 100%; }
  .fieldRow { gap: 12px; }
  .fieldRow .label { width: 90px; font-size: 0.9rem; }
  .inputWrap { min-height: 42px; padding: 0 12px; gap: 6px; border-radius: 10px; }
  .inputWrapPhone .inputIcon { padding: 2px 0; }
  .input { font-size: 16px; }
}
@media (max-width: 480px) {
  .mobileContainer { padding: 0 12px; padding-left: max(12px, env(safe-area-inset-left)); padding-right: max(12px, env(safe-area-inset-right)); }
  .head { margin-left: calc(-1 * max(12px, env(safe-area-inset-left))); margin-right: calc(-1 * max(12px, env(safe-area-inset-right))); padding: 0 12px; padding-left: max(12px, env(safe-area-inset-left)); padding-right: max(12px, env(safe-area-inset-right)); margin-bottom: 16px; }
  .header { padding: 10px 0 12px; }
  .logoIcon { width: 36px; height: 36px; }
  .logoDeltin { font-size: 1.3rem; }
  .logoSport { font-size: 0.6rem; }
  .logoSeven { font-size: 1.5rem; }
  .formPanel { padding: 18px 12px 22px; }
  .form { gap: 16px; }
  .fieldRow { gap: 10px; flex-wrap: nowrap; align-items: center; }
  .fieldRow .label { width: 82px; font-size: 0.875rem; }
  .inputWrap { min-height: 40px; padding: 0 10px; border-radius: 8px; }
  .input { font-size: 16px; }
  .forgetRow span { width: 82px; }
}
@media (max-width: 360px) {
  .mobileContainer { padding: 0 10px; padding-left: max(10px, env(safe-area-inset-left)); padding-right: max(10px, env(safe-area-inset-right)); }
  .head { margin-left: calc(-1 * max(10px, env(safe-area-inset-left))); margin-right: calc(-1 * max(10px, env(safe-area-inset-right))); padding: 0 10px; padding-left: max(10px, env(safe-area-inset-left)); padding-right: max(10px, env(safe-area-inset-right)); margin-bottom: 14px; }
  .backBtn { width: 40px; height: 40px; }
  .logoWrap { gap: 6px; }
  .logoIcon { width: 32px; height: 32px; }
  .logoDeltin { font-size: 1.15rem; }
  .logoSport { font-size: 0.55rem; letter-spacing: 0.15em; }
  .logoSeven { font-size: 1.3rem; }
  .tab { padding: 10px 6px 12px; font-size: 0.95rem; }
  .formPanel { padding: 16px 10px 20px; }
  .fieldRow { gap: 8px; }
  .fieldRow .label { width: 72px; font-size: 0.85rem; }
  .inputWrap { min-height: 40px; padding: 0 10px; gap: 6px; }
  .inputWrapPhone .inputIcon svg { width: 16px; height: 16px; }
  .input { font-size: 16px; }
  .forgetRow span { width: 72px; }
  .forgetLink { font-size: 0.8rem; }
}

.eyeBtn {
  flex-shrink: 0;
  background: none;
  border: none;
  color: rgba(255,255,255,0.6);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.eyeBtn:hover {
  color: #fff;
}

.forgetRow {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: -8px;
}
.forgetRow span {
  width: 100px;
  flex-shrink: 0;
}
.forgetLink {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.7);
  text-decoration: none;
}
.forgetLink:hover {
  color: #f97316;
  text-decoration: underline;
}

.verificationWrap {
  flex: 1;
  display: flex;
  align-items: stretch;
  gap: 10px;
}
.registerVerification .inputWrap {
  min-height: 42px;
}
.otpRow .label {
  width: 100px;
}
.otpBtn {
  min-width: 72px;
  min-height: 42px;
  padding: 0 12px;
  background: linear-gradient(135deg, #f59e0b 0%, #eab308 100%);
  color: #fff;
  font-weight: 600;
  font-size: 0.9rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  flex-shrink: 0;
}
.otpBtn:hover:not(:disabled) {
  filter: brightness(1.05);
}
.otpBtn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.fieldBlock > .input {
  width: 100%;
  min-height: 42px;
  padding: 0 12px;
  background: rgba(45,45,52,0.8);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  color: #fff;
  font-size: 15px;
  outline: none;
  box-sizing: border-box;
}
.fieldBlock > .input::placeholder {
  color: rgba(255,255,255,0.45);
}

.primaryBtn {
  margin-top: 4px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #f59e0b 0%, #eab308 100%);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  width: 100%;
  box-shadow: 0 2px 12px rgba(245,158,11,0.3);
}
.primaryBtn:hover:not(:disabled) {
  filter: brightness(1.05);
}
.primaryBtn:disabled {
  opacity: 0.8;
  cursor: wait;
}

.registerBtn {
  margin-top: 8px;
  padding: 10px 20px;
  background: transparent;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  border: 2px solid #f59e0b;
  border-radius: 10px;
  cursor: pointer;
  width: 100%;
  min-height: 42px;
}
.registerBtn:hover {
  background: rgba(245,158,11,0.15);
}
.registerBtn.outlineOnly {
  border-color: rgba(255,255,255,0.4);
}
.registerBtn.outlineOnly:hover {
  background: rgba(255,255,255,0.08);
}

.btnLoader {
  width: 22px;
  height: 22px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
.btnText {
  display: block;
}

.topBtn {
  position: fixed;
  bottom: 24px;
  right: 20px;
  z-index: 11;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #fff;
  color: #1a1a1a;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 700;
  box-shadow: 0 4px 20px rgba(0,0,0,0.25);
  transition: transform 0.2s, box-shadow 0.2s;
}
.topBtn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0,0,0,0.3);
}

.topBtn svg {
  margin-bottom: 2px;
}

.loaderOverlay {
  position: fixed;
  inset: 0;
  background: rgba(12,12,14,0.9);
  backdrop-filter: blur(6px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.spinner {
  width: 44px;
  height: 44px;
  border: 3px solid rgba(255,255,255,0.2);
  border-top-color: #f97316;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loaderOverlay p {
  margin-top: 12px;
  color: #fff;
}

.dialogBackdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9998;
  padding: 16px;
}

.dialogPaper {
  background: rgba(30,30,34,0.98);
  backdrop-filter: blur(12px);
  color: #fff;
  border-radius: 20px;
  max-width: 360px;
  width: 100%;
  padding: 24px 28px;
  border: 1px solid rgba(255,255,255,0.12);
  box-shadow: 0 24px 48px rgba(0,0,0,0.4);
}

.dialogHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.dialogTitle {
  font-weight: 600;
  font-size: 1rem;
}

.closeBtn {
  border: none;
  background: none;
  color: rgba(255,255,255,0.7);
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
  padding: 0 4px;
}

.dialogBody {
  color: rgba(255,255,255,0.85);
  font-size: 0.9rem;
  margin: 0;
}
</style>
