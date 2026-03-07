<template>
  <div class="page">
    <div class="mobileContainer">
      <div class="head">
        <header class="header">
          <button type="button" class="backBtn" aria-label="Back" @click="router.push('/login')">
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

      <div class="formPanel">
        <h1 class="pageTitle">Reset Password</h1>
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
              <input v-model="form.phone" name="phone" type="tel" inputmode="numeric" class="input inputPhone" placeholder="8698232243" maxlength="15" />
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
          <div class="fieldBlock">
            <label class="fieldLabel">
              <span class="fieldLabelIcon accent"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg></span>
              New Password
            </label>
            <div class="inputWrap">
              <input v-model="form.password" :type="showPassword ? 'text' : 'password'" name="password" class="input" placeholder="Password" />
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
              <input v-model="form.newPass" :type="showPassword ? 'text' : 'password'" name="newPass" class="input" placeholder="Confirm Password" />
            </div>
          </div>
          <button type="submit" class="primaryBtn" :disabled="loader">
            <span v-if="loader" class="btnLoader"></span>
            <span v-else class="btnText">Reset Password</span>
          </button>
        </form>
        <div class="formFooter">
          <router-link to="/login" class="footerLink">
            <span class="footerIcon accent"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></span>
            <span>Back to Login</span>
          </router-link>
        </div>
      </div>
    </div>

    <div v-if="loader" class="loaderOverlay">
      <div class="spinner"></div>
      <p>Please wait...</p>
    </div>
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
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import * as api from '../api/auth'

const router = useRouter()
const form = reactive({ phone: '', code: '', password: '', newPass: '' })
const loader = ref(false)
const showPassword = ref(false)
const canRun = ref(false)
const counter = ref(90)
const openDialog = ref(false)
const dialogBody = ref('')
const SITE_KEY = '6Le-ej8mAAAAAL_Fl83Pp_iZ5ZLKpyQ8KWuTTF83'

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
  const phoneStr = String(form.phone).trim()
  if (phoneStr.length < 3) {
    dialogBody.value = 'Please enter a valid phone number.'
    openDialog.value = true
    return
  }
  counter.value = 90
  canRun.value = true
  if (typeof window !== 'undefined' && window.grecaptcha) {
    window.grecaptcha.ready(() => {
      window.grecaptcha.execute(SITE_KEY, { action: 'submit' }).then((token) => {
        api.sendOTP({ token, phone: phoneStr }).catch(() => {
          dialogBody.value = 'Could not send OTP. Try again.'
          openDialog.value = true
        })
      })
    })
  } else {
    api.sendOTP({ token: '', phone: phoneStr }).catch(() => {})
  }
}

async function handleSubmit(e) {
  e.preventDefault()
  if (form.password.length < 6) {
    dialogBody.value = 'Password must be at least 6 characters.'
    openDialog.value = true
    return
  }
  if (form.password !== form.newPass) {
    dialogBody.value = 'Passwords do not match.'
    openDialog.value = true
    return
  }
  loader.value = true
  openDialog.value = false
  try {
    await api.resetPassword({
      phone: form.phone,
      password: form.password,
      new: form.newPass,
      code: parseInt(form.code, 10) || 0,
    })
    dialogBody.value = 'Password reset successfully. You can now log in.'
    openDialog.value = true
    setTimeout(() => {
      openDialog.value = false
      router.push('/login')
    }, 2000)
  } catch (err) {
    dialogBody.value = err.response?.data?.message || err.response?.data?.error || 'Something went wrong.'
    openDialog.value = true
  }
  loader.value = false
}

onMounted(() => {
  if (!document.getElementById('recaptcha-key')) {
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`
    script.id = 'recaptcha-key'
    document.body.appendChild(script)
  }
})
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
.head {
  position: relative;
  background: #0a0a0c;
  margin: 0 -20px 0;
  margin-left: calc(-1 * max(20px, env(safe-area-inset-left)));
  margin-right: calc(-1 * max(20px, env(safe-area-inset-right)));
  padding: 0 20px 0;
  padding-left: max(20px, env(safe-area-inset-left));
  padding-right: max(20px, env(safe-area-inset-right));
  margin-bottom: 20px;
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
.backBtn:hover { opacity: 0.9; }
.logoWrap { flex: 1; display: flex; align-items: center; justify-content: center; }
.logoClub { color: #fff; font-size: 1.4rem; font-weight: 800; letter-spacing: 0.08em; }
.langWrap { display: flex; align-items: center; gap: 6px; color: #fff; font-size: 0.9rem; font-weight: 500; }

.pageTitle { margin: 0 0 16px; font-size: 1.25rem; font-weight: 700; color: #fff; }
.accent { color: #f59e0b; }
.fieldBlock { margin-bottom: 12px; }
.fieldLabel {
  display: flex; align-items: center; gap: 6px; margin-bottom: 6px;
  font-size: 0.85rem; color: #fff; font-weight: 500;
}
.fieldLabelIcon { display: flex; }
.fieldLabelIcon.accent { color: #f59e0b; }
.phoneRow {
  display: flex; align-items: stretch; gap: 0; min-height: 42px;
  background: rgba(45,45,52,0.8); border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px; overflow: hidden;
}
.countryWrap {
  display: flex; align-items: center; gap: 4px; padding: 0 12px; min-height: 42px; box-sizing: border-box;
  background: rgba(55,55,60,0.8); border-right: 1px solid rgba(255,255,255,0.1);
  color: #fff; font-size: 0.9rem;
}
.countryWrap svg { opacity: 0.7; flex-shrink: 0; }
.inputPhone {
  flex: 1; min-width: 0; min-height: 42px; padding: 0 12px; font-size: 15px;
  border-radius: 0; border: none; background: transparent; color: #fff; outline: none; box-sizing: border-box;
}
.inputPhone::placeholder { color: rgba(255,255,255,0.45); }
.verificationWrap {
  flex: 1; display: flex; align-items: stretch; gap: 10px;
}
.verificationWrap .inputWrap { min-height: 42px; }
.inputWrap {
  flex: 1; min-width: 0; display: flex; align-items: center; gap: 8px;
  background: rgba(45,45,52,0.6); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px; padding: 0 12px; min-height: 42px; box-sizing: border-box;
}
.inputWrap.flex1 { min-width: 0; }
.input {
  flex: 1; min-width: 0; border: none; background: none; color: #fff; font-size: 15px; outline: none;
}
.input::placeholder { color: rgba(255,255,255,0.45); }
.eyeBtn {
  flex-shrink: 0; background: none; border: none; color: rgba(255,255,255,0.6); cursor: pointer;
  padding: 4px; display: flex; align-items: center; justify-content: center;
}
.eyeBtn:hover { color: #fff; }
.otpBtn {
  min-width: 72px; min-height: 42px; padding: 0 12px;
  background: linear-gradient(135deg, #f59e0b 0%, #eab308 100%); color: #fff; font-weight: 600;
  font-size: 0.9rem; border: none; border-radius: 10px; cursor: pointer; flex-shrink: 0;
}
.otpBtn:hover:not(:disabled) { filter: brightness(1.05); }
.otpBtn:disabled { opacity: 0.6; cursor: not-allowed; }
.primaryBtn {
  margin-top: 4px; padding: 12px 20px;
  background: linear-gradient(135deg, #f59e0b 0%, #eab308 100%); color: #fff;
  font-size: 0.95rem; font-weight: 700; border: none; border-radius: 10px; cursor: pointer;
  display: flex; align-items: center; justify-content: center; min-height: 44px; width: 100%;
  box-shadow: 0 2px 12px rgba(245,158,11,0.3);
}
.primaryBtn:hover:not(:disabled) { filter: brightness(1.05); }
.primaryBtn:disabled { opacity: 0.8; cursor: wait; }
.formPanel { padding: 16px 16px 20px; box-sizing: border-box; }
.form { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
.formFooter {
  display: flex; justify-content: center; gap: 12px; margin-top: 16px; padding-top: 14px;
  border-top: 1px solid rgba(255,255,255,0.1);
}
.footerLink {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  color: rgba(255,255,255,0.85); font-size: 0.8rem; text-decoration: none;
}
.footerLink:hover { color: #fff; }
.footerIcon { display: flex; }
.footerIcon.accent { color: #f59e0b; }
.loaderOverlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 12px; z-index: 10; color: #fff;
}
.spinner {
  width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.3);
  border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.dialogBackdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center;
  padding: 20px; z-index: 10;
}
.dialogPaper {
  background: #1a1a1e; border-radius: 12px; padding: 20px; max-width: 340px; width: 100%;
  border: 1px solid rgba(255,255,255,0.1);
}
.dialogHeader { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.dialogTitle { font-size: 1rem; font-weight: 700; color: #fff; }
.closeBtn { background: none; border: none; color: #fff; font-size: 1.5rem; cursor: pointer; padding: 0 4px; }
.dialogBody { color: rgba(255,255,255,0.9); font-size: 0.9rem; line-height: 1.4; }
</style>
