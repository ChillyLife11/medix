import { api } from '@/api/http'

// Филиалы клиники. Требует авторизации (Bearer).
// Элемент: { id, title, latitude, longitude } — title это адрес филиала.
export function getBranches() {
	return api.get('/branch/index').then((r) => r.data ?? [])
}
