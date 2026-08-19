// Записи клиента: загрузка + форматирование под карточки и слайдер.
// Экземпляр состояния — на каждый экран свой: записи меняются, кешировать их
// на сессию нельзя (в отличие от филиалов и врачей).

import { computed, ref } from 'vue'
import { getAppointments, isCurrent } from '@/api/appointments'
import { clientId } from '@/session'

// Экранам нужен и признак отмены — отдаём его отсюда же, чтобы вьюхи
// импортировали всё из одного места.
export { isCanceled } from '@/api/appointments'

// Услуг в записи может быть несколько — показываем через запятую.
export function serviceTitle(appointment) {
	return (appointment.services ?? []).map((service) => service.title).join(', ') || 'Приём'
}

// Врач приходит вложенным объектом; если его в ответе нет — вернём пустую строку,
// вызывающий код такую строку прячет.
export function doctorName(appointment) {
	const master = appointment.master ?? appointment.user ?? appointment.coworker
	if (!master) return ''
	const name = [master.last_name, master.first_name, master.middle_name].filter(Boolean).join(' ')
	return name || master.username || ''
}

function toDate(appointment) {
	if (!appointment.date) return null
	const [year, month, day] = appointment.date.split('-').map(Number)
	return new Date(year, month - 1, day)
}

// "31.08.2026 / 12:00" — компактный вид для карточки списка.
export function dateLabel(appointment) {
	const [year, month, day] = (appointment.date ?? '').split('-')
	const date = day ? `${day}.${month}.${year}` : ''
	return [date, appointment.start].filter(Boolean).join(' / ')
}

const longDateFormatter = new Intl.DateTimeFormat('ru', {
	weekday: 'short',
	day: 'numeric',
	month: 'long',
	year: 'numeric',
})

// "Чт, 31 августа 2026" — развёрнутый вид для слайдера. Собираем из частей сами:
// Intl в русской локали пишет день недели строчной и добавляет « г.» после года,
// а плашке нужна одна строка и заглавная буква.
export function longDateLabel(appointment) {
	const date = toDate(appointment)
	if (!date) return ''
	const parts = Object.fromEntries(
		longDateFormatter.formatToParts(date).map((part) => [part.type, part.value]),
	)
	const weekday = parts.weekday.charAt(0).toUpperCase() + parts.weekday.slice(1)
	return `${weekday}, ${parts.day} ${parts.month} ${parts.year}`
}

// "12:00 - 12:30"; если конца нет, показываем только начало.
export function timeRange(appointment) {
	return [appointment.start, appointment.end].filter(Boolean).join(' - ')
}

export function useAppointments() {
	// appointments — всё, что отдал сервер: и прошедшие, и отменённые (история).
	// current — только актуальные: слайдер на главной показывает лишь их.
	const appointments = ref([])
	const loading = ref(true)
	const failed = ref(false)

	const current = computed(() => appointments.value.filter((a) => isCurrent(a)))

	async function load() {
		if (!clientId.value) {
			loading.value = false
			return
		}
		loading.value = true
		failed.value = false
		try {
			appointments.value = await getAppointments(clientId.value)
		} catch (e) {
			console.warn('[appointments] index failed', e)
			failed.value = true
		} finally {
			loading.value = false
		}
	}

	return { appointments, current, loading, failed, load }
}
