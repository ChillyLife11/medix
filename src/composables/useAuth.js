// Авторизация клиента. Как в React-оригинале, в localStorage лежат только
// токен и id клиента (+ флаги согласий) — см. @/lib/storage. Данные профиля
// не сохраняем: они приходят из мессенджера или с сервера.

import { ref } from 'vue'
import { checkChatId, registerMessenger } from '@/api/users'
import { useMessenger } from '@/composables/useMessenger'
import { storage } from '@/lib/storage'

const token = ref(storage.token)
const client = ref(null)

// Сохраняем аккаунт из ответа бэка (check-chat-id / register).
function persist(account) {
	if (!account?.access_token) return false
	token.value = account.access_token
	client.value = account
	storage.setSession({ token: account.access_token, userId: account.id })
	return true
}

export function useAuth() {
	const { user } = useMessenger()

	// Решает состояние авторизации: 'authed' | 'need-register'.
	// Есть токен → авторизован; иначе по user.id спрашиваем check-chat-id.
	async function checkAuth() {
		if (token.value) return 'authed'
		if (!user?.id) return 'need-register'
		try {
			const account = await checkChatId(user.id)
			if (persist(account)) return 'authed'
		} catch (e) {
			console.warn('[auth] check-chat-id failed', e)
		}
		return 'need-register'
	}

	// Регистрация через MAX: телефон, данные пользователя мессенджера и согласия.
	async function register(phone, consents = { privacy: true, policy: true }) {
		if (!user?.id) return false
		try {
			const account = await registerMessenger('max', {
				id: user.id,
				phone,
				first_name: user.firstName,
				last_name: user.lastName,
				username: user.username,
				avatar: user.avatar ?? '',
				privacy_accepted: consents.privacy,
				policy_accepted: consents.policy,
			})
			if (!persist(account)) return false
			storage.setConsents(consents)
			return true
		} catch (e) {
			console.warn('[auth] register failed', e)
			return false
		}
	}

	function logout() {
		token.value = null
		client.value = null
		storage.clearSession()
	}

	return { token, client, checkAuth, register, logout, saveAccount: persist }
}
