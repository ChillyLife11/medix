import { api } from '@/api/http'
import { COMPANY_ID } from '@/config'
import { clientId } from '@/session'

// Отзыв из окна обратной связи: POST /review/create.
//
// Тело — multipart/form-data (так описан метод у бэкенда), поля:
// user_id — id клиента, company_id и text. Content-Type проставляет браузер
// сам вместе с boundary, поэтому заголовок руками не задаём.
export function sendFeedback(text) {
	const body = new FormData()
	body.append('user_id', clientId.value ?? '')
	body.append('company_id', COMPANY_ID)
	body.append('text', text)

	return api.post('/review/create', body).then((r) => r.data)
}
