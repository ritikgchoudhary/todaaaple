import API from './client'

export const getCarousel = () => API.get('/carousel')
export const getNotice = () => API.get('/getNotice')
export const getProviders = () => API.get('/getProviders')
export const launchGame = (userId, gameId) => API.post(`/game/launch/${userId}`, { game_uid: gameId })

export const getHomeCategoryGames = () => API.get('/admin-api/home-category-games')
export const updateHomeCategoryGames = (data) => API.post('/admin-api/home-category-games', data)
