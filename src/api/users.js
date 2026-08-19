import { api } from '@/api/http'

// Поиск клиента по телефону — вход в приложение.
// Возвращает клиента с access_token или null, если такого номера нет.
export function getUserByPhone(phone) {
	return api.get('/user/by-phone', { params: { phone } }).then((r) => r.data)
}
