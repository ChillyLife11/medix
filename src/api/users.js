import { api } from '@/api/http'

// Проверка существования клиента по chat_id мессенджера.
// Возвращает клиента (с access_token) или null.
export function checkChatId(chatId) {
	return api.get(`/users/check-chat-id/${chatId}`).then((r) => r.data)
}

// Поиск клиента по телефону.
export function getUserByPhone(phone) {
	return api.get('/user/by-phone', { params: { phone } }).then((r) => r.data)
}

// Регистрация/привязка через мессенджер (source = 'max' | 'telegram').
// Возвращает клиента с access_token.
export function registerMessenger(source, data) {
	return api.post(`/users/register-telegram/${source}`, data).then((r) => r.data)
}
