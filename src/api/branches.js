import { api } from '@/api/http'

// Филиалы клиники. Требует авторизации (Bearer).
// Элемент: { id, title, address, company_id, services[], coworkers[] } —
// услуги и сотрудники филиала приходят вложенными, отдельных запросов нет.
// Сотрудник: { id, username, status, services[], profile: { first_name,
// last_name, avatar, phone } }.
// За сессию список не меняется, а по шагам записи ходят вперёд-назад — поэтому
// держим загруженное: повторный заход на экран не ждёт сеть.
let branches = null
let request = null

export function getBranches() {
	if (!request) {
		request = api
			.get('/branch/index')
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
