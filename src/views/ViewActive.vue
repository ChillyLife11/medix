<script setup>
import { onMounted } from 'vue'
import UiBtn from '@/components/ui/UiBtn.vue'
import UiLoader from '@/components/ui/UiLoader.vue'
import HistoryCard from '@/components/history/HistoryCard.vue'
import UiTabbar from '@/components/ui/UiTabbar.vue'
import {
	useAppointments,
	serviceTitle,
	doctorName,
	dateLabel,
	isCanceled,
} from '@/composables/useAppointments'

// История записей: весь список с сервера — актуальные, прошедшие и отменённые.
// Актуальные дублируются слайдером на главной, отменённые видно только здесь.
const { appointments, loading, failed, load } = useAppointments()

onMounted(load)
</script>

<template>
	<div class="flex flex-col space-y-5">
		<div class="flex flex-col items-center py-5 px-2.5 space-y-4 rounded-b-4xl bg-card">
			<div class="relative w-12.25 rounded-full">
				<span class="block w-full pt-[100%]" />
				<img
					src="/doctor-img.png"
					alt="Пациент"
					class="absolute inset-0 w-full h-full rounded-full object-cover object-center"
				/>
			</div>
			<div class="text-lg text-gray">Иванов Иван</div>

			<div class="w-full max-w-67">
				<UiBtn to="/branch" fluid>Записаться</UiBtn>
			</div>
		</div>

		<div class="px-2.5">
			<h1 class="section-title mb-4">История записей</h1>

			<UiLoader v-if="loading" label="Загружаем записи" />

			<div v-else-if="failed" class="p-5 rounded-4xl bg-card text-15 text-gray">
				Не удалось загрузить записи. Попробуйте позже.
			</div>

			<div v-else-if="!appointments.length" class="p-5 rounded-4xl bg-card text-15 text-gray">
				Записей пока нет — выберите услугу и запишитесь на приём.
			</div>

			<div v-else class="space-y-2.5">
				<HistoryCard
					v-for="appointment in appointments"
					:key="appointment.id"
					:service="serviceTitle(appointment)"
					:doctor="doctorName(appointment)"
					:date="dateLabel(appointment)"
					:canceled="isCanceled(appointment)"
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
			<div class="p-5 rounded-4xl bg-card shadow-accent">
				<div class="text-center text-xl text-brand">Услуги</div>
				<div class="mt-2.5 text-15 text-center text-gray opacity-70">
					Выберите услугу из списка или запишитесь на консультацию
				</div>
			</div>
		</div>

		<UiTabbar />
	</div>
</template>
