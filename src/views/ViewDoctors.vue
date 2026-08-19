<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import UiBtn from '@/components/ui/UiBtn.vue'
import UiPageTitle from '@/components/ui/UiPageTitle.vue'
import UiLoader from '@/components/ui/UiLoader.vue'
import DoctorCard from '@/components/doctor/DoctorCard.vue'
import { getCoworkers, loadedCoworkers } from '@/api/coworkers'
import { useBooking } from '@/composables/useBooking'

const router = useRouter()
const { serviceId, masterId } = useBooking()

// Заглушка, пока бэкенд не отдаёт фото врача (public/images).
const defaultPhoto = `${import.meta.env.BASE_URL}images/doctor-img.png`

const doctors = ref([])
const failed = ref(false)
const selected = ref(null)

// В ответе может не быть разложенного ФИО — тогда показываем username.
const surnameOf = (c) => c.last_name || c.username
const nameOf = (c) => [c.first_name, c.middle_name].filter(Boolean).join(' ')
// Должность придёт с бэка позже — пока подставляем дефолт.
const positionOf = (c) => c.position || 'Терапевт'

// Оставляем только тех, кто оказывает выбранную услугу.
const providesService = (coworker) =>
	!serviceId.value || (coworker.services ?? []).some((s) => s.id === serviceId.value)

// Ранее выбранного врача возвращаем, только если он есть в текущем списке:
// после смены услуги он мог из него выпасть.
function fill(coworkers) {
	doctors.value = coworkers.filter(providesService)
	const keepSelected = doctors.value.some((d) => d.id === masterId.value)
	selected.value = keepSelected ? masterId.value : (doctors.value[0]?.id ?? null)
}

// При возврате назад врачи уже в кеше — берём их сразу, без запроса и лоадера.
const cached = loadedCoworkers()
if (cached) fill(cached)
const loading = ref(!cached)

onMounted(async () => {
	if (!loading.value) return
	try {
		fill(await getCoworkers())
	} catch (e) {
		console.warn('[doctors] coworker/index failed', e)
		failed.value = true
	} finally {
		loading.value = false
	}
})

function submit() {
	masterId.value = selected.value
	router.push('/datetime')
}
</script>

<template>
	<div class="min-h-screen flex flex-col p-2.5">
		<UiPageTitle>Выбрать врача</UiPageTitle>

		<UiLoader v-if="loading" label="Загружаем врачей" />

		<div v-else-if="failed" class="p-5 rounded-4xl bg-card text-15 text-gray">
			Не удалось загрузить врачей. Попробуйте позже.
		</div>

		<div v-else-if="!doctors.length" class="p-5 rounded-4xl bg-card text-15 text-gray">
			По выбранной услуге врачей нет — попробуйте выбрать другую.
		</div>

		<div v-else class="space-y-4">
			<DoctorCard
				v-for="doctor in doctors"
				:key="doctor.id"
				:surname="surnameOf(doctor)"
				:name="nameOf(doctor)"
				:specialty="positionOf(doctor)"
				:photo="doctor.avatar || defaultPhoto"
				:selected="selected === doctor.id"
				@click="selected = doctor.id"
			/>
		</div>

		<UiBtn :disabled="!selected" class="sticky bottom-2.5 left-0 mt-auto" fluid @click="submit">
			Выбрать врача
		</UiBtn>
	</div>
</template>
