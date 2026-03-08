import API from './client'

/**
 * Generic functions for Wingo 1, 3, 5 minutes
 */

export const getTimer = (id) => API.get(`/minute${id}_getTimer`)
export const getRecords = (id) => API.get(`/minute${id}_getRecordData`)
export const getMyHistory = (id, userId) => API.get(`/minute${id}_getHistoryData/${userId}`)

export const placeBid = (id, data) => {
  const token = localStorage.getItem('auth_token')
  return API.post(`/minute${id}_bidData`, {
    ...data,
    auth: `Bearer ${token}`
  })
}

export const getFullRecords = (id) => API.get(`/minute${id}_getFullRecordData`)
export const getFullHistory = (id, userId) => API.get(`/minute${id}_getFullHistoryData/${userId}`)

// Legacy exports for backward compatibility if any
export const getTimer1 = () => getTimer(1)
export const getRecords1 = () => getRecords(1)
export const getMyHistory1 = (userId) => getMyHistory(1, userId)
export const placeBid1 = (data) => placeBid(1, data)
