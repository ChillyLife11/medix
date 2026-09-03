import { api } from '@/api/http'
import { COMPANY_ID } from '@/config'

// Статусы записи: 0 лист ожидания, 1 отправлен в МИС, 2 напоминание отправлено,
// 4 подтверждено, 5 выполнено, 6 отменено.
const COMPLETE_STATUS = 5
const CANCELED_STATUS = 6

// Записи клиента, свежие сверху.
// Элемент: { id, date, start, end, timestamp, client, services, categories, branch }.
//
// Бэкенд отдаёт все записи клиента разом, а экранам нужны разные половины:
// главной — актуальные, истории — выполненные и отменённые. Поэтому нужные
// статусы перечисляем в запросе — форму подтвердил бэкендер:
//   ?filter[status][]=0&filter[status][]=1&…&filter[company_id]=3
// Списки при этом делятся ещё и на клиенте (isCurrent/isHistorical в
// useAppointments): если фильтр не сработает, экраны всё равно покажут свою
// половину.
export const ACTIVE_STATUSES = [0, 1, 2, 3, 4]
export const HISTORY_STATUSES = [COMPLETE_STATUS, CANCELED_STATUS]

export function getAppointments(clientId, statuses = null) {
	const params = {
		'filter[client_id]': clientId,
		'filter[company_id]': COMPANY_ID,
		sort: '-date',
	}
	if (statuses) params['filter[status]'] = statuses

	return api.get('/appointment/index', { params }).then((r) => r.data ?? [])
}

// Запись ушла в историю — она выполнена (5) или отменена (6). Делим строго по
// статусу, дата тут ни при чём: «выполнено» бэкенд проставляет не сразу, и до
// этого запись остаётся в актуальных, даже если её время уже прошло.
export function isHistorical(appointment) {
	return isComplete(appointment) || isCanceled(appointment)
}

// Актуальные записи — всё остальное: лист ожидания, отправлено в МИС,
// напоминание, подтверждено, а также записи без статуса в ответе.
export function isCurrent(appointment) {
	return !isHistorical(appointment)
}

// Отменённая запись — строго по статусу, дата тут ни при чём: в истории такие
// показываем крестом, а не галочкой. Без статуса в ответе считаем неотменённой.
export function isCanceled(appointment) {
	return Number(appointment.status) === CANCELED_STATUS
}

// Выполненная запись — приём уже состоялся.
export function isComplete(appointment) {
	return Number(appointment.status) === COMPLETE_STATUS
}

// Что показывать в истории: галочку (выполнено), крест (отменено) или часы —
// на всех остальных статусах, включая случай, когда статуса в ответе нет.
export function statusKind(appointment) {
	if (isComplete(appointment)) return 'complete'
	if (isCanceled(appointment)) return 'canceled'
	return 'pending'
}

// Отмена записи: id уходит query-параметром, в ответе — обновлённая запись
// со статусом 6.
export function cancelAppointment(id) {
	return api.post('/appointment/cancel', null, { params: { id } }).then((r) => r.data)
}

// Создание записи. Тело собирает useBooking (appointmentPayload).
// Ответ: { id, date, start, end, timestamp, client, services, categories, branch }.
export function createAppointment(payload) {
	return api.post('/appointment/create', payload).then((r) => r.data)
}
