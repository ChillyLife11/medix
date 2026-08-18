import { api } from '@/api/http'

// Записи клиента, свежие сверху.
// Элемент: { id, date, start, end, timestamp, client, services, categories, branch }.
export function getAppointments(clientId) {
	return api
		.get('/appointment/index', { params: { 'filter[client_id]': clientId, sort: '-date' } })
		.then((r) => r.data ?? [])
}

// Статусы: 0 лист ожидания, 1 отправлен, 2 SMS, 4 подтверждён,
// 5 выполнен, 6 отменён. Текущими считаем активные.
const ACTIVE_STATUSES = [0, 1, 2, 4]
const CANCELED_STATUS = 6

// Текущие записи: активный статус (если он вообще пришёл) и дата не в прошлом.
// Проверяем и то и другое: статус в ответе бывает не у всех записей, а «выполнен»
// бэкенд проставляет не сразу.
export function isCurrent(appointment, from = new Date()) {
	if (appointment.status !== undefined && !ACTIVE_STATUSES.includes(Number(appointment.status))) {
		return false
	}
	if (!appointment.date) return true
	const [year, month, day] = appointment.date.split('-').map(Number)
	const [hours, minutes] = (appointment.start ?? '23:59').split(':').map(Number)
	return new Date(year, month - 1, day, hours, minutes) >= from
}

// Отменённая запись — строго по статусу, дата тут ни при чём: в истории такие
// показываем крестом, а не галочкой. Без статуса в ответе считаем неотменённой.
export function isCanceled(appointment) {
	return Number(appointment.status) === CANCELED_STATUS
}

// Создание записи. Тело собирает useBooking (appointmentPayload).
// Ответ: { id, date, start, end, timestamp, client, services, categories, branch }.
export function createAppointment(payload) {
	return api.post('/appointment/create', payload).then((r) => r.data)
}
