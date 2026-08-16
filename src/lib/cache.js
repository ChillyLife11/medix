// Кеш запросов на время сессии.
//
// Справочники (филиалы, врачи) за сессию не меняются, а по шагам записи ходят
// вперёд-назад — без кеша каждый возврат назад дёргает сеть и показывает
// лоадер заново. Держим и промис (чтобы параллельные вызовы не дублировали
// запрос), и уже полученные данные (чтобы отдать их синхронно, без лоадера).

const requests = new Map()
const results = new Map()

// Запрос, который выполняется один раз на ключ. Ошибку не кешируем —
// следующий вызов попробует снова.
export function cachedRequest(key, request) {
	if (!requests.has(key)) {
		const promise = request()
			.then((data) => {
				results.set(key, data)
				return data
			})
			.catch((e) => {
				requests.delete(key)
				throw e
			})
		requests.set(key, promise)
	}
	return requests.get(key)
}

// Уже загруженные данные — синхронно; undefined, если запроса ещё не было.
export function cachedResult(key) {
	return results.get(key)
}

// Сбросить кеш: без ключа — весь.
export function dropCache(key) {
	if (key === undefined) {
		requests.clear()
		results.clear()
		return
	}
	requests.delete(key)
	results.delete(key)
}
