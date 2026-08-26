// Вход клиента: идентификация по номеру телефона. Боевой номер отдаёт MAX
// (см. @/composables/useMessenger); в dev-сборке вне мессенджера остаётся
// отладочный из конфига, в прод-сборке фолбэка нет.
// Само состояние сессии — в @/session.

import { computed, ref } from 'vue'
import { getUserByChatId, getUserByPhone, registerUser } from '@/api/users'
import { FALLBACK_PHONE, fileUrl } from '@/config'
import { clearSession, setSession, token } from '@/session'
import { useMessenger } from '@/composables/useMessenger'

const client = ref(null)

// ФИО клиента. У сотрудников оно лежит во вложенном profile (см. @/api/branches),
// а клиент из `by-phone` / `check-chat-id` приходит с плоскими полями — читаем оба.
function profileName(account) {
	const source = account?.profile ?? account
	return [source?.first_name, source?.last_name].filter(Boolean).join(' ')
}

// Аватар клиента с бэкенда. Когда картинки нет, поле не пустое: приходит голый
// хост (`https://dental-web.pro/`) — бэкенд склеил базу с пустым путём. Такую
// ссылку показывать нечем, поэтому считаем её отсутствующей.
function profilePhoto(account) {
	const raw = account?.avatar || account?.profile?.avatar || ''
	if (!raw) return ''
	const url = fileUrl(raw)
	try {
		return new URL(url).pathname === '/' ? '' : url
	} catch {
		return ''
	}
}

// Имя для экранов: сначала аккаунт MAX, потом карточка клиента на бэкенде.
// Заглушка нужна только вне мессенджера — в MAX имя есть всегда.
const clientName = computed(() => useMessenger().userName || profileName(client.value) || 'Пациент')

// Аватар для экранов — тем же порядком. Пустая строка означает «показывайте
// свою заглушку»: какая именно, решает экран.
const clientPhoto = computed(() => useMessenger().userPhoto || profilePhoto(client.value))

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

	return { token, client, clientName, clientPhoto, checkAuth, signIn, logout }
}
