import API from './client'

const ADMIN_KEY = 'RUSH_ADMIN_SECRET_2024' // User defined password for Master Admin frontend

export const getAdminStats = (api) => API.get(`/admin-api/stats/${api}`)
export const getAllUsers = (api) => API.get(`/admin-api/users/${api}`)
export const updateUser = (api, data) => API.post(`/admin-api/updateUser/${api}`, data)
export const getAllWithdrawals = (api) => API.get(`/admin-api/withdrawals/${api}`)
export const updateWithdrawal = (api, data) => API.post(`/admin-api/updateWithdrawal/${api}`, data)
export const getAdminTransactions = (api) => API.get(`/admin-api/transactions/${api}`)

// Site Settings
export const getSiteSettings = () => API.get('/siteSettings')
export const updateSiteSettings = (api, data) => API.post(`/updateSiteSettings/${api}`, data)

// Carousel
export const getCarousel = () => API.get('/getCarousel')
export const uploadCarousel = (api, formData) => API.post(`/uploadCarousel/${api}`, formData)
export const deleteCarousel = (api, id) => API.delete(`/deleteCarousel/${id}/${api}`)

// Commission
export const getCommissionConfigs = (api) => API.get(`/admin-api/commission/configs/${api}`)
export const createCommissionConfig = (api, data) => API.post(`/admin-api/commission/configs/${api}`, data)
export const updateCommissionConfig = (api, id, data) => API.put(`/admin-api/commission/configs/${id}/${api}`, data)
