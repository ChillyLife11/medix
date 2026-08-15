// Состояние флоу записи: филиал → услуга → врач → дата/время.
// Экраны разнесены по роутам, поэтому выбор держим в одном модульном состоянии,
// а не в каждой вьюхе отдельно.
//
// Имена совпадают с ключами API:
//   client_id — id клиента (после регистрации/авторизации, лежит в storage.userId)
//   master_id — id врача (из /coworker/index)
//   branch_id — id филиала (из /branch/index)

import { ref } from 'vue'
import { storage } from '@/lib/storage'

const branchId = ref(null)
const serviceId = ref(null)
const masterId = ref(null)
const date = ref(null)
const time = ref(null)

function reset() {
	branchId.value = null
	serviceId.value = null
	masterId.value = null
	date.value = null
	time.value = null
}

// Идентификаторы для тела запроса записи.
function payloadIds() {
	return {
		client_id: Number(storage.userId) || null,
		master_id: masterId.value,
		branch_id: branchId.value,
	}
}

export function useBooking() {
	return { branchId, serviceId, masterId, date, time, reset, payloadIds }
}
