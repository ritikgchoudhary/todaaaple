<template>
  <div class="page">
    <div class="bgImage" aria-hidden="true"></div>

    <div class="mobileContainer">
      <div class="head">
        <header class="header">
          <button type="button" class="backBtn" aria-label="Back" @click="router.push('/login')">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div class="logoWrap">
            <img :src="siteLogoUrl || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'" alt="Site Logo" class="headerLogo" />
          </div>
          <div class="langWrap">
            <div class="langInner">
              <span class="langFlag">🇮🇳</span>
              <span class="langText">EN</span>
              <svg class="chevronDown" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>
          </div>
        </header>
      </div>

      <div class="formPanel">
        <h2 class="formTitle">{{ !validated ? 'Verify Identity' : 'Change Password' }}</h2>
        
        <form v-if="!validated" class="form" @submit.prevent="handleVerify" noValidate autocomplete="off">
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
              <input v-model="form.phone" name="phone" type="tel" class="input inputPhone" placeholder="Enter phone" maxlength="10" />
            </div>
          </div>

          <div class="fieldBlock">
            <label class="fieldLabel">
              <span class="fieldLabelIcon accent"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg></span>
              Verification Code
            </label>
            <div class="verificationWrap">
              <div class="inputWrap flex1">
                <input v-model="form.code" name="code" type="tel" class="input" placeholder="OTP" maxlength="6" />
              </div>
              <button type="button" class="otpBtn" :disabled="canRun && counter > 0" @click="sendOTP">{{ canRun ? (counter === 0 ? 'Resend' : counter) : 'OTP' }}</button>
            </div>
          </div>

          <button type="submit" class="primaryBtn" :disabled="loader">
            <span v-if="loader" class="btnLoader"></span>
            <span v-else class="btnText">Verify Identity</span>
          </button>
        </form>

        <form v-else class="form" @submit.prevent="handleSubmit" noValidate autocomplete="off">
          <div class="fieldBlock">
            <label class="fieldLabel">
              <span class="fieldLabelIcon accent"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg></span>
              New Password
            </label>
            <div class="inputWrap">
              <input v-model="form.password" :type="showPass ? 'text' : 'password'" name="password" class="input" placeholder="New Password" />
              <button type="button" class="eyeBtn" @click="showPass = !showPass">
                <svg v-if="!showPass" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
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
              <input v-model="form.confirm" :type="showPass ? 'text' : 'password'" name="confirm" class="input" placeholder="Confirm Password" />
            </div>
          </div>

          <button type="submit" class="primaryBtn" :disabled="loader">
            <span v-if="loader" class="btnLoader"></span>
            <span v-else class="btnText">Change Password</span>
          </button>
        </form>
      </div>

      <!-- Logic for TOP, Loader, Dialog is standard -->
      <div v-if="dialog.open" class="dialogBackdrop" @click.self="dialog.open = false">
        <div class="dialogPaper">
          <div class="dialogHeader">
            <span class="dialogTitle">Notice</span>
            <button type="button" class="closeBtn" @click="dialog.open = false">×</button>
          </div>
          <p class="dialogBody">{{ dialog.body }}</p>
        </div>
      </div>

      <div v-if="loader && !validated" class="loaderOverlay">
        <div class="spinner"></div>
        <p>Please wait...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import * as api from '../api/auth'
import { getSiteSettings } from '../api/home'

const router = useRouter()
const form = reactive({ phone: '', code: '', password: '', confirm: '' })
const loader = ref(false)
const validated = ref(false)
const showPass = ref(false)
const canRun = ref(false)
const counter = ref(90)
const dialog = reactive({ open: false, body: '' })
const siteLogoUrl = ref('')

onMounted(async () => {
  try {
    const settingsRes = await getSiteSettings()
    if (settingsRes.data?.siteLogoUrl) {
      siteLogoUrl.value = settingsRes.data.siteLogoUrl
    }
  } catch (err) {
    console.error('Site settings fetch failed', err)
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

function sendOTP() {
  const phoneStr = String(form.phone).trim()
  if (phoneStr.length !== 10) {
    dialog.body = "Please Enter Valid 10-digit Number!"
    dialog.open = true
    return
  }
  counter.value = 90
  canRun.value = true
  api.sendOTP({ phone: phoneStr }).catch(() => {
    dialog.body = "Error sending OTP. Try again."
    dialog.open = true
    canRun.value = false
  })
}

async function handleVerify() {
  if (!form.phone || !form.code) {
    dialog.body = "Please fill all fields!"
    dialog.open = true
    return
  }
  loader.value = true
  // Mock validation or actual verification if api supports it
  setTimeout(() => {
    validated.value = true
    loader.value = false
  }, 800)
}

async function handleSubmit() {
  if (form.password !== form.confirm) {
    dialog.body = "Passwords do not match!"
    dialog.open = true
    return
  }
  loader.value = true
  try {
    await api.resetPassword({
      phone: form.phone,
      password: form.password,
      new: form.confirm,
      code: parseInt(form.code, 10) || 0
    })
    dialog.body = "Password Changed Successfully!"
    dialog.open = true
    setTimeout(() => router.push('/login'), 2000)
  } catch (err) {
    dialog.body = err.response?.data?.error || "Update failed!"
    dialog.open = true
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
  background: #f5f5f5;
  color: #1a1a1a;
  padding: 0;
  padding-left: max(20px, env(safe-area-inset-left));
  padding-right: max(20px, env(safe-area-inset-right));
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

.mobileContainer {
  width: 100%;
  max-width: 430px;
  height: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  margin: 0 auto;
  padding: 0 20px 24px;
  padding-left: max(20px, env(safe-area-inset-left));
  padding-right: max(20px, env(safe-area-inset-right));
  padding-top: env(safe-area-inset-top);
  padding-bottom: max(24px, env(safe-area-inset-bottom));
  box-sizing: border-box;
  position: relative;
  z-index: 1;
  background: #fff;
  overflow-y: auto;
}

.bgImage {
  display: none;
}

.head {
  position: relative;
  background: #fff;
  margin: 0 -20px 0;
  margin-left: calc(-1 * max(20px, env(safe-area-inset-left)));
  margin-right: calc(-1 * max(20px, env(safe-area-inset-right)));
  padding: 0 20px 0;
  padding-left: max(20px, env(safe-area-inset-left));
  padding-right: max(20px, env(safe-area-inset-right));
  padding-top: env(safe-area-inset-top);
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
  color: #000;
  width: 44px;
  height: 44px;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logoWrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.headerLogo {
  height: 36px;
  width: auto;
  object-fit: contain;
}

.langWrap {
  display: flex;
  align-items: center;
}

.langInner {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
}

.langFlag { font-size: 1.1rem; line-height: 1; }
.langText { font-size: 0.8rem; font-weight: 700; color: #334155; }
.chevronDown { color: #64748b; margin-left: 2px; }

.formPanel {
  padding: 16px 0;
}

.formTitle {
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 24px;
  text-align: center;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.fieldBlock { margin-bottom: 12px; }
.fieldLabel {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  font-size: 0.85rem;
  color: #475569;
  font-weight: 500;
}
.accent { color: #05c0b8; }
.fieldLabelIcon { display: flex; }

.phoneRow {
  display: flex;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}

.countryWrap {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 12px;
  background: #f1f5f9;
  border-right: 1px solid #e2e8f0;
}

.input {
  flex: 1;
  padding: 12px;
  border: none;
  background: transparent;
  font-size: 16px;
  outline: none;
  color: #0f172a;
}

.inputWrap {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding-right: 12px;
}

.verificationWrap {
  display: flex;
  gap: 10px;
}
.verificationWrap .inputWrap { flex: 1; padding-right: 0; }

.otpBtn {
  min-width: 80px;
  background: linear-gradient(135deg, #05c0b8 0%, #0d9488 100%);
  color: #fff;
  font-weight: 700;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}
.otpBtn:disabled { opacity: 0.6; cursor: not-allowed; }

.primaryBtn {
  margin-top: 10px;
  padding: 14px;
  background: linear-gradient(135deg, #05c0b8 0%, #0d9488 100%);
  color: #fff;
  font-weight: 700;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

.eyeBtn {
  background: none;
  border: none;
  color: #94a3b8;
  padding: 8px;
  display: flex;
  align-items: center;
}

.dialogBackdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000;
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.dialogPaper { background: #fff; border-radius: 12px; width: 100%; max-width: 340px; padding: 20px; }
.dialogHeader { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.dialogTitle { font-weight: 700; color: #000; }
.closeBtn { font-size: 24px; border: none; background: none; cursor: pointer; }

.loaderOverlay {
  position: fixed; inset: 0; background: rgba(255,255,255,0.8); z-index: 2000;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.spinner { width: 30px; height: 30px; border: 3px solid #f3f3f3; border-top: 3px solid #05c0b8; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 10px; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>