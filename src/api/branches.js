import { api } from '@/api/http'
import { COMPANY_ID } from '@/config'
import { LEAD_MS } from '@/composables/useBooking'

// Филиалы клиники. Требует авторизации (Bearer).
// Без filter[company_id] бэкенд отдаёт филиалы всех клиник разом.
// Элемент: { id, title, address, company_id, services[], coworkers[] } —
// услуги и сотрудники филиала приходят вложенными, отдельных запросов нет.
// Сотрудник: { id, username, status, services[], profile: { first_name,
// last_name, avatar, phone } }.
// Держим загруженное на один сеанс записи: по шагам ходят вперёд-назад, и
// повторный заход на экран не должен ждать сеть. Кеш живёт от старта флоу
// (startBooking/startRepeat зовут dropBranches()) до его конца — расписание и
// состав врачей за это время не успевают устареть, а между записями данные
// берутся заново.
let branches = null
let request = null

// Забыть загруженное: следующий экран сходит за свежими данными. Зовётся из
// useBooking на старте любого сценария записи.
export function dropBranches() {
	branches = null
	request = null
}

export function getBranches() {
	if (!request) {
		request = api
			.get('/branch/index', { params: { 'filter[company_id]': COMPANY_ID } })
			.then((r) => (branches = r.data ?? []))
			.catch((e) => {
				request = null
				throw e
			})
	}
	return request
}

// Уже загруженные филиалы (или null) — синхронно, для возврата на экран.
export function loadedBranches() {
	return branches
}

// Филиал по id: из кеша, а если списка ещё нет — с запросом.
export async function getBranch(id) {
	const list = branches ?? (await getBranches())
	return list.find((branch) => branch.id === id) ?? null
}

// Филиал из уже загруженного списка (или null) — синхронно.
export function loadedBranch(id) {
	return branches?.find((branch) => branch.id === id) ?? null
}

// Каталог услуг всей клиники. Отдельного эндпоинта под услуги нет — они
// приходят вложенными в филиалы, поэтому склеиваем списки и убираем дубли.
// Одна и та же услуга в разных филиалах приходит с одним id (на этом же
// построена фильтрация врачей по услуге в ViewDoctors).
function uniqueServices(list) {
	const byId = new Map()
	for (const branch of list ?? []) {
		for (const service of branch.services ?? []) {
			if (!byId.has(service.id)) byId.set(service.id, service)
		}
	}
	return [...byId.values()]
}

export async function getAllServices() {
	return uniqueServices(await getBranches())
}

// Услуги из уже загруженных филиалов (или null) — синхронно.
export function loadedAllServices() {
	return branches ? uniqueServices(branches) : null
}

// Филиалы, где оказывают услугу. Для сценария «сначала услуга»: показываем
// только подходящие филиалы, а если он один — в списке останется он один.
function withService(list, serviceId) {
	return (list ?? []).filter((branch) =>
		(branch.services ?? []).some((service) => service.id === serviceId),
	)
}

export async function getBranchesWithService(serviceId) {
	return withService(await getBranches(), serviceId)
}

// Подходящие филиалы из уже загруженного списка (или null) — синхронно.
export function loadedBranchesWithService(serviceId) {
	return branches ? withService(branches, serviceId) : null
}

// Часы врача на дату. Бэкенд отдаёт их в двух видах: массивом ["09:00", …] и
// объектом { "1": "11:00", "3": "13:00" } — это PHP отдаёт разреженный массив
// (после занятых слотов индексы идут с пропусками) объектом, а не списком.
// Приводим оба вида к массиву времён.
function timeList(slots) {
	if (Array.isArray(slots)) return slots
	if (slots && typeof slots === 'object') return Object.values(slots)
	return []
}

// Врачи филиала на дату: { "<id врача>": часы }. День без приёма приходит
// пустым массивом вместо объекта — по той же причине, что и часы выше.
function bySchedule(branch, date) {
	const byMaster = branch?.schedule?.[date]
	return byMaster && !Array.isArray(byMaster) ? byMaster : {}
}

// Расписание филиала: { "YYYY-MM-DD": { "<id врача>": ["09:00", …] } }.
// Бэкенд отдаёт только ближайшие дни (около недели) и только рабочие — значит
// дни, которых в расписании нет, для записи закрыты.
// Врача учитываем: в один и тот же день в филиале принимают не все.
export function scheduleDates(branch, masterId = null) {
	const schedule = branch?.schedule ?? {}
	const open = Object.keys(schedule).filter((date) => {
		const byMaster = bySchedule(branch, date)
		return masterId === null
			? Object.values(byMaster).some((slots) => timeList(slots).length)
			: timeList(byMaster[masterId]).length > 0
	})
	return new Set(open)
}

// Адрес приходит как «город Улан-Удэ, Павлова, 59А» — в макете только улица
// и дом: «ул. Павлова, 59А». Нужен и в списке филиалов, и в сводке записи.
export function shortAddress(branch) {
	const parts = (branch?.address ?? '')
		.split(',')
		.map((part) => part.trim())
		.filter((part) => part && !/^(город|г\.?)\s/i.test(part))
	if (!parts.length) return branch?.title ?? ''
	const [street, ...rest] = parts
	const named = /^(ул|улица|просп|пр-т|мкр|бул)/i.test(street) ? street : `ул. ${street}`
	return [named, ...rest].join(', ')
}

// Часы врача на конкретный день — сетка времени на последнем шаге записи.
// masterId === null: объединяем часы всех врачей филиала (тот же режим, что и
// у scheduleDates), иначе берём только выбранного.
export function scheduleSlots(branch, masterId, date) {
	const byMaster = bySchedule(branch, date)
	if (masterId !== null && masterId !== undefined) return [...timeList(byMaster[masterId])].sort()
	const all = new Set()
	for (const slots of Object.values(byMaster)) for (const time of timeList(slots)) all.add(time)
	return [...all].sort()
}

// Ближайшие свободные часы врача — для карточки на экране выбора врача.
// Идём по датам расписания с начала и берём первый день, где ещё осталось
// время: прошедшие часы и ближайший час от «сейчас» не в счёт, как и на
// экране выбора времени.
export function nearestSlots(branch, masterId, count = 3) {
	const schedule = branch?.schedule ?? {}
	const now = Date.now()
	for (const date of Object.keys(schedule).sort()) {
		const times = timeList(bySchedule(branch, date)[masterId])
			.filter((time) => new Date(`${date}T${time}`).getTime() - now >= LEAD_MS)
			.sort()
		if (times.length) return { date, times: times.slice(0, count) }
	}
	return null
}
