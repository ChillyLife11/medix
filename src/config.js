// Единая конфигурация бэкенда.
// В dev запросы идут через прокси Vite (/api → VITE_API_HOST) — база
// относительная, так же как в React-оригинале, чтобы обойти CORS.
// На статике (GitHub Pages) прокси нет, поэтому сборка получает абсолютный
// адрес через VITE_API_BASE — там запросы уже зависят от CORS на бэкенде.
export const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'
export const COMPANY_ID = Number(import.meta.env.VITE_COMPANY_ID ?? 3)

// Боевой источник номера — MAX (`requestContact`, см. @/composables/useMessenger).
// Тестовый номер нужен только для отладки в браузере, где мессенджера нет.
export const TEST_PHONE = '71111111113'

// В прод-сборке фолбэка нет вовсе: иначе сбой определения платформы (MAX отдал
// неизвестный `platform`) молча пустил бы живого пользователя в тестовый
// аккаунт — с чужими записями и без единой ошибки на экране.
export const FALLBACK_PHONE = import.meta.env.DEV ? TEST_PHONE : null

// Отладочные тосты с обменом по API: тело запроса и ответ поверх интерфейса —
// внутри MAX нет консоли, иначе обмен не увидеть. Сейчас выключены; код цел
// (@/composables/useHttpLog, @/components/debug/HttpToasts и пара перехватчиков
// в @/api/http), достаточно вернуть true. Перед релизом можно удалить совсем.
export const DEBUG_HTTP = false

// Картинки приходят путями вида /uploads/... — их нужно префиксовать хостом бэка
// (прокси в dev настроен только на /api).
export const MEDIA_BASE = import.meta.env.VITE_API_HOST ?? 'https://medix.amgs.online'

export function fileUrl(path) {
	if (!path) return ''
	if (/^https?:\/\//.test(path)) return path
	return MEDIA_BASE + (path.startsWith('/') ? path : `/${path}`)
}
