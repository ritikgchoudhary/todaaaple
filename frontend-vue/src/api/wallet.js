import axios from 'axios'

const API_PORT = import.meta.env.VITE_API_PORT || '4001'
const isDev = import.meta.env.DEV
const apiBase = import.meta.env.VITE_API_BASE_URL != null
  ? import.meta.env.VITE_API_BASE_URL
  : (isDev ? `http://localhost:${API_PORT}` : '')

const API = axios.create({ baseURL: apiBase })

// Add interceptor to include token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// User Home & Profile
export const getUserHome = (userId) => API.get(`/getUserHome/${userId}`)
export const getUser = (userId) => API.get(`/getUser/${userId}`)

// Withdrawal Endpoints
export const getUserWithdrawal = (userId) => API.get(`/getUserWithdrawal/${userId}`)
export const applyWithdrawal = (data) => API.post('/applyWithdrawal', data)
export const applyWithdrawalUSDT = (data) => API.post('/applyWithdrawalUSDT', data)
export const getWithdrawalHistory = (userId) => API.get(`/getWithdrawal/${userId}`)

// Deposit / Gateway Endpoints
export const getCurrentGateway = () => API.get('/getCurrentGateway')
export const watchPayCreateOrder = (userId, data) => API.post(`/watchPayCreateOrder/${userId}`, data)
export const lgPayCreateOrder = (userId, data) => API.post(`/lgPayCreateOrder/${userId}`, data)
export const rupeeRushCreateOrder = (userId, data) => API.post(`/rupeeRushCreateOrder/${userId}`, data)

// Site Settings
export const getSiteSettings = () => API.get('/site-settings')
export const getCarousel = () => API.get('/carousel')

export default API
