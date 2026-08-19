import { api } from '@/api/http'

// Филиалы клиники. Требует авторизации (Bearer).
// Элемент: { id, title, latitude, longitude } — title это адрес филиала.
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
