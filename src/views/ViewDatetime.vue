<script setup>
import { computed, ref, watch } from 'vue'
import { getLocalTimeZone, today } from '@internationalized/date'
import {
	CalendarRoot,
	CalendarHeader,
	CalendarHeading,
	CalendarPrev,
	CalendarNext,
	CalendarGrid,
	CalendarGridHead,
	CalendarGridBody,
	CalendarGridRow,
	CalendarHeadCell,
	CalendarCell,
	CalendarCellTrigger,
} from 'reka-ui'
import UiBtn from '@/components/ui/UiBtn.vue'
import UiPageTitle from '@/components/ui/UiPageTitle.vue'
import UiLoader from '@/components/ui/UiLoader.vue'
import { getSchedule, scheduleTimes } from '@/api/coworkers'
import { useBooking } from '@/composables/useBooking'

const { branchId, masterId, date, time } = useBooking()

// Записаться можно только начиная с сегодняшнего дня.
const minDate = today(getLocalTimeZone())
const selectedDate = ref(minDate)

const monthFormatter = new Intl.DateTimeFormat('ru', { month: 'long' })
const monthLabel = (dateValue) =>
	monthFormatter.format(new Date(dateValue.year, dateValue.month - 1, 1))

// Слоты приходят с бэка на конкретную дату — периоды просто делят их пополам.
const periods = [
	{ label: '9:00 - 13:00', from: 0, to: 13 },
	{ label: '13:00 - 18:00', from: 13, to: 24 },
]
const selectedPeriod = ref(periods[0].label)

const times = ref([])
const loading = ref(false)
const failed = ref(false)
const selectedTime = ref(null)

const hourOf = (t) => Number(t.split(':')[0])

const visibleTimes = computed(() => {
	const period = periods.find((p) => p.label === selectedPeriod.value)
	return times.value.filter((t) => hourOf(t) >= period.from && hourOf(t) < period.to)
})

async function loadTimes(dateValue) {
	const isoDate = dateValue.toString() // YYYY-MM-DD
	loading.value = true
	failed.value = false
	selectedTime.value = null
	try {
		const schedule = await getSchedule({
			masterId: masterId.value,
			branchId: branchId.value,
			date: isoDate,
		})
		times.value = scheduleTimes(schedule, isoDate)
	} catch (e) {
		console.warn('[datetime] get-schedule failed', e)
		failed.value = true
		times.value = []
	} finally {
		loading.value = false
	}
}

watch(selectedDate, loadTimes, { immediate: true })

// Первый доступный слот в периоде — чтобы кнопка не была вечно заблокирована.
watch(visibleTimes, (list) => {
	if (!list.includes(selectedTime.value)) selectedTime.value = list[0] ?? null
})

function submit() {
	date.value = selectedDate.value.toString()
	time.value = selectedTime.value
}
</script>

<template>
	<div class="min-h-screen flex flex-col p-2.5">
		<UiPageTitle>Выбрать дату и время</UiPageTitle>

		<div class="space-y-4">
			<div class="p-5 rounded-[30px] bg-card">
				<CalendarRoot
					v-slot="{ weekDays, grid }"
					v-model="selectedDate"
					:min-value="minDate"
					:week-starts-on="1"
					weekday-format="short"
					locale="ru"
					class="select-none"
				>
					<CalendarHeader class="grid grid-cols-3 justify-between mb-2 px-1">
						<CalendarPrev
							class="text-lg text-left text-gray/50 capitalize hover:text-gray duration-100"
						>
							{{ monthLabel(grid[0].value.subtract({ months: 1 })) }}
						</CalendarPrev>
						<CalendarHeading
							class="text-lg text-center font-semibold text-black capitalize"
						>
							{{ monthLabel(grid[0].value) }}
						</CalendarHeading>
						<CalendarNext
							class="text-lg text-right text-gray/50 capitalize hover:text-gray duration-100"
						>
							{{ monthLabel(grid[0].value.add({ months: 1 })) }}
						</CalendarNext>
					</CalendarHeader>

					<CalendarGrid
						v-for="month in grid"
						:key="month.value.toString()"
						class="w-full border-collapse"
					>
						<CalendarGridHead>
							<CalendarGridRow
								class="grid grid-cols-7 pt-3 mb-1 border-t border-gray/10"
							>
								<CalendarHeadCell
									v-for="day in weekDays"
									:key="day"
									class="text-15 font-normal text-black capitalize"
								>
									{{ day }}
								</CalendarHeadCell>
							</CalendarGridRow>
						</CalendarGridHead>
						<CalendarGridBody class="grid gap-y-1">
							<CalendarGridRow
								v-for="(weekDates, index) in month.rows"
								:key="`week-${index}`"
								class="grid grid-cols-7 place-items-center"
							>
								<CalendarCell
									v-for="weekDate in weekDates"
									:key="weekDate.toString()"
									:date="weekDate"
								>
									<CalendarCellTrigger
										:day="weekDate"
										:month="month.value"
										class="flex items-center justify-center w-9 h-9 rounded-full text-15 text-gray/40 duration-100 data-outside-view:invisible data-outside-view:pointer-events-none data-disabled:opacity-40 data-disabled:pointer-events-none data-today:font-semibold data-today:text-gray data-selected:bg-[#f7dbe3] data-selected:text-gray"
									/>
								</CalendarCell>
							</CalendarGridRow>
						</CalendarGridBody>
					</CalendarGrid>
				</CalendarRoot>
			</div>

			<div class="p-5 rounded-[30px] bg-card space-y-2.5">
				<div class="grid grid-cols-2 gap-2.5">
					<button
						v-for="period in periods"
						:key="period.label"
						type="button"
						:class="
							selectedPeriod === period.label
								? 'bg-brand text-white'
								: 'border border-brand text-brand'
						"
						class="flex items-center justify-center min-h-9 py-1 px-2 rounded-full text-13 duration-75 active:scale-[.98]"
						@click="selectedPeriod = period.label"
					>
						{{ period.label }}
					</button>
				</div>

				<UiLoader v-if="loading" label="Загружаем свободное время" class="py-6" />

				<div v-else-if="failed" class="py-4 text-13 text-center text-gray">
					Не удалось загрузить расписание. Попробуйте позже.
				</div>

				<div v-else-if="!visibleTimes.length" class="py-4 text-13 text-center text-gray">
					На это время свободных слотов нет.
				</div>

				<div v-else class="grid grid-cols-4 gap-2.5">
					<button
						v-for="slot in visibleTimes"
						:key="slot"
						type="button"
						:class="
							selectedTime === slot
								? 'bg-brand text-white'
								: 'border border-brand text-brand'
						"
						class="flex items-center justify-center min-h-9 py-1 px-2 rounded-full text-13 duration-75 active:scale-[.98]"
						@click="selectedTime = slot"
					>
						{{ slot }}
					</button>
				</div>
			</div>
		</div>

		<UiBtn
			:disabled="!selectedTime"
			class="sticky bottom-2.5 left-0 mt-auto"
			fluid
			@click="submit"
		>
			Записаться
		</UiBtn>
	</div>
</template>
