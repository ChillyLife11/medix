// Связь с мессенджером MAX.
//
// SDK подключён в index.html (https://st.max.ru/js/max-web-app.js) и создаёт
// window.WebApp синхронно, разбирая данные пользователя из URL ещё до старта Vue.
// Поэтому просто читаем их один раз — они не меняются в течение сессии.

const webApp = window.WebApp ?? null

// MAX-пользователь → удобный вид. null, если запущено вне MAX.
function normalizeUser(u) {
	if (!u) return null
	return {
		id: Number(u.id),
		username: u.username,
		firstName: u.first_name,
		lastName: u.last_name,
		avatar: u.photo_url,
	}
}

// В DEV (обычный браузер) MAX не отдаёт пользователя — подставляем тестового,
// чтобы отлаживать авторизацию и запись. В прод-сборку этот код не попадает.
const rawUser =
	webApp?.initDataUnsafe?.user ??
	(import.meta.env.DEV
		? { id: 1, first_name: 'Иван', last_name: 'Иванов', username: 'ivan' }
		: null)

const user = normalizeUser(rawUser)
const isMax = ['ios', 'android', 'desktop', 'web'].includes(webApp?.platform)

// Сообщаем MAX, что приложение готово (вызываем один раз при старте — App.vue).
export function initMessenger() {
	webApp?.ready()
}

export function useMessenger() {
	return {
		user, // { id, username, firstName, lastName, avatar } | null
		isMax, // запущено внутри MAX-клиента
		initData: webApp?.initData ?? '', // для проверки подписи на бэке
		// Нативный запрос телефона. Вне MAX (DEV в браузере) — тестовый номер,
		// чтобы отлаживать регистрацию.
		requestPhone: () =>
			webApp?.requestContact?.() ?? (import.meta.env.DEV ? '71111111113' : null),
	}
}
