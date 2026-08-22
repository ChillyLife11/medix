<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import UiBtn from '@/components/ui/UiBtn.vue'
import UiLoader from '@/components/ui/UiLoader.vue'
import HistoryCard from '@/components/history/HistoryCard.vue'
import UiTabbar from '@/components/ui/UiTabbar.vue'
import {
	useAppointments,
	serviceTitle,
	doctorName,
	dateLabel,
	statusKind,
	repeatSelection,
} from '@/composables/useAppointments'
import { useBooking } from '@/composables/useBooking'

const router = useRouter()
const { startBooking, startRepeat } = useBooking()

// Две точки входа в запись — с них и начинается порядок шагов.
function startFromBranch() {
	startBooking('branch')
	router.push('/branch')
}

function startFromService() {
	startBooking('service')
	router.push('/service')
}

// «Повторить»: подставляем филиал, услугу и врача из прошлой записи и ведём
// сразу на выбор даты и времени. Если чего-то из этого в записи нет, отправляем
// в обычный флоу — там недостающее выберут руками, найденное уже подставлено.
function repeat(appointment) {
	const selection = repeatSelection(appointment)
	startRepeat(selection)
	const ready = selection.branch && selection.service && selection.master
	router.push(ready ? '/datetime' : '/branch')
}

// История: только выполненные и отменённые записи. Актуальные (лист ожидания,
// отправлено в МИС, напоминание, подтверждено) живут в слайдере на главной.
const { history, loading, failed, load } = useAppointments()
// Картинки лежат в public/images — путь строим от базы сборки.
const base = import.meta.env.BASE_URL

onMounted(load)
</script>

<template>
	<div class="flex flex-col space-y-5">
		<div class="flex flex-col items-center py-5 px-2.5 space-y-4 rounded-b-4xl bg-card">
			<div class="relative w-12.25 rounded-full">
				<span class="block w-full pt-[100%]" />
				<img
					:src="`${base}images/doctor-img.png`"
					alt="Пациент"
					class="absolute inset-0 w-full h-full rounded-full object-cover object-center"
				/>
			</div>
			<div class="text-lg text-gray">Иванов Иван</div>

			<div class="w-full max-w-67">
				<UiBtn fluid @click="startFromBranch">Записаться</UiBtn>
			</div>
		</div>

		<div class="px-2.5">
			<h1 class="section-title mb-4">История записей</h1>

			<UiLoader v-if="loading" label="Загружаем записи" />

			<div v-else-if="failed" class="p-5 rounded-4xl bg-card text-15 text-gray">
				Не удалось загрузить записи. Попробуйте позже.
			</div>

			<div v-else-if="!history.length" class="p-5 rounded-4xl bg-card text-15 text-gray">
				Завершённых записей пока нет — актуальные смотрите на главной.
			</div>

			<div v-else class="space-y-2.5">
				<HistoryCard
					v-for="appointment in history"
					:key="appointment.id"
					:service="serviceTitle(appointment)"
					:doctor="doctorName(appointment)"
					:date="dateLabel(appointment)"
					:status="statusKind(appointment)"
					@repeat="repeat(appointment)"
				/>
			</div>
		</div>

		<div class="grid grid-cols-2 gap-2.5 px-2.5">
			<RouterLink to="/sale" class="block p-5 rounded-4xl bg-card shadow-accent">
				<div class="text-center text-xl text-brand">Акции</div>
				<div class="mt-2.5 text-15 text-center text-gray opacity-70">
					Актуальные акции программы стоматологической клиники
				</div>
			</RouterLink>
			<!-- Второй сценарий записи: сначала услуга, филиал уже под неё -->
			<button
				type="button"
				class="block w-full p-5 rounded-4xl bg-card shadow-accent duration-75 active:scale-[0.98]"
				@click="startFromService"
			>
				<div class="text-center text-xl text-brand">Услуги</div>
				<div class="mt-2.5 text-15 text-center text-gray opacity-70">
					Выберите услугу из списка или запишитесь на консультацию
				</div>
			</button>
		</div>

		<UiTabbar />
	</div>
</template>
