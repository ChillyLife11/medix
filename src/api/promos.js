import { api } from '@/api/http'
import { COMPANY_ID } from '@/config'

// Акции компании.
// Элемент: { id, title, summary (HTML), description, image, company_id,
// created_at, updated_at } — created_at/updated_at это unix-секунды.
export function getPromos() {
	return api
		.get('/promo/index', { params: { 'filter[company_id]': COMPANY_ID } })
		.then((r) => r.data ?? [])
}

export function getPromo(id) {
	return api.get(`/promo/view`, { params: { id } }).then((r) => r.data)
}
