// Вход клиента: идентификация по телефону. В MAX номер отдаёт мессенджер
// (см. @/composables/useMessenger), вне его — тестовый из конфига.
// Само состояние сессии — в @/session.

import { ref } from 'vue'
import { getUserByPhone, registerUser } from '@/api/users'
import { TEST_PHONE } from '@/config'
import { clearSession, setSession, token } from '@/session'
import { useMessenger } from '@/composables/useMessenger'

const client = ref(null)

export function useAuth() {
	// Решает состояние авторизации: 'authed' | 'need-register'.
	// Токен живёт только в памяти, поэтому после перезагрузки страницы клиент
	// ищется по телефону заново.
	//
	// В MAX номера на этом шаге ещё нет: мессенджер отдаёт его только по
	// действию пользователя (`requestContact` на экране согласий), поэтому со
	// сплэша молча войти нельзя — ведём на согласия. Вне MAX остаётся вход по
	// тестовому номеру, иначе отладка в браузере упрётся в тот же экран.
	async function checkAuth() {
		if (token.value) return 'authed'
		if (useMessenger().isMax) return 'need-register'
		return (await signIn()) ? 'authed' : 'need-register'
	}

	// Вход по телефону: ищем клиента, а если такого номера нет — регистрируем.
	// В обоих случаях в ответе приходит access_token.
	async function signIn(newPhone = TEST_PHONE) {
		if (!newPhone) return false
		try {
			const account = (await getUserByPhone(newPhone)) ?? (await registerUser(newPhone))
			if (!account?.access_token) return false
			setSession(account, newPhone)
			client.value = account
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
