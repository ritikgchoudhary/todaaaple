import axios from 'axios'
import router from '../router'

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
  } else {
    const profile = localStorage.getItem('user')
    if (profile) {
      try {
        const parsed = JSON.parse(profile)
        if (parsed.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`
        }
      } catch (e) {}
    }
  }
  return config
})

// Add response interceptor for Auth errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthError = error.response?.status === 401 || 
                       error.response?.data?.msg === 'Auth Failed' || 
                       error.response?.data?.message === 'Auth Failed';
                       
    if (isAuthError) {
      localStorage.removeItem('user')
      localStorage.removeItem('auth_token')
      
      // Redirect to login if not already there
      if (router.currentRoute.value.name !== 'Login') {
        router.push({ 
          name: 'Login', 
          query: { redirect: router.currentRoute.value.fullPath } 
        })
      }
    }
    return Promise.reject(error)
  }
)

export default API
export const url = apiBase
