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
import UiLoader from '@/components/ui/UiLoader.vue'
import BookingConfirm from '@/components/booking/BookingConfirm.vue'
import { createAppointment } from '@/api/appointments'
import { getBranch, loadedBranch, scheduleDates, shortAddress } from '@/api/branches'
import { apiErrorMessage } from '@/api/http'
import { useBooking } from '@/composables/useBooking'

const router = useRouter()
const { branchId, serviceId, masterId, date, time, reset, appointmentPayload, isComplete } =
	useBooking()

// Записаться можно только начиная с сегодняшнего дня.
const minDate = today(getLocalTimeZone())

// Филиал нужен ради расписания. Обычно он уже загружен шагом выбора филиала, но
// «Повторить» из истории ведёт сразу сюда — тогда запрашиваем сами.
const branch = ref(loadedBranch(branchId.value))
const loading = ref(!branch.value)
const failed = ref(false)

onMounted(async () => {
	if (!loading.value) return
	try {
		branch.value = await getBranch(branchId.value)
	} catch (e) {
		console.warn('[datetime] branch/index failed', e)
		failed.value = true
	} finally {
		loading.value = false
	}
})

// Дни, когда выбранный врач принимает в этом филиале. Расписание приходит в
// филиале и покрывает только ближайшую неделю — дни за её пределами закрыты
// так же, как прошедшие: их видно, но выбрать нельзя.
const openDates = computed(() => scheduleDates(branch.value, masterId.value))
const isDateClosed = (dateValue) => !openDates.value.has(dateValue.toString())

// Первый рабочий день — с него открываем экран: сегодня врач может не принимать.
function firstOpenDate() {
	const [first] = [...openDates.value].sort()
	return first ? parseDate(first) : null
}

// Дня может не быть вовсе (у врача нет расписания) — тогда null, и время не
// выбирается.
const selectedDate = ref(null)
// Месяц в шапке календаря: без него экран открылся бы на текущем месяце, даже
// когда ближайший рабочий день уже в следующем.
const placeholder = ref(minDate)

// Ранее выбранный день возвращаем, только если он всё ещё открыт по расписанию.
function pickDate() {
	const saved = date.value ? parseDate(date.value) : null
	const keep = saved && saved.compare(minDate) >= 0 && !isDateClosed(saved)
	selectedDate.value = keep ? saved : firstOpenDate()
	if (selectedDate.value) placeholder.value = selectedDate.value
}

watch(openDates, pickDate, { immediate: true })

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
	if (!selectedDate.value) return true
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

// Сводка перед созданием записи: услуга, врач, дата со временем и филиал —
// всё берём из уже загруженного филиала, дополнительных запросов не нужно.
const confirming = ref(false)

const chosenService = computed(() =>
	(branch.value?.services ?? []).find((service) => service.id === serviceId.value),
)
const chosenDoctor = computed(() =>
	(branch.value?.coworkers ?? []).find((coworker) => coworker.id === masterId.value),
)

// ФИО врача приходит перепутанным: фамилия в first_name, имя в last_name.
const doctorName = computed(() => {
	const profile = chosenDoctor.value?.profile
	const full = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim()
	return full || (chosenDoctor.value?.username ?? '')
})

const dateFormatter = new Intl.DateTimeFormat('ru', {
	day: '2-digit',
	month: '2-digit',
	year: 'numeric',
})

// Строки сводки. step — роут шага, куда ведёт иконка; у даты и времени его нет,
// этот шаг открыт прямо под окном.
const summary = computed(() => [
	{ label: 'Услуга', value: chosenService.value?.title ?? '', step: '/service' },
	{ label: 'Врач', value: doctorName.value, step: '/doctors' },
	{
		label: 'Дата / время',
		value: selectedDate.value
			? `${dateFormatter.format(selectedDate.value.toDate(getLocalTimeZone()))} / ${selectedTime.value}`
			: '',
		step: null,
	},
	{ label: 'Филиал', value: branch.value ? shortAddress(branch.value) : '', step: '/branch' },
])

// Кнопка экрана больше не создаёт запись сразу: сначала показываем сводку, где
// можно вернуться к любому шагу. Выбор фиксируем здесь же — сводка читает его
// из общего состояния записи.
function review() {
	if (!selectedDate.value || !selectedTime.value) return
	date.value = selectedDate.value.toString()
	time.value = selectedTime.value
	saveError.value = ''
	confirming.value = true
}

// «Изменить» у строки: закрываем окно и уходим на нужный шаг. У даты и времени
// шага нет — окно просто закрывается, экран под ним и есть этот шаг.
function edit(step) {
	confirming.value = false
	if (step) router.push(step)
}

// «Отменить запись» — отказ от оформления целиком: выбор сбрасываем и уходим на
// главную. Вернуться к правкам можно крестиком.
function cancel() {
	confirming.value = false
	reset()
	router.push('/profile')
}

const saving = ref(false)
const saveError = ref('')

// Успех подтверждаем плашкой поверх экрана: мгновенный переход не читался —
// человек не понимал, оформилась запись или нет. Уходим на главную по кнопке.
const success = ref(false)

// Финал флоу: фиксируем выбор и создаём запись. При успехе состояние сбрасываем,
// чтобы следующая запись начиналась с чистого листа.
async function submit() {
	if (!isComplete()) {
		saveError.value = 'Не хватает данных для записи — пройдите шаги заново.'
		return
	}

	saving.value = true
	saveError.value = ''
	try {
		await createAppointment(appointmentPayload())
		reset()
		confirming.value = false
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

		<UiLoader v-if="loading" label="Загружаем расписание" />

		<div v-else-if="failed" class="p-5 rounded-4xl bg-card text-15 text-gray">
			Не удалось загрузить расписание. Попробуйте позже.
		</div>

		<div v-else class="space-y-4">
			<div class="p-5 rounded-[30px] bg-card">
				<CalendarRoot
					v-slot="{ weekDays, grid }"
					v-model="selectedDate"
					v-model:placeholder="placeholder"
					:min-value="minDate"
					:is-date-disabled="isDateClosed"
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

			<div v-if="!openDates.size" class="p-5 rounded-4xl bg-card text-15 text-gray">
				На ближайшие дни у выбранного врача нет расписания — вернитесь назад и выберите
				другого.
			</div>

			<div v-else class="p-5 rounded-[30px] bg-card space-y-2.5">
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

		<UiBtn
			:disabled="!selectedTime"
			class="sticky bottom-2.5 left-0 mt-auto"
			fluid
			@click="review"
		>
			Записаться
		</UiBtn>

		<BookingConfirm
			v-model:open="confirming"
			:rows="summary"
			:saving="saving"
			:error="saveError"
			@confirm="submit"
			@cancel="cancel"
			@edit="edit"
		/>

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
