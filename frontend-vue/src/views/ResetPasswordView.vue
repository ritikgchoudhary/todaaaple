<template>
  <div class="auth-page">
    <div class="card">
      <!-- Header / Title -->
      <div class="headerRow">
        <button @click="router.push('/login')" class="backBtn" aria-label="Back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <h1 class="title">Reset Password</h1>
        <div style="width: 24px"></div>
      </div>

      <form v-if="!validated" @submit.prevent="handleVerify" class="form" novalidate autocomplete="off">
        <!-- Mobile Number -->
        <div class="inputGroup">
          <label class="floatingLabel">Mobile Number</label>
          <div class="inputRow">
            <div class="startAdornment">
              <span class="prefix">+91</span>
            </div>
            <input
              v-model="form.phone"
              type="tel"
              maxlength="10"
              placeholder=" "
            />
          </div>
        </div>

        <!-- Verification Code -->
        <div class="otpFlex">
          <div class="inputGroup flex1">
            <label class="floatingLabel">Verification Code</label>
            <div class="inputRow">
              <div class="startAdornment">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <input
                v-model="form.code"
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

        <button type="submit" class="primaryBtn" :disabled="loader">
          <span v-if="loader" class="btnLoader"></span>
          <span v-else>Verify Identity</span>
        </button>
      </form>

      <form v-else @submit.prevent="handleSubmit" class="form" novalidate autocomplete="off">
        <!-- New Password -->
        <div class="inputGroup">
          <label class="floatingLabel">New Password</label>
          <div class="inputRow">
            <div class="startAdornment">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <input
              v-model="form.password"
              :type="showPass ? 'text' : 'password'"
              placeholder=" "
            />
            <div class="endAdornment" @click="showPass = !showPass">
              <svg v-if="!showPass" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22"/></svg>
            </div>
          </div>
        </div>

        <!-- Confirm Password -->
        <div class="inputGroup">
          <label class="floatingLabel">Confirm Password</label>
          <div class="inputRow">
            <div class="startAdornment">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <input
              v-model="form.confirm"
              :type="showPass ? 'text' : 'password'"
              placeholder=" "
            />
          </div>
        </div>

        <button type="submit" class="primaryBtn" :disabled="loader">
          <span v-if="loader" class="btnLoader"></span>
          <span v-else>Change Password</span>
        </button>
      </form>
    </div>

    <!-- Dialog -->
    <div v-if="dialog.open" class="dialogOverlay" @click="dialog.open = false">
      <div class="dialogCard" @click.stop>
        <div class="dialogHeader">
          <span class="dialogTitle">Notice</span>
          <button @click="dialog.open = false" class="closeBtn">×</button>
        </div>
        <p class="dialogBody">{{ dialog.body }}</p>
      </div>
    </div>

    <!-- Page Loader -->
    <div v-if="loader && !validated" class="pageLoader">
       <div class="spinner"></div>
       <p>Please wait...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import * as api from '../api/auth'

const router = useRouter()
const form = reactive({ phone: '', code: '', password: '', confirm: '' })
const loader = ref(false)
const validated = ref(false)
const showPass = ref(false)
const canRun = ref(false)
const counter = ref(90)
const dialog = reactive({ open: false, body: '' })

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
    dialog.body = "Please Enter Valid Number !"
    dialog.open = true
    return
  }
  counter.value = 90
  canRun.value = true
  api.sendOTP({ phone: phoneStr }).catch(() => {
    dialog.body = "Error sending OTP. Try again."
    dialog.open = true
  })
}

async function handleVerify() {
  if (!form.phone || !form.code) {
    dialog.body = "Please fill all fields!"
    dialog.open = true
    return
  }
  loader.value = true
  setTimeout(() => {
    validated.value = true
    loader.value = false
  }, 1000)
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

.headerRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.backBtn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
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