import axios from 'axios'
import { url } from './auth'

const API = axios.create({ baseURL: url })

API.interceptors.request.use((req) => {
  const profile = localStorage.getItem('user')
  if (profile) {
    req.headers.authorization = `Bearer ${JSON.parse(profile).token}`
  }
  return req
})

export const getCarousel = () => API.get('/carousel')
export const getNotice = () => API.get('/getNotice')
export const getProviders = () => API.get('/getProviders')
export const launchGame = (userId, gameId) => API.post(`/game/launch/${userId}`, { game_uid: gameId })
