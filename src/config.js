// Единая конфигурация бэкенда.
// В dev запросы идут через прокси Vite (/api → medix.amgs.online) — база
// относительная, так же как в React-оригинале, чтобы обойти CORS.
export const API_BASE = '/api'
export const COMPANY_ID = Number(import.meta.env.VITE_COMPANY_ID ?? 1)

// Картинки приходят путями вида /uploads/... — их нужно префиксовать хостом бэка
// (прокси в dev настроен только на /api).
export const MEDIA_BASE = import.meta.env.VITE_API_HOST ?? 'https://dental-web.pro'

export function fileUrl(path) {
	if (!path) return ''
	if (/^https?:\/\//.test(path)) return path
	return MEDIA_BASE + (path.startsWith('/') ? path : `/${path}`)
}
