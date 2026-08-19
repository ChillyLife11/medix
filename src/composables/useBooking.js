// Состояние флоу записи: филиал → услуга → врач → дата/время.
// Экраны разнесены по роутам, поэтому выбор держим в одном модульном состоянии,
// а не в каждой вьюхе отдельно.
//
// Имена совпадают с ключами API:
//   client_id — id клиента (после входа, лежит в @/session)
//   master_id — id врача (из /coworker/index)
//   branch_id — id филиала (из /branch/index)

import { ref } from 'vue'
import { COMPANY_ID } from '@/config'
import { clientId } from '@/session'

const branchId = ref(null)
const serviceId = ref(null)
const masterId = ref(null)
const date = ref(null)
const time = ref(null)

function reset() {
	branchId.value = null
	serviceId.value = null
	masterId.value = null
	date.value = null
	time.value = null
}

// Длительность приёма: бэкенд ждёт конец интервала (end). Сетка времени на
// экране часовая, но окно записи — 30 минут, как в примере запроса из API.
const APPOINTMENT_MINUTES = 30

function addMinutes(startTime, minutes) {
	const [hours, mins] = startTime.split(':').map(Number)
	const total = hours * 60 + mins + minutes
	const pad = (n) => String(n).padStart(2, '0')
	return `${pad(Math.floor(total / 60) % 24)}:${pad(total % 60)}`
}

// Тело запроса POST /appointment/create.
// Status именно с большой буквы — так поле называется в API.
function appointmentPayload() {
	return {
		company_id: COMPANY_ID,
		client_id: clientId.value,
		branch_id: branchId.value,
		master_id: masterId.value,
		date: date.value,
		start: time.value,
		end: addMinutes(time.value, APPOINTMENT_MINUTES),
		Status: 0,
		services: serviceId.value ? [serviceId.value] : [],
		source: 'max',
	}
}

// Все ли шаги пройдены (и известен клиент) — без этого запись отправлять нечего.
function isComplete() {
	return Boolean(
		clientId.value &&
		branchId.value &&
		serviceId.value &&
		masterId.value &&
		date.value &&
		time.value,
	)
}

export function useBooking() {
	return { branchId, serviceId, masterId, date, time, reset, appointmentPayload, isComplete }
}
