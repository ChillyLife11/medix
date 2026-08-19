import { api } from '@/api/http'

// Поиск клиента по телефону — вход в приложение.
// Возвращает клиента с access_token или null, если такого номера нет.
export function getUserByPhone(phone) {
	return api.get('/user/by-phone', { params: { phone } }).then((r) => r.data)
}

// Регистрация нового клиента по телефону. Авторизации не требует, в ответе
// приходит клиент с access_token — как и у поиска по номеру.
// source сейчас 'max': бэкенд ждёт его от мини-аппы мессенджера.
export function registerUser(phone, data = {}) {
	return api
		.post('/user/register-telegram', { phone, ...data }, { params: { source: 'max' } })
		.then((r) => r.data)
}
