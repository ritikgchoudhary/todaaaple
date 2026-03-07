<template>
  <div class="auth-page">
    <div class="card">
      <!-- Tabs -->
      <div class="tabs">
        <button
          type="button"
          @click="isLogin = true"
          :class="['tab', { tabActive: isLogin }]"
        >
          Sign In
        </button>
        <span class="tabDivider">|</span>
        <button
          type="button"
          @click="isLogin = false"
          :class="['tab', { tabActive: !isLogin }]"
        >
          Register
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="form" novalidate autocomplete="off">
        <!-- Mobile / Account -->
        <div class="inputGroup">
          <label class="floatingLabel">Mobile number / Account</label>
          <div class="inputRow">
            <div class="startAdornment">
              <span v-if="!isLogin" class="prefix">+91</span>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <input
              v-model="formData.phone"
              type="tel"
              name="phone"
              maxlength="10"
              placeholder=" "
            />
          </div>
        </div>

        <!-- Password -->
        <div class="inputGroup">
          <label class="floatingLabel">Password</label>
          <div class="inputRow">
            <div class="startAdornment">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <input
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              name="password"
              placeholder=" "
            />
            <div class="endAdornment" @click="showPassword = !showPassword">
              <svg v-if="!showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22"/></svg>
            </div>
          </div>
        </div>

        <!-- Register-only: Confirm Password -->
        <div v-if="!isLogin" class="inputGroup">
          <label class="floatingLabel">Confirm Password</label>
          <div class="inputRow">
            <div class="startAdornment">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <input
              v-model="formData.cpassword"
              :type="showPassword ? 'text' : 'password'"
              name="cpassword"
              placeholder=" "
            />
          </div>
        </div>

        <!-- Register-only: OTP -->
        <div v-if="!isLogin" class="otpFlex">
          <div class="inputGroup flex1">
            <label class="floatingLabel">Verification Code</label>
            <div class="inputRow">
              <div class="startAdornment">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <input
                v-model="formData.code"
                type="tel"
                maxlength="6"
                placeholder=" "
              />
            </div>
          </div>
          <button
            type="button"
            class="otpBtn"
            :disabled="canRun"
            @click="sendOTP"
          >
            {{ canRun ? (counter === 0 ? "Resend" : counter) : "OTP" }}
          </button>
        </div>

        <!-- Register-only: Referral -->
        <div v-if="!isLogin" class="inputGroup">
          <label class="floatingLabel">Recommendation Code</label>
          <div class="inputRow">
            <div class="startAdornment">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
            </div>
            <input
              v-model="formData.referCode"
              type="text"
              name="referCode"
              placeholder=" "
            />
          </div>
        </div>

        <div v-if="isLogin" class="forgetRow">
          <router-link to="/resetPassword" class="forgetLink">
            Forgot Password?
          </router-link>
        </div>

        <button
          type="submit"
          class="primaryBtn"
          :disabled="loader"
        >
          <span v-if="loader" class="btnLoader"></span>
          <span v-else>{{ isLogin ? "Login" : "Register" }}</span>
        </button>

        <button
          type="button"
          class="secondaryBtn"
          @click="router.push('/')"
        >
          Back to Home
        </button>
      </form>
    </div>

    <!-- Dialogs -->
    <div v-if="openDialog" class="dialogOverlay" @click="openDialog = false">
      <div class="dialogCard" @click.stop>
        <div class="dialogHeader">
          <span class="dialogTitle">Notice</span>
          <button @click="openDialog = false" class="closeBtn">×</button>
        </div>
        <p class="dialogBody">{{ dialogBody }}</p>
      </div>
    </div>

    <!-- Page Loader -->
    <div v-if="loader" class="pageLoader">
       <div class="spinner"></div>
       <p>Please wait...</p>
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
  password: '',
  code: '',
  cpassword: '',
  referCode: route.params.id || route.query.r || '',
})

const isLogin = ref(true)
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

function sendOTP() {
  const phoneStr = String(formData.phone).trim()
  if (phoneStr.length !== 10) {
    dialogBody.value = "Please Enter Valid Number !"
    openDialog.value = true
    return
  }
  counter.value = 90
  canRun.value = true
  if (window.grecaptcha) {
    window.grecaptcha.ready(() => {
      window.grecaptcha.execute(SITE_KEY, { action: 'submit' }).then((token) => {
        axios.post(`${URL}/sendOTP`, { token, phone: phoneStr }).catch(console.error)
      })
    })
  }
}

async function handleSubmit() {
  loader.value = true
  try {
    if (isLogin.value) {
      const { data } = await api.signin(formData)
      if (data?.token) {
        authStore.setUser(data)
        router.push(route.query.redirect || '/')
      }
    } else {
      if (formData.password !== formData.cpassword) {
        throw new Error("Passwords do not match!")
      }
      const { data } = await api.signup(formData)
      if (data?.token) {
        authStore.setUser(data)
        router.push(route.query.redirect || '/')
      }
    }
  } catch (err) {
    dialogBody.value = err.response?.data?.error || err.message || 'Something went wrong.'
    openDialog.value = true
  }
  loader.value = false
}

onMounted(() => {
  const loggedInUser = localStorage.getItem('user')
  if (loggedInUser) {
    try {
      const foundUser = JSON.parse(loggedInUser)
      const AuthStr = 'Bearer ' + foundUser.token
      axios.get(`${URL}/getUser/${foundUser.result.id}`, { headers: { Authorization: AuthStr } })
        .then(() => router.push('/'))
        .catch(() => {})
    } catch (_) {}
  }

  if (!document.getElementById('recaptcha-key')) {
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`
    script.id = 'recaptcha-key'
    document.body.appendChild(script)
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

.auth-page {
  min-height: 100vh;
  background: linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  font-family: 'Outfit', sans-serif;
}

.card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.35);
  padding: 32px 28px 40px;
  box-sizing: border-box;
}

.tabs {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 28px;
  gap: 8px;
}
.tab {
  border: none;
  background: none;
  font-family: inherit;
  font-size: 17px;
  fontWeight: 500;
  color: #64748b;
  cursor: pointer;
  padding: 8px 4px;
  transition: color 0.2s;
}
.tabActive {
  color: #0f172a;
  font-weight: 700;
  border-bottom: 2px solid #0f172a;
}
.tabDivider {
  color: #cbd5e1;
  font-size: 18px;
  user-select: none;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.inputGroup {
  position: relative;
  display: flex;
  flex-direction: column;
}
.floatingLabel {
  font-size: 11px;
  color: #64748b;
  margin-bottom: 4px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.inputRow {
  display: flex;
  align-items: center;
  background-color: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0 12px;
  min-height: 52px;
  transition: all 0.2s;
}
.inputRow:focus-within {
  border-color: #0d9488;
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
}

.inputRow input {
  flex: 1;
  border: none;
  background: none;
  padding: 14px 0;
  font-size: 16px;
  font-family: inherit;
  color: #0f172a;
  outline: none;
}
.inputRow input::placeholder { color: #94a3b8; }

.startAdornment { margin-right: 12px; display: flex; align-items: center; }
.endAdornment { margin-left: 10px; cursor: pointer; display: flex; align-items: center; opacity: 0.7; }
.prefix { font-size: 15px; color: #64748b; font-weight: 600; }

.otpFlex { display: flex; gap: 8px; align-items: flex-end; }
.flex1 { flex: 1; }
.otpBtn {
  min-width: 72px;
  height: 52px;
  background: #0ea5e9;
  color: #fff;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  cursor: pointer;
}
.otpBtn:disabled { background: #cbd5e1; cursor: not-allowed; }

.forgetRow { text-align: right; margin-top: -4px; }
.forgetLink { font-size: 14px; color: #0ea5e9; text-decoration: none; font-weight: 500; }

.primaryBtn {
  margin-top: 8px;
  padding: 14px 24px;
  background: linear-gradient(90deg, #0d9488 0%, #0f766e 100%);
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(13, 148, 136, 0.4);
  transition: all 0.2s;
}
.primaryBtn:active { transform: translateY(1px); }
.primaryBtn:disabled { background: #cbd5e1; box-shadow: none; cursor: not-allowed; }

.secondaryBtn {
  padding: 12px 24px;
  background: #fff;
  border: 1px solid #e2e8f0;
  color: #64748b;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
}

.btnLoader { width: 22px; height: 22px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; }

.dialogOverlay {
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px;
}
.dialogCard {
  background: #fff; border-radius: 16px; padding: 24px; width: 100%; max-width: 360px;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
}
.dialogHeader { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.dialogTitle { font-weight: 700; font-size: 16px; color: #0f172a; }
.closeBtn { font-size: 24px; background: none; border: none; cursor: pointer; color: #64748b; line-height: 1; }
.dialogBody { font-size: 14px; color: #475569; line-height: 1.5; margin: 0; }

.pageLoader {
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.9); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 1000; color: #fff;
}
.spinner { width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.2); border-top: 3px solid #fff; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 12px; }

@keyframes spin { to { transform: rotate(360deg); } }
</style>
