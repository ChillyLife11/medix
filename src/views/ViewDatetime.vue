<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getLocalTimeZone, parseDate, today } from '@internationalized/date'
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
import { createAppointment } from '@/api/appointments'
import { apiErrorMessage } from '@/api/http'
import { useBooking } from '@/composables/useBooking'

const router = useRouter()
const { date, time, reset, appointmentPayload, isComplete } = useBooking()

// Записаться можно только начиная с сегодняшнего дня.
const minDate = today(getLocalTimeZone())
// При возврате на экран показываем ранее выбранный день, а не сегодняшний.
// Сами слоты не кешируем — их могли занять, пока пользователь ходил по шагам.
const savedDate = date.value ? parseDate(date.value) : null
const selectedDate = ref(savedDate && savedDate.compare(minDate) >= 0 ? savedDate : minDate)

const monthFormatter = new Intl.DateTimeFormat('ru', { month: 'long' })
const monthLabel = (dateValue) =>
	monthFormatter.format(new Date(dateValue.year, dateValue.month - 1, 1))

// Периоды делят часовую сетку пополам — утро и вторая половина дня.
const periods = [
	{ label: '9:00 - 13:00', from: 0, to: 13 },
	{ label: '13:00 - 18:00', from: 13, to: 24 },
]
const selectedPeriod = ref(periods[0].label)

const selectedTime = ref(null)

const hourOf = (t) => Number(t.split(':')[0])
const minuteOf = (t) => Number(t.split(':')[1])

// Рабочий день клиники. Сетка статичная, с шагом в час: 09:00, 10:00 … 18:00 —
// записаться можно на любой из этих часов. Занят ли конкретный час, проверяет
// бэкенд при создании записи.
const WORK_FROM_HOUR = 9
const WORK_TO_HOUR = 18

const hours = Array.from(
	{ length: WORK_TO_HOUR - WORK_FROM_HOUR + 1 },
	(_, i) => `${String(WORK_FROM_HOUR + i).padStart(2, '0')}:00`,
)

const visibleTimes = computed(() => {
	const period = periods.find((p) => p.label === selectedPeriod.value)
	return hours.filter((t) => hourOf(t) >= period.from && hourOf(t) < period.to)
})

// Записаться можно не раньше чем через час: в 13:20 ближайший доступный час —
// 15:00, а 14:00 уже нет. Прошедшие часы показываем, но выбрать их нельзя
// (кнопки disabled). На другие дни ограничение не действует — там доступны все.
const LEAD_MS = 60 * 60 * 1000

// «Сейчас» подтягиваем раз в минуту — экран может быть открыт долго, и граница
// доступного времени должна ехать вместе с часами.
const now = ref(new Date())
let nowTimer = null
onMounted(() => {
	nowTimer = setInterval(() => (now.value = new Date()), 60_000)
})
onUnmounted(() => clearInterval(nowTimer))

// Слот ("HH:mm" на выбранную дату) как Date — чтобы сравнить с «сейчас».
function slotAt(dateValue, slot) {
	return new Date(
		dateValue.year,
		dateValue.month - 1,
		dateValue.day,
		hourOf(slot),
		minuteOf(slot),
	)
}

function isTooSoon(slot) {
	return slotAt(selectedDate.value, slot) - now.value < LEAD_MS
}

// Слоты, которые реально можно выбрать — из них берём автовыбор.
const availableTimes = computed(() => visibleTimes.value.filter((t) => !isTooSoon(t)))

// Если в первой половине дня выбирать уже нечего (всё прошло), сразу открываем
// период, где есть свободный слот — иначе пользователь упирается в сетку,
// где всё заблокировано.
function showPeriodWithFreeSlot() {
	const inPeriod = (period) =>
		hours.some((t) => hourOf(t) >= period.from && hourOf(t) < period.to && !isTooSoon(t))
	if (inPeriod(periods.find((p) => p.label === selectedPeriod.value))) return
	selectedPeriod.value = (periods.find(inPeriod) ?? periods[0]).label
}

watch(selectedDate, showPeriodWithFreeSlot, { immediate: true })

// Первый доступный слот в периоде — чтобы кнопка не была вечно заблокирована.
watch(availableTimes, (list) => {
	if (!list.includes(selectedTime.value)) selectedTime.value = list[0] ?? null
})

const saving = ref(false)
const saveError = ref('')

// Успех подтверждаем плашкой поверх экрана: мгновенный переход не читался —
// человек не понимал, оформилась запись или нет. Уходим на главную по кнопке.
const success = ref(false)

// Финал флоу: фиксируем выбор и создаём запись. При успехе состояние сбрасываем,
// чтобы следующая запись начиналась с чистого листа.
async function submit() {
	date.value = selectedDate.value.toString()
	time.value = selectedTime.value

	if (!isComplete()) {
		saveError.value = 'Не хватает данных для записи — пройдите шаги заново.'
		return
	}

	saving.value = true
	saveError.value = ''
	try {
		await createAppointment(appointmentPayload())
		reset()
		success.value = true
	} catch (e) {
		console.warn('[datetime] appointment/create failed', e)
		saveError.value = apiErrorMessage(e, 'Не удалось создать запись. Попробуйте позже.')
	} finally {
		saving.value = false
	}
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
							class="text-lg text-left text-gray/50 capitalize hover:text-gray duration-75"
						>
							{{ monthLabel(grid[0].value.subtract({ months: 1 })) }}
						</CalendarPrev>
						<CalendarHeading
							class="text-lg text-center font-semibold text-black capitalize"
						>
							{{ monthLabel(grid[0].value) }}
						</CalendarHeading>
						<CalendarNext
							class="text-lg text-right text-gray/50 capitalize hover:text-gray duration-75"
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
										class="flex items-center justify-center w-9 h-9 rounded-full text-15 text-gray/40 duration-75 data-outside-view:invisible data-outside-view:pointer-events-none data-disabled:opacity-40 data-disabled:pointer-events-none data-today:font-semibold data-today:text-gray data-selected:bg-[#f7dbe3] data-selected:text-gray"
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
						class="flex items-center justify-center min-h-9 py-1 px-2 rounded-full text-13 duration-50 active:scale-[.98]"
						@click="selectedPeriod = period.label"
					>
						{{ period.label }}
					</button>
				</div>

				<div v-if="!availableTimes.length" class="py-2 text-13 text-center text-gray">
					На этот день свободного времени больше нет — выберите другой.
				</div>

				<div class="grid grid-cols-4 gap-2.5">
					<button
						v-for="slot in visibleTimes"
						:key="slot"
						type="button"
						:disabled="isTooSoon(slot)"
						:class="
							selectedTime === slot
								? 'bg-brand text-white'
								: 'border border-brand text-brand'
						"
						class="flex items-center justify-center min-h-9 py-1 px-2 rounded-full text-13 duration-50 active:scale-[.98] disabled:opacity-40 disabled:pointer-events-none"
						@click="selectedTime = slot"
					>
						{{ slot }}
					</button>
				</div>
			</div>
		</div>

		<div class="sticky bottom-2.5 left-0 mt-auto space-y-2.5">
			<div v-if="saveError" class="p-4 rounded-4xl bg-card text-13 text-center text-gray">
				{{ saveError }}
			</div>
			<UiBtn :disabled="!selectedTime || saving" fluid @click="submit">
				{{ saving ? 'Записываем…' : 'Записаться' }}
			</UiBtn>
		</div>

		<div v-if="success" class="fixed inset-0 z-50 flex items-center justify-center p-5">
			<div
				role="status"
				aria-live="polite"
				class="w-full max-w-85 py-10 px-6 rounded-4xl text-center bg-card-darker shadow-accent"
			>
				<div class="text-lg text-gray">Ваша запись успешно оформлена!</div>
				<UiBtn class="mt-6" to="/profile">Перейти в профиль</UiBtn>
			</div>
		</div>
	</div>
</template>
