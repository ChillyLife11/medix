<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import UiLoader from '@/components/ui/UiLoader.vue'
import UiPageTitle from '@/components/ui/UiPageTitle.vue'
import HistoryCard from '@/components/history/HistoryCard.vue'
import UiTabbar from '@/components/ui/UiTabbar.vue'
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
const { history, loading, failed, load } = useAppointments('history')

onMounted(load)
</script>

<template>
	<!-- На экране только карточки записей — плюс таббар снизу, как на главной.
	     Наверх ведёт заголовок со стрелкой. -->
	<div class="min-h-screen flex flex-col px-2.5 pt-2.5">
		<UiPageTitle to="/profile">История записей</UiPageTitle>

		<UiLoader v-if="loading" label="Загружаем записи" />

		<div v-else-if="failed" class="p-5 rounded-4xl bg-card text-15 text-gray">
			Не удалось загрузить записи. Попробуйте позже.
		</div>

		<div v-else-if="!history.length" class="p-5 rounded-4xl bg-card text-15 text-gray">
			Завершённых записей пока нет — актуальные смотрите на главной.
		</div>

		<div v-else class="space-y-2.5 pb-5">
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

		<!-- Таббар свои отступы задаёт сам: боковые вычитаем, снизу их нет у
		     экрана — иначе плашка встала бы ниже, чем на главной. Обёртку не
		     ставим: sticky работает относительно родителя, и в коробке по высоте
		     плашки прилипать было бы не к чему. -->
		<UiTabbar class="-mx-2.5" />
	</div>
</template>
