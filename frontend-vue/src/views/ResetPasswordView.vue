<template>
  <div class="reset-page">
    <div class="decoration"></div>
    <div class="decoration2"></div>

    <div class="header">
      <button @click="router.push('/login')" class="backBtn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F172A" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <button class="backBtn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </button>
    </div>

    <div class="titleSection">
      <h1 class="title">Reset Password</h1>
    </div>

    <div class="card">
      <form v-if="!validated" @submit.prevent="handleVerify">
        <div class="inputGroup">
          <div class="iconHighlight">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B9B1" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
          </div>
          <input v-model="form.phone" type="number" placeholder="Mobile Number" />
        </div>

        <div class="inputGroup">
          <div class="iconHighlight">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B9B1" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </div>
          <input v-model="form.code" type="number" placeholder="Verification Code" />
          <button type="button" class="otpBtn" :disabled="canRun" @click="sendOTP">
            {{ canRun ? `${counter}s` : "Get OTP" }}
          </button>
        </div>

        <button type="submit" class="actionBtn" :disabled="loader">
          <span v-if="loader" class="btnLoader"></span>
          <span v-else>Verify Identity</span>
        </button>
      </form>

      <form v-else @submit.prevent="handleSubmit">
        <div class="inputGroup">
          <div class="iconHighlight">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B9B1" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          </div>
          <input v-model="form.password" :type="showPass ? 'text' : 'password'" placeholder="New Password" />
          <div @click="showPass = !showPass" class="eyeIcon">
            <svg v-if="!showPass" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><path d="M1 1l22 22"/></svg>
          </div>
        </div>

        <div class="inputGroup">
          <div class="iconHighlight">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B9B1" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          </div>
          <input v-model="form.confirm" :type="showPass ? 'text' : 'password'" placeholder="Confirm Password" />
        </div>

        <button type="submit" class="actionBtn" :disabled="loader">
          <span v-if="loader" class="btnLoader"></span>
          <span v-else>Change Password</span>
        </button>
      </form>
    </div>

    <!-- Dialog -->
    <div v-if="dialog.open" class="dialogOverlay" @click="dialog.open = false">
      <div class="dialogCard" @click.stop>
        <h3 class="dialogTitle">Notification</h3>
        <p class="dialogBody">{{ dialog.body }}</p>
        <button @click="dialog.open = false" class="dialogBtn">Got it</button>
      </div>
    </div>

    <!-- Page Loader -->
    <div v-if="loader && !validated" class="pageLoader">
       <div class="spinner"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
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
  if (String(form.phone).length !== 10) {
    dialog.body = "Please enter a valid 10-digit number!"
    dialog.open = true
    return
  }
  counter.value = 90
  canRun.value = true
  api.sendOTP({ phone: form.phone }).catch(() => {
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

.reset-page {
  min-height: 100vh;
  background-color: #F8FAFC;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Outfit', sans-serif;
  position: relative;
  overflow: hidden;
}

.decoration {
  position: absolute;
  top: -15%;
  right: -10%;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(16, 185, 177, 0.1) 0%, rgba(16, 185, 177, 0.05) 100%);
  z-index: 0;
}
.decoration2 {
  position: absolute;
  bottom: -10%;
  left: -15%;
  width: 250px;
  height: 250px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(16, 185, 177, 0.05) 0%, rgba(16, 185, 177, 0.1) 100%);
  z-index: 0;
}

.header {
  width: 100%;
  max-width: 500px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
  z-index: 10;
}

.backBtn {
  background-color: #fff;
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  cursor: pointer;
  transition: background 0.2s;
}
.backBtn:active { background-color: #F1F5F9; }

.titleSection { display: flex; flex-direction: column; align-items: center; margin-bottom: 40px; z-index: 10; }
.title { font-size: 2rem; font-weight: 800; color: #0F172A; margin: 15px 0 0; }

.card {
  width: 100%;
  max-width: 500px;
  flex: 1;
  background-color: #fff;
  border-top-left-radius: 40px;
  border-top-right-radius: 40px;
  padding: 40px 30px;
  box-shadow: 0 -10px 40px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  z-index: 5;
  box-sizing: border-box;
}

.inputGroup {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  background-color: #F8FAFC;
  border: 1px solid #F1F5F9;
  border-radius: 18px;
  padding: 0 14px;
  transition: all 0.3s ease;
}
.inputGroup:focus-within {
  border-color: #10B9B1;
  background-color: #fff;
  box-shadow: 0 0 0 4px rgba(16, 185, 177, 0.08);
}
.inputGroup input {
  flex: 1;
  border: none;
  background: none;
  padding: 18px 0;
  font-size: 1rem;
  font-weight: 500;
  outline: none;
  color: #0F172A;
}
.inputGroup input::placeholder { color: #94A3B8; }

.iconHighlight {
  background-color: rgba(16, 185, 177, 0.1);
  border-radius: 12px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.otpBtn {
  color: #10B9B1;
  font-weight: 700;
  background-color: rgba(16, 185, 177, 0.08);
  border: none;
  border-radius: 12px;
  padding: 8px 15px;
  font-size: 0.85rem;
  cursor: pointer;
}
.otpBtn:disabled { color: #94A3B8; cursor: not-allowed; }

.eyeIcon { cursor: pointer; padding: 10px; opacity: 0.7; }

.actionBtn {
  margin-top: 30px;
  width: 100%;
  background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
  color: #fff;
  border: none;
  padding: 18px;
  border-radius: 20px;
  font-weight: 800;
  font-size: 1.1rem;
  cursor: pointer;
  box-shadow: 0 15px 30px rgba(15, 23, 42, 0.2);
  transition: all 0.3s ease;
}
.actionBtn:active { transform: translateY(1px); }
.actionBtn:hover:not(:disabled) {
  background: #10B9B1;
  transform: translateY(-2px);
  box-shadow: 0 20px 40px rgba(16, 185, 177, 0.3);
}
.actionBtn:disabled { background: #CBD5E1; box-shadow: none; cursor: not-allowed; }

.btnLoader { width: 22px; height: 22px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; }

@keyframes spin { to { transform: rotate(360deg); } }

.dialogOverlay {
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px;
}
.dialogCard {
  background: #fff; border-radius: 25px; padding: 30px; width: 100%; max-width: 320px;
  text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.1);
}
.dialogTitle { font-size: 1.25rem; font-weight: 800; color: #10B9B1; margin: 0 0 12px; }
.dialogBody { color: #475569; line-height: 1.6; margin: 0 0 25px; }
.dialogBtn {
  width: 100%; background-color: #0F172A; color: #fff; border: none; border-radius: 15px;
  padding: 12px; font-weight: 800; cursor: pointer;
}

.pageLoader {
  position: fixed; inset: 0; background: rgba(255,255,255,0.7); display: flex; align-items: center; justify-content: center; z-index: 100;
}
.spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #10B9B1; border-radius: 50%; animation: spin 1s linear infinite; }
</style>
