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

export const getUserHome = (userId) => API.get(`/getUserHome/${userId}`)
export const getCurrentGateway = () => API.get('/getCurrentGateway')

// Specific Gateway Order Creation
export const watchPayCreateOrder = (userId, data) => API.post(`/watchPayCreateOrder/${userId}`, data)
export const lgPayCreateOrder = (userId, data) => API.post(`/lgPayCreateOrder/${userId}`, data)
export const rupeeRushCreateOrder = (userId, data) => API.post(`/rupeeRushCreateOrder/${userId}`, data)

// Generic Gateway check/initiate if needed
export const getRechargeSettings = () => API.get('/admin/recharge-settings/fakeapi') // Just for reference if needed
