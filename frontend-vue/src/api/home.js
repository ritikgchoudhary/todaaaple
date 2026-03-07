import axios from 'axios'

const API_PORT = import.meta.env.VITE_API_PORT || '4001'
const isDev = import.meta.env.DEV
const apiBase = import.meta.env.VITE_API_BASE_URL != null
  ? import.meta.env.VITE_API_BASE_URL
  : (isDev ? `http://localhost:${API_PORT}` : '')

const API = axios.create({ baseURL: apiBase })

export const getCarousel = () => API.get('/carousel')
export const getNotice = () => API.get('/getNotice')
export const getProviders = () => API.get('/getProviders')
