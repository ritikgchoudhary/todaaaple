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

/**
 * Generic functions for Wingo 1, 3, 5 minutes
 */

export const getTimer = (id) => API.get(`/minute${id}_getTimer`)
export const getRecords = (id) => API.get(`/minute${id}_getRecordData`)
export const getMyHistory = (id, userId) => API.get(`/minute${id}_getHistoryData/${userId}`)

export const placeBid = (id, data) => {
  const token = localStorage.getItem('auth_token')
  return API.post(`/minute${id}_bidData`, {
    ...data,
    auth: `Bearer ${token}`
  })
}

export const getFullRecords = (id) => API.get(`/minute${id}_getFullRecordData`)
export const getFullHistory = (id, userId) => API.get(`/minute${id}_getFullHistoryData/${userId}`)

// Legacy exports for backward compatibility if any
export const getTimer1 = () => getTimer(1)
export const getRecords1 = () => getRecords(1)
export const getMyHistory1 = (userId) => getMyHistory(1, userId)
export const placeBid1 = (data) => placeBid(1, data)
