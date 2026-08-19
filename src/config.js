// Единая конфигурация бэкенда.
// В dev запросы идут через прокси Vite (/api → VITE_API_HOST) — база
// относительная, так же как в React-оригинале, чтобы обойти CORS.
// На статике (GitHub Pages) прокси нет, поэтому сборка получает абсолютный
// адрес через VITE_API_BASE — там запросы уже зависят от CORS на бэкенде.
export const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'
export const COMPANY_ID = Number(import.meta.env.VITE_COMPANY_ID ?? 1)

// Пока телефон брать неоткуда — вернётся из MAX (requestContact), когда
// подключим мессенджер обратно. До тех пор входим по тестовому номеру.
export const TEST_PHONE = '71111111113'

// Картинки приходят путями вида /uploads/... — их нужно префиксовать хостом бэка
// (прокси в dev настроен только на /api).
export const MEDIA_BASE = import.meta.env.VITE_API_HOST ?? 'https://dental-web.pro'

export function fileUrl(path) {
	if (!path) return ''
	if (/^https?:\/\//.test(path)) return path
	return MEDIA_BASE + (path.startsWith('/') ? path : `/${path}`)
}
