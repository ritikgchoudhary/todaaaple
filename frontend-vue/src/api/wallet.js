import API from './client'

// User Home & Profile
export const getUserHome = (userId) => API.get(`/getUserHome/${userId}`)
export const getUser = (userId) => API.get(`/getUser/${userId}`)

// Withdrawal Endpoints
export const getUserWithdrawal = (userId) => API.get(`/getUserWithdrawal/${userId}`)
export const applyWithdrawal = (data) => API.post('/applyWithdrawal', data)
export const applyWithdrawalUSDT = (data) => API.post('/applyWithdrawalUSDT', data)
export const getWithdrawalHistory = (userId) => API.get(`/getWithdrawal/${userId}`)
export const getPlayHistory = (userId) => API.get(`/getPlayHistory/${userId}`)
export const getPlayHistoryApi = (userId) => API.get(`/api/getPlayHistory/${userId}`)

// Deposit / Gateway Endpoints
export const getCurrentGateway = () => API.get('/getCurrentGateway')
export const getRecentRecharges = (userId) => API.get(`/getRecentRecharges/${userId}`)
export const watchPayCreateOrder = (userId, data) => API.post(`/watchPayCreateOrder/${userId}`, data)
export const lgPayCreateOrder = (userId, data) => API.post(`/lgPayCreateOrder/${userId}`, data)
export const rupeeRushCreateOrder = (userId, data) => API.post(`/rupeeRushCreateOrder/${userId}`, data)
export const createCryptoUpayOrder = (userId, data) => API.post(`/createCryptoUpayOrder/${userId}`, data)

// Site Settings
export const getSiteSettings = () => API.get('/site-settings')
export const getCarousel = () => API.get('/carousel')

export default API
