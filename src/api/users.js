import { api } from '@/api/http'
import { COMPANY_ID } from '@/config'

// Поиск клиента по телефону — вход в приложение.
// Возвращает клиента с access_token или null, если такого номера нет.
// `company_id` — в какой клинике искать: база общая на всех (просьба бэкендера).
export function getUserByPhone(phone) {
	return api
		.get('/user/by-phone', { params: { phone, company_id: COMPANY_ID } })
		.then((r) => r.data)
}

// Опознание клиента по аккаунту мессенджера: `chat_id` — это `id` аккаунта MAX
// (`initDataUnsafe.user.id`), который бэкенд запомнил при регистрации.
// Авторизации не требует: на известном chat_id отдаёт клиента с access_token,
// на неизвестном — `null`. Нужен на сплэше, чтобы не спрашивать согласия и
// номер у того, кто уже зарегистрирован.
export function getUserByChatId(chatId) {
	return api
		.get('/user/check-chat-id', { params: { chat_id: chatId, company_id: COMPANY_ID } })
		.then((r) => r.data)
}

// Регистрация нового клиента по телефону. Авторизации не требует, в ответе
// приходит клиент с access_token — как и у поиска по номеру.
// source сейчас 'max': бэкенд ждёт его от мини-аппы мессенджера.
//
// company_id уходит и в query (так просил бэкендер), и в теле — клиника в базе
// не одна, а без привязки заводить клиента нечем. В теле поле оставлено с тех
// пор, когда query-параметра не было: бэкенд его не подтверждал, но и не мешает.
export function registerUser(phone, data = {}) {
	return api
		.post(
			'/user/register-telegram',
			{ phone, company_id: COMPANY_ID, ...data },
			{ params: { source: 'max', company_id: COMPANY_ID } },
		)
		.then((r) => r.data)
}
