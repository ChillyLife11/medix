import { api } from '@/api/http'
import { COMPANY_ID } from '@/config'
import { clientId } from '@/session'

// Отзыв из окна обратной связи: POST /review/create.
//
// Поля те же, что у бэкенда в описании метода (`user_id` — id клиента,
// `company_id`, `text`), но шлём их JSON, а не multipart/form-data: так же,
// как остальные методы приложения.
export function sendFeedback(text) {
	return api
		.post('/review/create', {
			user_id: clientId.value,
			company_id: COMPANY_ID,
			text,
		})
		.then((r) => r.data)
}
