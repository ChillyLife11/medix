// Сессия клиента живёт только пока открыта страница: ничего не сохраняем.
// При каждой загрузке приложение заново ищет клиента по телефону и получает
// свежий токен — см. checkAuth() в @/composables/useAuth.

import { ref } from 'vue'

export const token = ref(null) // Bearer для запросов
export const clientId = ref(null) // client_id в записях
export const phone = ref(null) // номер, по которому вошли

export function setSession(account, newPhone = phone.value) {
	token.value = account.access_token ?? null
	clientId.value = account.id ?? null
	phone.value = newPhone
}

export function clearSession() {
	setSession({}, null)
}
