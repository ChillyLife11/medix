import axios from 'axios'
import { API_BASE } from '@/config'
import { storage } from '@/lib/storage'

// Общий axios-инстанс. База — /api (в dev проксируется на бэкенд, обход CORS).
export const api = axios.create({
	baseURL: API_BASE,
})

// В каждый запрос добавляем Authorization: Bearer <access_token>.
// Токен приходит в ответе на авторизацию/регистрацию и лежит в localStorage.
api.interceptors.request.use((config) => {
	const token = storage.token
	if (token) config.headers.Authorization = `Bearer ${token}`
	return config
})
