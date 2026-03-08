import API from './client'

export const getCarousel = () => API.get('/carousel')
export const getNotice = () => API.get('/getNotice')
export const getProviders = () => API.get('/getProviders')
export const launchGame = (userId, gameId) => API.post(`/game/launch/${userId}`, { game_uid: gameId })
