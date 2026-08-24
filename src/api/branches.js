import { api } from '@/api/http'

// Филиалы клиники. Требует авторизации (Bearer).
// Элемент: { id, title, latitude, longitude } — title это адрес филиала.
export function getBranches() {
	console.log('Branches')
	console.log('Branches')
	console.log('Branches')
	console.log('Branches')

	return api.get('/branch/index').then((r) => r.data ?? [])
}
