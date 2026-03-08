import API, { url as apiBase } from './client'

export const url = apiBase

export const signin = (formData) => API.post('/user/signin/', formData)
export const signup = (formData) => API.post('/user/signup/', formData)
export const sendOTP = (payload) => API.post('/sendOTP', payload)
export const resetPassword = (payload) => API.post('/resetPassword', payload)
