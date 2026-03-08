import API from './client'

export const getInviteBonusData = (id) => API.get(`/getInviteBonusData/${id}`)
export const claimInvitationBonus = (id, tier) => API.get(`/claimInvitationBonus/${id}/${tier}`)
export const getOfferTransactions = (id) => API.get(`/getOfferTransactions/${id}`)
