import axios from 'axios'
import { url } from './auth'

const API = axios.create({ baseURL: url })

API.interceptors.request.use((req) => {
  const profile = localStorage.getItem('user')
  if (profile) {
    req.headers.Authorization = `Bearer ${JSON.parse(profile).token}`
  }
  return req
})

export const getPromotionMembers = (id) => API.get(`/getPromotionMembers/${id}`)
export const claimContriBonus = (id) => API.get(`/claimContriBonus/${id}`)
export const applyBonus = (data) => API.post(`/applyBonus/`, data)
export const getPromotionFull = (id) => API.get(`/getPromotionFull/${id}`)
export const getPromotionNew = (id) => API.get(`/getPromotionNew/${id}`)
export const getPromotionLiveBalance = (id, phone) => API.get(`/getPromotionLiveBalance/${id}/${phone}`)
export const getApplyRecord = (id) => API.get(`/getApplyRecord/${id}`) // assuming this exists
