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

// Текст ошибки для пользователя. Бэк отвечает по-разному: Yii-формат
// { name, message, status }, список валидации [{ field, message }] или
// { поле: ["текст"] } — берём первое человекочитаемое сообщение.
export function apiErrorMessage(error, fallback = 'Что-то пошло не так. Попробуйте позже.') {
	const data = error?.response?.data
	if (!data) return fallback
	if (Array.isArray(data)) return data[0]?.message || fallback
	if (typeof data.message === 'string' && data.message) return data.message
	const first = Object.values(data)
		.flat()
		.find((value) => typeof value === 'string' && value)
	return first || fallback
}
