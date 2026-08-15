// Всё, что приложение держит в localStorage — в одном месте.
// Схема как в React-оригинале: храним только идентификаторы и флаги, профиль
// клиента (имя, телефон, аватар) не сохраняем — он приходит из мессенджера
// или с сервера.

const KEYS = {
	token: 'token', // access_token, уходит в Bearer
	userId: 'user_id', // id клиента в CRM (client_id в запросах)
	privacy: 'privacy', // согласие на обработку ПДн
	policy: 'policy', // согласие на рассылку
	companyId: 'company_id',
	defaultCategory: 'defaultCategory',
	selectedCategory: 'selected_category', // «повторить запись»: выбор из истории
	selectedService: 'selected_service',
}

function get(key) {
	return localStorage.getItem(key)
}

// null/undefined трактуем как «удалить», чтобы не получить строку "null".
function set(key, value) {
	if (value === null || value === undefined) localStorage.removeItem(key)
	else localStorage.setItem(key, String(value))
}

export const storage = {
	get token() {
		return get(KEYS.token)
	},
	get userId() {
		return get(KEYS.userId)
	},
	get privacy() {
		return get(KEYS.privacy) === 'true'
	},
	get policy() {
		return get(KEYS.policy) === 'true'
	},
	get companyId() {
		return get(KEYS.companyId)
	},
	get defaultCategory() {
		return get(KEYS.defaultCategory)
	},

	// Сессия: токен + id клиента. Пишутся вместе после check/register.
	setSession({ token, userId }) {
		set(KEYS.token, token)
		set(KEYS.userId, userId)
	},
	clearSession() {
		set(KEYS.token, null)
		set(KEYS.userId, null)
	},

	// Согласия — чтобы не показывать экран /agree повторно.
	setConsents({ privacy, policy }) {
		set(KEYS.privacy, privacy)
		set(KEYS.policy, policy)
	},

	setCompany({ companyId, defaultCategory }) {
		set(KEYS.companyId, companyId)
		set(KEYS.defaultCategory, defaultCategory)
	},

	// Выбор для «повторить запись»: кладём на экране истории, забираем один раз
	// на экране записи (как в оригинале — с удалением после чтения).
	setSelection({ categoryId, serviceId }) {
		set(KEYS.selectedCategory, categoryId)
		set(KEYS.selectedService, serviceId)
	},
	takeSelection() {
		const categoryId = get(KEYS.selectedCategory)
		const serviceId = get(KEYS.selectedService)
		set(KEYS.selectedCategory, null)
		set(KEYS.selectedService, null)
		return categoryId && serviceId ? { categoryId, serviceId } : null
	},
}
