import axios from 'axios'

const API_PORT = import.meta.env.VITE_API_PORT || '4001'
const isDev = import.meta.env.DEV
const apiBase = import.meta.env.VITE_API_BASE_URL != null
  ? import.meta.env.VITE_API_BASE_URL
  : (isDev ? `http://localhost:${API_PORT}` : '')

export const url = apiBase

const API = axios.create({ baseURL: apiBase })

export const signin = (formData) => API.post('/user/signin/', formData)
export const signup = (formData) => API.post('/user/signup/', formData)
export const sendOTP = (payload) => API.post('/sendOTP', payload)
export const resetPassword = (payload) => API.post('/resetPassword', payload)
