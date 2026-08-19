// Вход клиента. Пока приложение обычное веб — идентификация по телефону:
// спрашиваем номер, ищем клиента и сохраняем токен. Слоя мессенджера нет.
// В localStorage лежат только токен, id клиента, телефон и флаги согласий
// (см. @/lib/storage), профиль не сохраняем — он приходит с сервера.

import { ref } from 'vue'
import { getUserByPhone } from '@/api/users'
import { storage } from '@/lib/storage'

const token = ref(storage.token)
const client = ref(null)

// Сохраняем аккаунт из ответа бэка.
function persist(account) {
	if (!account?.access_token) return false
	token.value = account.access_token
	client.value = account
	storage.setSession({ token: account.access_token, userId: account.id })
	return true
}

export function useAuth() {
	// Решает состояние авторизации: 'authed' | 'need-register'.
	// Есть токен — авторизован; иначе пробуем ранее введённый телефон.
	async function checkAuth() {
		if (token.value) return 'authed'
		const phone = storage.phone
		if (!phone) return 'need-register'
		try {
			const account = await getUserByPhone(phone)
			if (persist(account)) return 'authed'
		} catch (e) {
			console.warn('[auth] by-phone failed', e)
		}
		return 'need-register'
	}

	// Вход по телефону с экрана согласий. Возвращает true, если клиент найден.
	async function signIn(phone, consents = { privacy: true, policy: true }) {
		if (!phone) return false
		try {
			const account = await getUserByPhone(phone)
			if (!persist(account)) return false
			storage.setPhone(phone)
			storage.setConsents(consents)
			return true
		} catch (e) {
			console.warn('[auth] sign-in failed', e)
			return false
		}
	}

	function logout() {
		token.value = null
		client.value = null
		storage.clearSession()
	}

	return { token, client, checkAuth, signIn, logout, saveAccount: persist }
}
