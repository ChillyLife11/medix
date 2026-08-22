import { api } from '@/api/http'

// Расписание специалиста. Сам список врачей приходит внутри филиала
// (см. @/api/branches), отдельного запроса за сотрудниками нет.

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
