import API from './client'

export const getAdminStats = (api) => API.get(`/admin-api/stats/${api}`)
export const getAllUsers = (api) => API.get(`/admin-api/users/${api}`)
export const updateUser = (api, data) => API.post(`/admin-api/updateUser/${api}`, data)
export const getAllWithdrawals = (api) => API.get(`/admin-api/withdrawals/${api}`)
export const updateWithdrawal = (api, data) => API.post(`/admin-api/updateWithdrawal/${api}`, data)
export const getAdminTransactions = (api) => API.get(`/admin-api/transactions/${api}`)

// Site Settings
export const getSiteSettings = (api) => API.get(`/admin/site-settings/${api}`)
export const updateSiteSettings = (api, data) => API.post(`/updateSiteSettings/${api}`, data)
export const uploadLogo = (api, formData) => API.post(`/admin/site-settings/logo/upload/${api}`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
export const uploadApk = (api, formData) => API.post(`/admin/site-settings/apk/upload/${api}`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})

// Carousel
export const getCarousel = (api) => API.get(`/admin/carousel/${api}`)
export const uploadCarousel = (api, formData) => API.post(`/admin/carousel/upload/${api}`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
export const updateCarouselOrder = (api, images) => API.post(`/admin/carousel/order/${api}`, { images })
export const deleteCarousel = (api, url) => API.post(`/admin/carousel/delete/${api}`, { url })

// Commission
export const getCommissionConfigs = (api) => API.get(`/admin-api/commission/configs/${api}`)
export const createCommissionConfig = (api, data) => API.post(`/admin-api/commission/configs/${api}`, data)
export const updateCommissionConfig = (api, id, data) => API.put(`/admin-api/commission/configs/${id}/${api}`, data)
