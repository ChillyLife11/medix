// Состояние флоу записи: филиал → услуга → врач → дата/время.
// Экраны разнесены по роутам, поэтому выбор держим в одном модульном состоянии,
// а не в каждой вьюхе отдельно.

import { ref } from 'vue'

const branchId = ref(null)
const serviceId = ref(null)
const doctorId = ref(null)
const date = ref(null)
const time = ref(null)

function reset() {
	branchId.value = null
	serviceId.value = null
	doctorId.value = null
	date.value = null
	time.value = null
}

export function useBooking() {
	return { branchId, serviceId, doctorId, date, time, reset }
}
