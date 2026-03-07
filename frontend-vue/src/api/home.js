import axios from 'axios'
import { url } from './auth'

const API = axios.create({ baseURL: url })

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    req.headers.authorization = `Bearer ${token}`
  } else {
    const profile = localStorage.getItem('user')
    if (profile) {
      try {
        const parsed = JSON.parse(profile)
        if (parsed.token) req.headers.authorization = `Bearer ${parsed.token}`
      } catch (e) {}
    }
  }
  return req
})

export const getCarousel = () => API.get('/carousel')
export const getNotice = () => API.get('/getNotice')
export const getProviders = () => API.get('/getProviders')
export const launchGame = (userId, gameId) => API.post(`/game/launch/${userId}`, { game_uid: gameId })
