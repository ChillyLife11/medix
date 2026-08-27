// Слой мессенджера MAX. SDK подключён скриптом в index.html и создаёт глобал
// `window.WebApp` синхронно, ещё до старта Vue, — поэтому читаем его один раз,
// без поллинга, async и реактивности: за сессию он не меняется.
//
// Документация: dev.max.ru/docs/webapps/bridge

const webApp = typeof window === 'undefined' ? null : (window.WebApp ?? null)

// Вне MAX платформы нет — по ней и отличаем реальный клиент от обычного браузера
// (сам скрипт SDK грузится и там, так что наличия `window.WebApp` мало).
const PLATFORMS = ['ios', 'android', 'desktop', 'web']
const isMax = Boolean(webApp && PLATFORMS.includes(webApp.platform))

// Пользователь мессенджера: { id, first_name, last_name, username,
// language_code, photo_url }. Вне MAX его нет.
const user = webApp?.initDataUnsafe?.user ?? null

// «Иван Иванов» — как подписан аккаунт в мессенджере. Пустая строка, если
// пользователя нет: экраны сами решают, чем это заменить.
const userName = [user?.first_name, user?.last_name].filter(Boolean).join(' ')

// Аватар аккаунта. Пустая строка, если его нет или мы вне MAX.
const userPhoto = user?.photo_url ?? ''

// Данные аккаунта для регистрации клиента (`register-telegram` ждёт их рядом с
// номером). Вне MAX — пустой объект: в теле запроса лишних полей не появится.
function userFields() {
	if (!user) return {}
	return {
		id: user.id,
		first_name: user.first_name ?? '',
		last_name: user.last_name ?? '',
		username: user.username ?? '',
		avatar: user.photo_url ?? '',
	}
}

// Внешняя ссылка. Внутри мини-аппы PDF не отрисовывается — файл просто
// скачивается, поэтому в MAX отдаём ссылку хосту (`WebAppOpenLink`), и документ
// открывает системный браузер. Вернули false — значит SDK нет и ссылку надо
// открыть обычным способом.
function openLink(url) {
	if (typeof webApp?.openLink !== 'function') return false
	webApp.openLink(url)
	return true
}

// Отказ и ошибки приходят как { error: { code: 'client.request_phone.<reason>' } }.
const REASONS = {
	user_refused_provide_phone_number: 'refused',
	request_error: 'request-error',
}

function reasonOf(e) {
	const code = e?.error?.code ?? ''
	return REASONS[code.split('.').pop()] ?? 'unknown'
}

// Запрос номера телефона. `requestContact()` отдаёт промис
// { phone, authDate, hash }; номер приходит без «+» — ровно в том виде, в
// котором его ждёт наш бэкенд (79991234567).
//
// Возвращаем { phone, reason }, а не бросаем: отказ пользователя — это не
// исключительная ситуация, экран показывает по reason свой текст.
//   'no-sdk'        — приложение открыто вне MAX;
//   'refused'       — пользователь не дал номер;
//   'request-error' — сеть или бэкенд мессенджера;
//   'unknown'       — код ошибки, которого нет в документации.
async function requestPhone() {
	if (!webApp?.requestContact) return { phone: null, reason: 'no-sdk' }
	try {
		const contact = await webApp.requestContact()
		const phone = contact?.phone ?? null
		return { phone, reason: phone ? null : 'unknown' }
	} catch (e) {
		return { phone: null, reason: reasonOf(e) }
	}
}

export function useMessenger() {
	return { isMax, user, userName, userPhoto, userFields, requestPhone, openLink }
}
