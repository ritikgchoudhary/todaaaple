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
    // Backend seems to expect 'Authorization: Bearer <token>' for checkAuth
    // and sometimes looks for it in req.body.auth for bidData (legacy style)
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Wingo 1 Minute
export const getTimer1 = () => API.get('/minute1_getTimer')
export const getRecords1 = () => API.get('/minute1_getRecord')
export const getMyHistory1 = (userId) => API.get(`/minute1_getBidHistory/${userId}`)
export const placeBid1 = (data) => {
  // Backend minute1_bidData expects req.body.auth for token
  const token = localStorage.getItem('auth_token')
  return API.post('/minute1_bidData', {
    ...data,
    auth: `Bearer ${token}`
  })
}

// Support for Win/Loss result checking if needed
export const getResult1 = (id) => API.get(`/minute1_setResult/${id}/fakeapi`) // Reference for result
