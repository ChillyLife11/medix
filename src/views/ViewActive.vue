<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import UiLoader from '@/components/ui/UiLoader.vue'
import UiPageTitle from '@/components/ui/UiPageTitle.vue'
import HistoryCard from '@/components/history/HistoryCard.vue'
import {
	useAppointments,
	serviceTitle,
	doctorName,
	branchAddress,
	dateLabel,
	statusKind,
	repeatSelection,
} from '@/composables/useAppointments'
import { useBooking } from '@/composables/useBooking'

const router = useRouter()
const { startRepeat } = useBooking()

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

onMounted(load)
</script>

<template>
	<!-- На экране только карточки записей: точки входа в запись и таббар живут
	     на главной, сюда ведёт заголовок со стрелкой. -->
	<div class="min-h-screen flex flex-col p-2.5">
		<UiPageTitle to="/profile">История записей</UiPageTitle>

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
				:address="branchAddress(appointment)"
				:date="dateLabel(appointment)"
				:status="statusKind(appointment)"
				@repeat="repeat(appointment)"
			/>
		</div>
	</div>
</template>
