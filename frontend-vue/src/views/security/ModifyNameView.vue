<template>
  <div class="modify-page">
    <div class="mobileContainer">
      <header class="header">
        <svg @click="router.back()" class="backIcon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        <div class="headerTitle">Modify Nickname</div>
      </header>

      <div class="content">
        <div class="form-item">
          <label>New Nickname</label>
          <input v-model="newName" type="text" placeholder="Please enter a new nickname" />
        </div>
        <button @click="handleUpdate" class="submitBtn" :disabled="loading">
          {{ loading ? 'Updating...' : 'Confirm Modification' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { updateSecurity } from '../../api/auth'

const router = useRouter()
const auth = useAuthStore()
const newName = ref(auth.user?.username || '')
const loading = ref(false)

const handleUpdate = async () => {
  if (!newName.value.trim()) return alert('Please enter a nickname')
  loading.value = true
  try {
    const res = await updateSecurity({
      auth: `Bearer ${localStorage.getItem('token')}`,
      userId: auth.user.id,
      type: 'name',
      name: newName.value
    })
    if (res.data === 'Done') {
      alert('Nickname updated successfully')
      auth.user.username = newName.value
      router.back()
    }
  } catch (err) {
    alert(err.response?.data?.message || 'Update failed')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modify-page { min-height: 100vh; background-color: #F8FAFC; display: flex; justify-content: center; }
.mobileContainer { width: 100%; max-width: 500px; min-height: 100vh; background-color: #fff; }
.header { background-color: #05c0b8; padding: 15px 20px; display: flex; align-items: center; position: sticky; top: 0; z-index: 100; }
.backIcon { cursor: pointer; color: white; }
.headerTitle { color: white; flex-grow: 1; text-align: center; font-weight: 600; font-size: 16px; margin-right: 20px; }

.content { padding: 25px; }
.form-item { margin-bottom: 25px; }
.form-item label { display: block; font-size: 14px; color: #64748B; margin-bottom: 10px; font-weight: 500; }
.form-item input { width: 100%; padding: 14px; border: 1px solid #E2E8F0; border-radius: 12px; font-size: 16px; outline: none; transition: border-color 0.2s; }
.form-item input:focus { border-color: #05c0b8; }

.submitBtn { width: 100%; padding: 16px; background-color: #05c0b8; color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; transition: opacity 0.2s; }
.submitBtn:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
