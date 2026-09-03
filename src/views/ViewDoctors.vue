<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import UiBtn from '@/components/ui/UiBtn.vue'
import UiPageTitle from '@/components/ui/UiPageTitle.vue'
import UiLoader from '@/components/ui/UiLoader.vue'
import DoctorCard from '@/components/doctor/DoctorCard.vue'
import { getBranch, loadedBranch, nearestSlots } from '@/api/branches'
import { fileUrl } from '@/config'
import { useBooking } from '@/composables/useBooking'

const router = useRouter()
const { branchId, serviceId, masterId } = useBooking()

// Аватар приходит путём вида /uploads/Дабаев.jpg — префиксуем хостом бэка.
// Если фото нет, показываем заглушку из public/images.
const defaultPhoto = `${import.meta.env.BASE_URL}images/doctor-img.png`
const photoOf = (c) => (c.profile?.avatar ? fileUrl(c.profile.avatar) : defaultPhoto)

const branch = ref(null)
const doctors = ref([])
const failed = ref(false)
const selected = ref(null)

// ФИО лежит во вложенном profile, но у всех врачей с услугами поля перепутаны
// местами: фамилия приходит в first_name, имя — в last_name.
const surnameOf = (c) => c.profile?.first_name?.trim() || c.username
const nameOf = (c) => c.profile?.last_name?.trim() ?? ''
// Должность придёт с бэка позже — пока подставляем дефолт.
const positionOf = (c) => c.position || 'Терапевт'

// Оставляем только тех, кто оказывает выбранную услугу. У части сотрудников
// филиала услуг нет вовсе — записаться к ним нельзя, в список они не попадают.
const providesService = (coworker) =>
	(coworker.services ?? []).some((s) => s.id === serviceId.value)

// Ранее выбранного врача возвращаем, только если он есть в текущем списке:
// после смены услуги он мог из него выпасть.
function fill(loaded) {
	branch.value = loaded ?? null
	doctors.value = (loaded?.coworkers ?? []).filter(providesService)
	const keepSelected = doctors.value.some((d) => d.id === masterId.value)
	selected.value = keepSelected ? masterId.value : (doctors.value[0]?.id ?? null)
}

// Ближайший свободный день врача и первые три часа в нём — расписание приходит
// в филиале, отдельного запроса не нужно.
const dateFormatter = new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'long' })

const slotsOf = computed(() => {
	const byDoctor = new Map()
	for (const doctor of doctors.value) {
		const nearest = nearestSlots(branch.value, doctor.id)
		byDoctor.set(doctor.id, {
			date: nearest ? dateFormatter.format(new Date(`${nearest.date}T00:00`)) : '',
			times: nearest?.times ?? [],
		})
	}
	return byDoctor
})

// Врачи приходят вложенными в филиал — своего запроса у экрана нет.
const cached = loadedBranch(branchId.value)
if (cached) fill(cached)
const loading = ref(!cached)

onMounted(async () => {
	if (!loading.value) return
	try {
		fill(await getBranch(branchId.value))
	} catch (e) {
		console.warn('[doctors] branch/index failed', e)
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

		<div v-else class="space-y-4 pb-5">
			<DoctorCard
				v-for="doctor in doctors"
				:key="doctor.id"
				:surname="surnameOf(doctor)"
				:name="nameOf(doctor)"
				:specialty="positionOf(doctor)"
				:date="slotsOf.get(doctor.id)?.date"
				:times="slotsOf.get(doctor.id)?.times"
				:photo="photoOf(doctor)"
				:selected="selected === doctor.id"
				@click="selected = doctor.id"
			/>
		</div>

		<UiBtn
			:disabled="!selected"
			class="sticky bottom-7.5 left-0 z-10 mt-auto mb-5"
			fluid
			@click="submit"
		>
			Выбрать врача
		</UiBtn>
	</div>
</template>
