import { api } from '@/api/http'
import { COMPANY_ID } from '@/config'

// Сотрудники (врачи) клиники. Требует авторизации (Bearer).
// Элемент: { id, username, email, status, company_id, client_id, created_at,
// updated_at, last_login_at, services: [{ id, title, price, category_id, ... }] }
// — список услуг специалиста приходит вместе с его данными.
// Список нужен подряд на двух экранах (услуги и врачи) и при возврате назад —
// поэтому держим загруженное и не ходим в сеть повторно.
let coworkers = null
let request = null

export function getCoworkers() {
	if (!request) {
		request = api
			.get('/coworker/index', { params: { 'filter[company_id]': COMPANY_ID, sort: '-id' } })
			.then((r) => (coworkers = r.data ?? []))
			.catch((e) => {
				request = null
				throw e
			})
	}
	return request
}

// Уже загруженные врачи (или null) — синхронно, для возврата на экран.
export function loadedCoworkers() {
	return coworkers
}

export function getCoworker(id) {
	return api.get('/coworker/view', { params: { id } }).then((r) => r.data)
}

// Свободные слоты специалиста на дату (date = YYYY-MM-DD).
// master_id уезжает в параметре user_id — так его называет сам эндпоинт.
// Ответ: { "2026-08-14": { "239": ["09:00", "09:30", ...] } } — внешний ключ
// это дата, внутренний приходит от бэка (кабинет/ресурс).
export function getSchedule({ masterId, branchId, date }) {
	return api
		.get('/coworker/get-schedule', {
			params: { user_id: masterId, branch_id: branchId, date },
		})
		.then((r) => r.data ?? {})
}

// Плоский список времён на дату из ответа get-schedule.
export function scheduleTimes(schedule, date) {
	return Object.values(schedule?.[date] ?? {})
		.flat()
		.sort()
}
