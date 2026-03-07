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

export const createEnvelop = (data) => API.post('/createEnvelop/', data)
export const sendOTPEnv = (data) => API.post('/sendOTPEnv', data)
export const getUserEnvelop = (userId) => API.get(`/getUserEnvelop/${userId}`)
export const redeemEnvelop = (envelopeId, userId) => API.get(`/redeemEnvelop/${envelopeId}/${userId}`)
export const validateEnvelop = (envelopeId, userId) => API.get(`/validateEnvelop/${envelopeId}/${userId}`)
export const claimEnvelop = (envelopeId, userId) => API.get(`/claimEnvelop/${envelopeId}/${userId}`)
