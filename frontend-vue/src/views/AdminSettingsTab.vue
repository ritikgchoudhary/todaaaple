<template>
  <div class="settings-view">
    <div class="settings-grid">
      <!-- Logo & Branding -->
      <div class="config-card shadow-premium">
        <h3>Branding & Logo</h3>
        <div class="logo-preview-box">
          <img v-if="siteSettings.siteLogoUrl" :src="siteSettings.siteLogoUrl" alt="Site Logo" />
          <div v-else class="no-logo">No Logo Uploaded</div>
        </div>
        <div class="upload-zone">
          <input type="file" ref="logoInput" @change="handleLogoUpload" hidden />
          <button @click="() => $refs.logoInput.click()" class="action-btn edit" :disabled="uploading">
            {{ uploading ? 'Uploading...' : 'Change Logo' }}
          </button>
        </div>
      </div>

      <!-- Support Links -->
      <div class="config-card shadow-premium">
        <h3>Support & Channels</h3>
        <div class="form-group">
          <label>Telegram Group/Channel</label>
          <input v-model="siteSettings.telegramLink" placeholder="https://t.me/..." />
        </div>
        <div class="form-group">
          <label>Live Customer Service Link</label>
          <input v-model="siteSettings.customerServiceLink" placeholder="https://tawk.to/..." />
        </div>
        <div class="form-group">
          <label>WhatsApp Link (Optional)</label>
          <input v-model="siteSettings.whatsappLink" placeholder="https://wa.me/..." />
        </div>
        <div class="form-group">
          <label>USDT (TRC20) Deposit Address</label>
          <input v-model="siteSettings.usdtAddress" placeholder="Enter TRC20 wallet address..." />
        </div>
        <button @click="saveSiteSettings" class="save-btn small" :disabled="saving">
          {{ saving ? 'Saving...' : 'Update Links' }}
        </button>
      </div>

      <!-- Carousel Manager -->
      <div class="config-card shadow-premium full-width">
        <h3>Home Page Carousel</h3>
        <div class="carousel-list">
          <div v-for="(img, idx) in carouselImages" :key="idx" class="carousel-item-admin">
            <img :src="img" />
            <button @click="removeCarousel(img)" class="remove-c-btn">×</button>
          </div>
          <div class="carousel-uploader" @click="() => $refs.carouselInput.click()">
            <input type="file" ref="carouselInput" @change="handleCarouselUpload" hidden />
            <span v-if="!uploadingCarousel">+ Add Image</span>
            <span v-else>...</span>
          </div>
        </div>
        <p class="hint">Recommended size: 1200x400 (Aspect Ratio 3:1)</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as adminApi from '../api/admin'

const ADMIN_API_KEY = '0f58faf1-20ea-489b-ad86-948cbdc9b7a3'
const siteSettings = ref({ siteLogoUrl: '', telegramLink: '', customerServiceLink: '', whatsappLink: '', usdtAddress: '' })
const carouselImages = ref([])
const uploading = ref(false)
const uploadingCarousel = ref(false)
const saving = ref(false)

const fetchSiteSettings = async () => {
  try {
    const res = await adminApi.getSiteSettings(ADMIN_API_KEY)
    siteSettings.value = res.data
  } catch (err) {}
}

const fetchCarousel = async () => {
  try {
    const res = await adminApi.getCarousel(ADMIN_API_KEY)
    carouselImages.value = res.data.images
  } catch (err) {}
}

const handleLogoUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  uploading.value = true
  const fd = new FormData()
  fd.append('logo', file)
  try {
    const res = await adminApi.uploadLogo(ADMIN_API_KEY, fd)
    siteSettings.value.siteLogoUrl = res.data.siteLogoUrl
    alert('Logo updated successfully')
  } catch (err) {
    alert('Upload failed')
  } finally { uploading.value = false }
}

const saveSiteSettings = async () => {
  saving.value = true
  try {
    await adminApi.updateSiteSettings(ADMIN_API_KEY, {
      telegramLink: siteSettings.value.telegramLink,
      customerServiceLink: siteSettings.value.customerServiceLink,
      whatsappLink: siteSettings.value.whatsappLink,
      usdtAddress: siteSettings.value.usdtAddress
    })
    alert('Settings saved')
  } catch (err) {} finally { saving.value = false }
}

const handleCarouselUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  uploadingCarousel.value = true
  const fd = new FormData()
  fd.append('image', file)
  try {
    const res = await adminApi.uploadCarousel(ADMIN_API_KEY, fd)
    carouselImages.value = res.data.images
  } catch (err) {
    alert('Carousel upload failed')
  } finally { uploadingCarousel.value = false }
}

const removeCarousel = async (url) => {
  if (!confirm('Remove this carousel image?')) return
  try {
    const res = await adminApi.deleteCarousel(ADMIN_API_KEY, url)
    carouselImages.value = res.data.images
  } catch (err) {}
}

onMounted(() => {
  fetchSiteSettings()
  fetchCarousel()
})
</script>
