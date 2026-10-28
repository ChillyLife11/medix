// Состояние флоу записи. Сценария два, различаются только первыми двумя шагами:
//   'branch'  — филиал → услуга → врач → дата/время (кнопка «Записаться»)
//   'service' — услуга → филиал → врач → дата/время (плитка «Услуги»)
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
import { dropBranches } from '@/api/branches'

const flow = ref('branch')
const branchId = ref(null)
const serviceId = ref(null)
const masterId = ref(null)
const date = ref(null)
const time = ref(null)

// ФИО пациента для записи — заполняется в окне подтверждения (обязательны
// фамилия и имя). Живёт отдельно от выбора шагов и reset() его не трогает: это
// данные о человеке, а не о конкретной записи, и при следующей записи их не
// нужно вводить заново.
const patient = ref({ lastName: '', firstName: '', middleName: '' })

const clean = (value) => String(value ?? '').trim()

function patientReady() {
	return Boolean(clean(patient.value.lastName) && clean(patient.value.firstName))
}

// Подставить ФИО, если пациент его ещё не вводил. Источник выбирает вызывающий
// (см. clientNameParts в @/composables/useAuth).
function fillPatient(parts = {}) {
	const current = patient.value
	if (clean(current.lastName) || clean(current.firstName) || clean(current.middleName)) return
	patient.value = {
		lastName: clean(parts.lastName),
		firstName: clean(parts.firstName),
		middleName: clean(parts.middleName),
	}
}

function reset() {
	branchId.value = null
	serviceId.value = null
	masterId.value = null
	date.value = null
	time.value = null
}

// Старт нового флоу с точки входа: сбрасываем прошлый выбор (иначе экраны
// подставят филиал и услугу от предыдущей записи) и запоминаем порядок шагов —
// по нему экраны решают, что грузить и куда вести дальше.
// Заодно забываем загруженные филиалы: справочник тянет за собой услуги, врачей
// и расписание, а они за время сеанса могли измениться — каждая новая запись
// начинается со свежих данных.
function startBooking(kind) {
	reset()
	dropBranches()
	flow.value = kind
}

// Сценарий «сначала услуга»: филиал выбирается уже под выбранную услугу.
function isServiceFirst() {
	return flow.value === 'service'
}

// Повтор записи из истории: подставляем прошлый выбор целиком, чтобы человеку
// осталось выбрать только дату и время. Дату и время не переносим — они в прошлом.
function startRepeat({ branch = null, service = null, master = null } = {}) {
	reset()
	dropBranches()
	flow.value = 'branch'
	branchId.value = branch
	serviceId.value = service
	masterId.value = master
}

// Записаться можно не раньше чем через час от текущего времени. Правило одно и
// для сетки времени на /datetime, и для ближайших слотов в карточке врача.
export const LEAD_MS = 60 * 60 * 1000

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
function appointmentPayload() {
	return {
		company_id: COMPANY_ID,
		client_id: clientId.value,
		branch_id: branchId.value,
		master_id: masterId.value,
		date: date.value,
		start: time.value,
		end: addMinutes(time.value, APPOINTMENT_MINUTES),
		status: 0,
		services: serviceId.value ? [serviceId.value] : [],
		source: 'max',
		// ⚠️ Порядок полей — как в описании метода от бэкенда (28.10.2026, прислан
		// для Нелип, бэкенд тот же): first_name — ФАМИЛИЯ, last_name — ИМЯ. Если в
		// клинике фамилия и имя окажутся переставлены — менять эти две строки.
		first_name: clean(patient.value.lastName),
		last_name: clean(patient.value.firstName),
		second_name: clean(patient.value.middleName),
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
		time.value &&
		patientReady(),
	)
}

export function useBooking() {
	return {
		flow,
		branchId,
		serviceId,
		masterId,
		date,
		time,
		startBooking,
		startRepeat,
		isServiceFirst,
		reset,
		appointmentPayload,
		isComplete,
		patient,
		patientReady,
		fillPatient,
	}
}
