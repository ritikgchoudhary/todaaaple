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
  (response) => {
    // Some endpoints might return 200 but with an "Auth Failed" message
    if (isAuthFailBody(response.data)) {
      return handleAuthFailure(response)
    }
    return response
  },
  (error) => {
    const isAuthError = error.response?.status === 401 || isAuthFailBody(error.response?.data);
    if (isAuthError) {
      return handleAuthFailure(error.response)
    }
    return Promise.reject(error)
  }
)

function isAuthFailBody(data) {
  if (!data) return false;
  const str = String(data.message || data.msg || data.error || '').toLowerCase();
  return str.includes('auth failed');
}

function handleAuthFailure(response) {
  console.warn('Authentication failure detected, redirecting to login...', response?.data);
  
  localStorage.removeItem('user')
  localStorage.removeItem('auth_token')
  
  // Try to redirect using router
  if (router.currentRoute.value.name !== 'Login') {
    router.push({ 
      name: 'Login', 
      query: { redirect: router.currentRoute.value.fullPath } 
    }).catch(err => {
      console.error('Router push failed:', err);
      window.location.href = '/login';
    });
    
    // Fallback if router doesn't navigate within 500ms
    setTimeout(() => {
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }, 500);
  }
  
  return Promise.reject(new Error('Auth Failed'))
}

export default API
export const url = apiBase
