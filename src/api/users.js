import { api } from '@/api/http'
import { COMPANY_ID } from '@/config'

// Поиск клиента по телефону — вход в приложение.
// Возвращает клиента с access_token или null, если такого номера нет.
export function getUserByPhone(phone) {
	return api.get('/user/by-phone', { params: { phone } }).then((r) => r.data)
}

// Опознание клиента по аккаунту мессенджера: `chat_id` — это `id` аккаунта MAX
// (`initDataUnsafe.user.id`), который бэкенд запомнил при регистрации.
// Авторизации не требует: на известном chat_id отдаёт клиента с access_token,
// на неизвестном — `null`. Нужен на сплэше, чтобы не спрашивать согласия и
// номер у того, кто уже зарегистрирован.
export function getUserByChatId(chatId) {
	return api.get('/user/check-chat-id', { params: { chat_id: chatId } }).then((r) => r.data)
}

// Регистрация нового клиента по телефону. Авторизации не требует, в ответе
// приходит клиент с access_token — как и у поиска по номеру.
// source сейчас 'max': бэкенд ждёт его от мини-аппы мессенджера.
//
// company_id шлём, потому что клиника в базе не одна: поиск по номеру идёт
// глобально, а вот заводить клиента без привязки к компании бэкенду, судя по
// остальным методам (`appointment/create`, фильтр акций), нечем.
// Ждёт ли он это поле именно в теле — у бэкенда не подтверждено.
export function registerUser(phone, data = {}) {
	return api
		.post(
			'/user/register-telegram',
			{ phone, company_id: COMPANY_ID, ...data },
			{ params: { source: 'max' } },
		)
		.then((r) => r.data)
}
