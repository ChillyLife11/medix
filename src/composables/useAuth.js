// Вход клиента: идентификация по номеру телефона. Боевой номер отдаёт MAX
// (см. @/composables/useMessenger); в dev-сборке вне мессенджера остаётся
// отладочный из конфига, в прод-сборке фолбэка нет.
// Само состояние сессии — в @/session.

import { computed, ref } from 'vue'
import { getUserByChatId, getUserByPhone, registerUser } from '@/api/users'
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
	// ищется заново.
	//
	// В MAX номера на этом шаге ещё нет: мессенджер отдаёт его только по
	// действию пользователя (`requestContact` в окне согласий). Зато есть id
	// аккаунта — по нему и опознаём уже зарегистрированного клиента, чтобы не
	// показывать согласия каждый запуск. Неизвестный аккаунт → согласия и номер.
	// Вне MAX прод-сборке взять номер неоткуда, отладочный вход есть только в dev.
	async function checkAuth() {
		if (token.value) return 'authed'
		const { isMax, user } = useMessenger()
		if (isMax) return (await signInByChatId(user?.id)) ? 'authed' : 'need-register'
		if (!FALLBACK_PHONE) return 'need-register'
		return (await signIn(FALLBACK_PHONE)) ? 'authed' : 'need-register'
	}

	// Вход без номера — по id аккаунта мессенджера. Работает только для клиента,
	// которого бэкенд уже связал с MAX (это делает `register-telegram`): для
	// остальных `check-chat-id` отдаёт null, и мы честно идём за согласиями.
	async function signInByChatId(chatId) {
		if (!chatId) return false
		try {
			const account = await getUserByChatId(chatId)
			if (!account?.access_token) return false
			setSession(account, account.phone ?? null)
			client.value = account
			return true
		} catch (e) {
			console.warn('[auth] check-chat-id failed', e)
			return false
		}
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
