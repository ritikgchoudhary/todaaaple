import API from './client'

export const getAffiliateStats = (id) => API.get(`/user/affiliate/stats/${id}`)
