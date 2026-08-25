// Журнал обмена с бэкендом для отладочных тостов (@/components/debug/HttpToasts).
// Нужен, потому что внутри MAX нет консоли: увидеть тело запроса и ответ можно
// только на самом экране. Включается флагом DEBUG_HTTP в @/config.

import { ref } from 'vue'

// Держим только последние записи: экран узкий, а запросов за сессию много.
const LIMIT = 8

const entries = ref([])
let nextId = 1

// Токен в ответе на вход/регистрацию показываем огрызком: по скриншоту из чата
// им не должны воспользоваться.
function maskTokens(text) {
	return text.replace(/("access_token"\s*:\s*")([^"]{8,})(")/g, (_, head, value, tail) => {
		return `${head}${value.slice(0, 6)}…(${value.length} символов)${tail}`
	})
}

// Тело и параметры приходят то объектом, то уже готовой строкой — приводим к
// одному виду и обрезаем, чтобы длинный ответ не занял весь экран.
export function preview(value, limit = 700) {
	if (value === undefined || value === null) return ''
	let text
	if (typeof value === 'string') {
		text = value
	} else {
		try {
			text = JSON.stringify(value, null, 1)
		} catch {
			text = String(value)
		}
	}
	text = maskTokens(text)
	return text.length > limit ? `${text.slice(0, limit)}… (обрезано, всего ${text.length})` : text
}

export function pushHttpLog(entry) {
	entries.value = [{ id: nextId++, ...entry }, ...entries.value].slice(0, LIMIT)
}

export function useHttpLog() {
	function dismiss(id) {
		entries.value = entries.value.filter((entry) => entry.id !== id)
	}

	function clear() {
		entries.value = []
	}

	return { entries, dismiss, clear }
}
