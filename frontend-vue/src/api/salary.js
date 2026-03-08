import API from './client'

export const getSalaryTask = (id) => API.get(`/getSalaryTask/${id}`)
export const claimSalary = (id, levelId) => API.get(`/claimSalary/${id}/${levelId}`)
