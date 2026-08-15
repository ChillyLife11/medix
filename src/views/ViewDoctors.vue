<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import UiBtn from '@/components/ui/UiBtn.vue'
import UiPageTitle from '@/components/ui/UiPageTitle.vue'
import DoctorCard from '@/components/doctor/DoctorCard.vue'
import { getCoworkers } from '@/api/coworkers'
import { useBooking } from '@/composables/useBooking'

const router = useRouter()
const { serviceId, doctorId } = useBooking()

const doctors = ref([])
const loading = ref(true)
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

onMounted(async () => {
	try {
		doctors.value = (await getCoworkers()).filter(providesService)
		selected.value = doctorId.value ?? doctors.value[0]?.id ?? null
	} catch (e) {
		console.warn('[doctors] coworker/index failed', e)
		failed.value = true
	} finally {
		loading.value = false
	}
})

function submit() {
	doctorId.value = selected.value
	router.push('/datetime')
}
</script>

<template>
	<div class="min-h-screen flex flex-col p-2.5">
		<UiPageTitle>Выбрать врача</UiPageTitle>

		<div v-if="loading" class="space-y-4">
			<div v-for="i in 3" :key="i" class="h-37 rounded-[30px] bg-card animate-pulse" />
		</div>

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
				:photo="doctor.avatar || '/doctor-img.png'"
				:selected="selected === doctor.id"
				@click="selected = doctor.id"
			/>
		</div>

		<UiBtn :disabled="!selected" class="sticky bottom-2.5 left-0 mt-auto" fluid @click="submit">
			Выбрать врача
		</UiBtn>
	</div>
</template>
