<template>
  <div class="settings-view">
    <div class="settings-grid">
      <!-- Logo & Branding -->
      <div class="config-card shadow-premium">
        <div class="card-header-icon">🖼️</div>
        <h3>Branding & Logo</h3>
        <p class="card-desc">Manage your site logo and appearance</p>
        
        <div class="logo-preview-box">
          <img v-if="siteSettings.siteLogoUrl" :src="siteSettings.siteLogoUrl" alt="Site Logo" />
          <div v-else class="no-logo">
             <div class="nl-icon">📷</div>
             <span>No Logo Uploaded</span>
          </div>
        </div>
        
        <div class="upload-zone-compact">
          <input type="file" ref="logoInput" @change="handleLogoUpload" hidden />
          <button @click="() => $refs.logoInput.click()" class="action-btn edit-btn" :disabled="uploading">
            {{ uploading ? 'Uploading...' : 'Change Logo' }}
          </button>
          <button v-if="siteSettings.siteLogoUrl" @click="deleteLogo" class="action-btn delete-btn-outline" :disabled="uploading">
            Delete
          </button>
        </div>
      </div>

      <!-- Support Links -->
      <div class="config-card shadow-premium">
        <div class="card-header-icon">🔗</div>
        <h3>Support & Channels</h3>
        <p class="card-desc">Configure customer contact links</p>
        
        <div class="settings-form">
          <div class="form-group-modern">
            <label>Telegram Link</label>
            <div class="input-with-action">
              <input v-model="siteSettings.telegramLink" placeholder="https://t.me/..." />
              <button class="clear-input" @click="siteSettings.telegramLink = ''" title="Clear">×</button>
            </div>
          </div>
          <div class="form-group-modern">
            <label>Live Support Link</label>
            <div class="input-with-action">
              <input v-model="siteSettings.customerServiceLink" placeholder="https://tawk.to/..." />
              <button class="clear-input" @click="siteSettings.customerServiceLink = ''" title="Clear">×</button>
            </div>
          </div>
          <div class="form-group-modern">
            <label>WhatsApp Support</label>
            <div class="input-with-action">
              <input v-model="siteSettings.whatsappLink" placeholder="https://wa.me/..." />
              <button class="clear-input" @click="siteSettings.whatsappLink = ''" title="Clear">×</button>
            </div>
          </div>
          <div class="form-group-modern">
            <label>USDT (TRC20) Wallet</label>
            <div class="input-with-action">
              <input v-model="siteSettings.usdtAddress" placeholder="Wallet address..." />
              <button class="clear-input" @click="siteSettings.usdtAddress = ''" title="Clear">×</button>
            </div>
          </div>
          <div class="form-group-modern">
            <label>App Download Link (APK URL)</label>
            <div class="input-with-action">
              <input v-model="siteSettings.apkDownloadUrl" placeholder="https://example.com/app.apk" />
              <button class="clear-input" @click="siteSettings.apkDownloadUrl = ''" title="Clear">×</button>
            </div>
            <div class="apk-upload-action" style="margin-top: 10px;">
              <input type="file" ref="apkInput" @change="handleApkUpload" hidden accept=".apk" />
              <button @click="() => $refs.apkInput.click()" class="action-btn edit-btn" style="padding: 8px 16px; font-size: 13px; width: fit-content; flex: none;" :disabled="uploadingApk">
                {{ uploadingApk ? 'Uploading APK...' : '📤 Upload APK File' }}
              </button>
            </div>
          </div>
          <div class="form-group-modern" style="margin-top: 15px; border-top: 1px solid #eee; padding-top: 15px;">
            <label style="display: flex; align-items: center; justify-content: space-between;">
              Platform Notice Image URL
              <label class="switch-small">
                <input type="checkbox" v-model="siteSettings.platformMessageEnabled">
                <span class="slider round"></span>
              </label>
            </label>
            <div class="input-with-action">
              <input v-model="siteSettings.platformMessageUrl" placeholder="https://...image.jpg" />
              <button class="clear-input" @click="siteSettings.platformMessageUrl = ''" title="Clear">×</button>
            </div>
            <p class="field-hint" style="font-size: 12px; color: #888; margin-top: 5px;">Toggle on to show a popup notice on the home page with the generic image url provided.</p>
          </div>
          <button @click="saveSiteSettings" class="update-settings-btn" :disabled="saving">
            {{ saving ? 'Saving Changes...' : 'Save Site Settings' }}
          </button>
        </div>
      </div>

      <!-- Carousel Manager -->
      <div class="config-card shadow-premium full-width">
        <div class="card-header-icon">🎡</div>
        <div class="card-title-row">
           <div class="title-meta">
             <h3>Home Page Carousel</h3>
             <p class="card-desc">Manage rotating banners ({{ carouselImages.length }} active)</p>
           </div>
           <button class="add-carousel-btn" @click="() => $refs.carouselInput.click()" :disabled="uploadingCarousel">
             {{ uploadingCarousel ? '...' : '+ Add Image' }}
           </button>
        </div>
        
        <input type="file" ref="carouselInput" @change="handleCarouselUpload" hidden />
        
        <div class="carousel-grid-modern">
          <div v-for="(img, idx) in carouselImages" :key="idx" class="carousel-item-premium">
            <div class="c-thumb">
               <img :src="img" />
               <div class="c-overlay">
                  <button @click="removeCarousel(img)" class="c-delete-btn" title="Delete Image">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
               </div>
            </div>
          </div>
          <div v-if="!carouselImages.length" class="empty-carousel">
             <div class="ec-icon">🎞️</div>
             <p>No carousel images. Add some to get started.</p>
          </div>
        </div>
        <p class="carousel-hint">Recommended aspect ratio: 3:1 (e.g. 1200x400px)</p>
      </div>
    </div>

    <!-- Multi-Toast Feedback -->
    <TransitionGroup name="toast">
      <div v-if="toastMsg" class="modern-toast-float" :class="toastType" @click="toastMsg = ''">
        <div class="toast-content">
          <span class="toast-marker"></span>
          <p>{{ toastMsg }}</p>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as adminApi from '../api/admin'

const ADMIN_API_KEY = '0f58faf1-20ea-489b-ad86-948cbdc9b7a3'
const siteSettings = ref({ siteLogoUrl: '', telegramLink: '', customerServiceLink: '', whatsappLink: '', usdtAddress: '', platformMessageUrl: '', platformMessageEnabled: false, apkDownloadUrl: '' })
const carouselImages = ref([])
const uploading = ref(false)
const uploadingApk = ref(false)
const uploadingCarousel = ref(false)
const saving = ref(false)

const toastMsg = ref('')
const toastType = ref('success')

const showToast = (msg, type = 'success') => {
  toastMsg.value = msg
  toastType.value = type
  setTimeout(() => { if (toastMsg.value === msg) toastMsg.value = '' }, 3000)
}

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
    showToast('Logo updated successfully')
  } catch (err) {
    showToast('Upload failed', 'error')
  } finally { uploading.value = false }
}

const handleApkUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  uploadingApk.value = true
  const fd = new FormData()
  fd.append('apk', file)
  try {
    const res = await adminApi.uploadApk(ADMIN_API_KEY, fd)
    siteSettings.value.apkDownloadUrl = res.data.apkDownloadUrl
    showToast('APK uploaded successfully')
  } catch (err) {
    showToast('APK upload failed', 'error')
  } finally { uploadingApk.value = false }
}

const deleteLogo = async () => {
  if (!confirm('Are you sure you want to remove the site logo?')) return
  try {
    await adminApi.updateSiteSettings(ADMIN_API_KEY, { siteLogoUrl: '' })
    siteSettings.value.siteLogoUrl = ''
    showToast('Logo removed')
  } catch (err) {
    showToast('Failed to remove logo', 'error')
  }
}

const saveSiteSettings = async () => {
  saving.value = true
  try {
    await adminApi.updateSiteSettings(ADMIN_API_KEY, {
      telegramLink: siteSettings.value.telegramLink,
      customerServiceLink: siteSettings.value.customerServiceLink,
      whatsappLink: siteSettings.value.whatsappLink,
      usdtAddress: siteSettings.value.usdtAddress,
      platformMessageUrl: siteSettings.value.platformMessageUrl,
      platformMessageEnabled: siteSettings.value.platformMessageEnabled,
      apkDownloadUrl: siteSettings.value.apkDownloadUrl
    })
    showToast('Site settings updated')
  } catch (err) {
    showToast('Update failed', 'error')
  } finally { saving.value = false }
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
    showToast('Carousel image added')
  } catch (err) {
    showToast('Upload failed', 'error')
  } finally { uploadingCarousel.value = false }
}

const removeCarousel = async (url) => {
  if (!confirm('Permanently remove this carousel image?')) return
  try {
    const res = await adminApi.deleteCarousel(ADMIN_API_KEY, url)
    carouselImages.value = res.data.images
    showToast('Image removed')
  } catch (err) {
    showToast('Delete failed', 'error')
  }
}

onMounted(() => {
  fetchSiteSettings()
  fetchCarousel()
})
</script>

<style scoped>
.settings-view {
  padding: 20px;
  background: #f8fafc;
  min-height: 100vh;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  max-width: 1200px;
}

.full-width {
  grid-column: 1 / -1;
}

.config-card {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  position: relative;
  border: 1px solid #eef2f6;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.config-card:hover {
  box-shadow: 0 10px 30px -5px rgba(0,0,0,0.08);
}

.card-header-icon {
  font-size: 2rem;
  margin-bottom: 12px;
}

h3 {
  margin: 0 0 4px 0;
  font-size: 1.25rem;
  font-weight: 800;
  color: #1e293b;
}

.card-desc {
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 24px;
}

.logo-preview-box {
  width: 100%;
  height: 160px;
  background: #f1f5f9;
  border-radius: 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 2px dashed #e2e8f0;
}

.logo-preview-box img {
  max-width: 80%;
  max-height: 80%;
  object-fit: contain;
}

.nl-icon {
  font-size: 2.5rem;
  color: #cbd5e1;
  margin-bottom: 8px;
}

.no-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #94a3b8;
  font-weight: 600;
  font-size: 0.9rem;
}

.upload-zone-compact {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-btn {
  background: #0284c7;
  color: #fff;
}

.edit-btn:hover { background: #0369a1; }

.delete-btn-outline {
  background: #fff;
  color: #ef4444;
  border: 1px solid #fee2e2;
}

.delete-btn-outline:hover {
  background: #fef2f2;
  border-color: #ef4444;
}

/* Form Styles */
.settings-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group-modern label {
  display: block;
  font-size: 0.75rem;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  margin-bottom: 8px;
  letter-spacing: 0.05em;
}

.input-with-action {
  position: relative;
  display: flex;
}

.input-with-action input {
  width: 100%;
  padding: 14px 44px 14px 16px;
  background: #f8fafc;
  border: 1px solid #eef2f6;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
  outline: none;
  transition: all 0.2s;
}

.input-with-action input:focus {
  background: #fff;
  border-color: #0284c7;
  box-shadow: 0 0 0 4px rgba(2, 132, 199, 0.08);
}

.clear-input {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: #cbd5e1;
  color: #fff;
  border: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.clear-input:hover { background: #94a3b8; }

.update-settings-btn {
  margin-top: 8px;
  background: #0f172a;
  color: #fff;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.update-settings-btn:hover { background: #1e293b; transform: translateY(-1px); }

/* Carousel grid */
.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.add-carousel-btn {
  background: #e0f2fe;
  color: #0369a1;
  border: none;
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 800;
  cursor: pointer;
}

.carousel-grid-modern {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.carousel-item-premium {
  border-radius: 14px;
  overflow: hidden;
  aspect-ratio: 3/1;
  background: #f1f5f9;
  position: relative;
}

.c-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.c-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  justify-content: flex-end;
  padding: 12px;
  opacity: 0;
  transition: opacity 0.2s;
}

.carousel-item-premium:hover .c-overlay {
  opacity: 1;
}

.c-delete-btn {
  background: #fff;
  color: #ef4444;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.carousel-hint {
  margin-top: 16px;
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 700;
  text-align: center;
}

/* Toast */
.modern-toast-float {
  position: fixed;
  bottom: 32px;
  right: 32px;
  background: #0f172a;
  color: #fff;
  padding: 16px 24px;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2);
  cursor: pointer;
  z-index: 9999;
}

.toast-marker {
  width: 4px;
  height: 20px;
  background: #10b981;
  border-radius: 2px;
  margin-right: 12px;
  display: inline-block;
  vertical-align: middle;
}

.error .toast-marker { background: #ef4444; }

.toast-content p { display: inline-block; margin: 0; font-weight: 700; }

@media (max-width: 640px) {
  .settings-grid { grid-template-columns: 1fr; }
}
</style>

