// Вход клиента: идентификация по телефону (слоя мессенджера нет).
// Само состояние сессии — в @/session.

import { ref } from 'vue'
import { getUserByPhone, registerUser } from '@/api/users'
import { TEST_PHONE } from '@/config'
import { clearSession, phone, setSession, token } from '@/session'

const client = ref(null)

export function useAuth() {
	// Решает состояние авторизации: 'authed' | 'need-register'.
	// Есть токен — авторизован; иначе пробуем ранее введённый телефон.
	async function checkAuth() {
		if (token.value) return 'authed'
		return (await signIn(phone.value ?? TEST_PHONE)) ? 'authed' : 'need-register'
	}

	// Вход по телефону: ищем клиента, а если такого номера нет — регистрируем.
	// В обоих случаях в ответе приходит access_token.
	async function signIn(newPhone = TEST_PHONE, consents = null) {
		if (!newPhone) return false
		try {
			const account = (await getUserByPhone(newPhone)) ?? (await registerUser(newPhone))
			if (!account?.access_token) return false
			setSession(account, newPhone)
			client.value = account
			if (consents) localStorage.setItem('policy', String(consents.policy))
			return true
		} catch (e) {
			console.warn('[auth] sign-in failed', e)
			return false
		}
	}

	function logout() {
		client.value = null
		clearSession()
	}

	return { token, client, checkAuth, signIn, logout }
}
