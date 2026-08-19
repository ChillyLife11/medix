// Сессия клиента: то немногое, что должно переживать перезагрузку страницы.
// token — Bearer для запросов, clientId — client_id в записях, phone — чтобы
// не спрашивать номер каждый раз. Всё реактивное: экраны видят изменения сразу.

import { ref } from 'vue'

export const token = ref(localStorage.getItem('token'))
export const clientId = ref(Number(localStorage.getItem('user_id')) || null)
export const phone = ref(localStorage.getItem('phone'))

function save(key, value) {
	if (value) localStorage.setItem(key, String(value))
	else localStorage.removeItem(key)
}

export function setSession(account, newPhone = phone.value) {
	token.value = account.access_token
	clientId.value = account.id
	phone.value = newPhone
	save('token', token.value)
	save('user_id', clientId.value)
	save('phone', phone.value)
}

export function clearSession() {
	setSession({}, null)
}
