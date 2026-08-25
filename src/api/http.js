import axios from 'axios'
import { API_BASE, DEBUG_HTTP } from '@/config'
import { clearSession, token } from '@/session'
import router from '@/router'
import { preview, pushHttpLog } from '@/composables/useHttpLog'

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
			router.replace('/')
		}
		return Promise.reject(error)
	},
)

// Отладочные тосты: показываем, что ушло и что вернулось. Ставим отдельной
// парой перехватчиков, чтобы обычную логику выше не засорять и выключать одним
// флагом.
if (DEBUG_HTTP) {
	api.interceptors.request.use((config) => {
		config.meta = { startedAt: Date.now() }
		return config
	})

	const label = (config) => `${(config?.method ?? 'get').toUpperCase()} ${config?.url ?? ''}`
	const took = (config) => (config?.meta?.startedAt ? Date.now() - config.meta.startedAt : null)

	api.interceptors.response.use(
		(response) => {
			pushHttpLog({
				label: label(response.config),
				status: response.status,
				ok: true,
				ms: took(response.config),
				request: preview(response.config?.data ?? response.config?.params),
				response: preview(response.data),
			})
			return response
		},
		(error) => {
			pushHttpLog({
				label: label(error.config),
				status: error.response?.status ?? 'нет ответа',
				ok: false,
				ms: took(error.config),
				request: preview(error.config?.data ?? error.config?.params),
				response: preview(error.response?.data ?? error.message),
			})
			return Promise.reject(error)
		},
	)
}

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
