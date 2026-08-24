// Вход клиента: идентификация по номеру телефона. Боевой номер отдаёт MAX
// (см. @/composables/useMessenger); в dev-сборке вне мессенджера остаётся
// отладочный из конфига, в прод-сборке фолбэка нет.
// Само состояние сессии — в @/session.

import { computed, ref } from 'vue'
import { getUserByPhone, registerUser } from '@/api/users'
import { FALLBACK_PHONE } from '@/config'
import { clearSession, setSession, token } from '@/session'
import { useMessenger } from '@/composables/useMessenger'

const client = ref(null)

// Клиент на бэкенде хранит ФИО во вложенном profile — как и остальные
// пользователи (см. @/api/branches).
function profileName(account) {
	const profile = account?.profile
	return [profile?.first_name, profile?.last_name].filter(Boolean).join(' ')
}

// Имя для экранов: сначала аккаунт MAX, потом карточка клиента на бэкенде.
// Заглушка нужна только вне мессенджера — в MAX имя есть всегда.
const clientName = computed(() => useMessenger().userName || profileName(client.value) || 'Пациент')

export function useAuth() {
	// Решает состояние авторизации: 'authed' | 'need-register'.
	// Токен живёт только в памяти, поэтому после перезагрузки страницы клиент
	// ищется по телефону заново.
	//
	// В MAX номера на этом шаге ещё нет: мессенджер отдаёт его только по
	// действию пользователя (`requestContact` на экране согласий), поэтому со
	// сплэша молча войти нечем — ведём на согласия. Там же оказывается и
	// прод-сборка, открытая вне MAX. Отладочный вход остаётся только в dev.
	async function checkAuth() {
		if (token.value) return 'authed'
		if (useMessenger().isMax || !FALLBACK_PHONE) return 'need-register'
		return (await signIn(FALLBACK_PHONE)) ? 'authed' : 'need-register'
	}

	// Вход по телефону: ищем клиента, а если такого номера нет — регистрируем.
	// В обоих случаях в ответе приходит access_token.
	//
	// Номер обязателен и передаётся явно: значения по умолчанию тут больше нет,
	// чтобы случайный `signIn()` не завёл сессию под отладочным номером.
	async function signIn(newPhone) {
		if (!newPhone) return false
		try {
			// Нового клиента заводим сразу с данными аккаунта MAX (имя, фамилия,
			// username, аватар) — иначе в клинике появится карточка без имени.
			const account =
				(await getUserByPhone(newPhone)) ??
				(await registerUser(newPhone, useMessenger().userFields()))
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

	return { token, client, clientName, checkAuth, signIn, logout }
}
