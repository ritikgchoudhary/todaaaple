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

export const getAffiliateStats = (id) => API.get(`/user/affiliate/stats/${id}`)
