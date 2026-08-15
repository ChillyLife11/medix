import axios from 'axios'
import { API_BASE } from '@/config'

// Общий axios-инстанс. База — /api (в dev проксируется на бэкенд, обход CORS).
// Bearer-токен из localStorage подставляется автоматически, когда он есть.
export const api = axios.create({
	baseURL: API_BASE,
})

api.interceptors.request.use((config) => {
	const token = localStorage.getItem('token')
	if (token) config.headers.Authorization = `Bearer ${token}`
	return config
})
