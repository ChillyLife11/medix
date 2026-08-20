import axios from 'axios'
import { API_BASE } from '@/config'
import { clearSession, token } from '@/session'
import router from '@/router'

// Общий axios-инстанс. База — /api (в dev проксируется на бэкенд, обход CORS).
export const api = axios.create({
	baseURL: API_BASE,
})

// В каждый запрос добавляем Authorization: Bearer <access_token>.
// Токен приходит в ответе на вход/регистрацию и живёт в памяти до перезагрузки.
api.interceptors.request.use((config) => {
	if (token.value) config.headers.Authorization = `Bearer ${token.value}`
	return config
})

// Протухший или отсутствующий токен: чистим сессию и возвращаем на вход,
// иначе экраны молча упираются в 401 при каждом запросе.
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error?.response?.status === 401 && token.value) {
			clearSession()
			router.replace('/agree')
		}
		return Promise.reject(error)
	},
)

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
