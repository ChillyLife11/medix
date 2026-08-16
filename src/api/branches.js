import { api } from '@/api/http'
import { cachedRequest, cachedResult, dropCache } from '@/lib/cache'

// Филиалы клиники. Требует авторизации (Bearer).
// Элемент: { id, title, latitude, longitude } — title это адрес филиала.
// Список за сессию не меняется — запрашиваем один раз (см. lib/cache).
const BRANCHES = 'branch/index'

export function getBranches() {
	return cachedRequest(BRANCHES, () => api.get('/branch/index').then((r) => r.data ?? []))
}

// Уже загруженные филиалы (или undefined) — синхронно, для возврата на экран.
export function loadedBranches() {
	return cachedResult(BRANCHES)
}

export function dropBranchesCache() {
	dropCache(BRANCHES)
}
