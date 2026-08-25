import { api } from '@/api/http'
import { COMPANY_ID } from '@/config'
import { clientId } from '@/session'

// Отзыв из окна обратной связи.
//
// ⚠️ Путь и поля — ГИПОТЕЗА: эндпоинта под обратную связь нет ни в
// `Документация_API.md`, ни в React-оригинале. Взяли по образцу остальных
// методов (`appointment/create`): ресурс + /create, JSON, company_id и source.
// Пока бэкенд не подтвердит путь, отправка будет отвечать ошибкой — она видна
// пользователю в окне, а тело запроса и ответ — в отладочных тостах.
export function sendFeedback(text) {
	return api
		.post('/feedback/create', {
			company_id: COMPANY_ID,
			client_id: clientId.value,
			text,
			source: 'max',
		})
		.then((r) => r.data)
}
