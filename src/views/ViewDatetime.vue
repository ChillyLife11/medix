<script setup>
import { ref } from 'vue';
import { CalendarDate } from '@internationalized/date';
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
} from 'reka-ui';
import UiBtn from '@/components/ui/UiBtn.vue';
import UiPageTitle from '@/components/ui/UiPageTitle.vue';

const selectedDate = ref(new CalendarDate(2026, 6, 23));

const monthFormatter = new Intl.DateTimeFormat('ru', { month: 'long' });
const monthLabel = (dateValue) =>
	monthFormatter.format(new Date(dateValue.year, dateValue.month - 1, 1));

const periods = ['9:00 - 13:00', '13:00 - 18:00'];
const selectedPeriod = ref('9:00 - 13:00');

const times = ['9:00', '10:00', '11:00', '12:00', '13:00'];
const selectedTime = ref('9:00');
</script>

<template>
	<div class="min-h-screen flex flex-col p-2.5">
		<UiPageTitle>Выбрать дату и время</UiPageTitle>

		<div class="space-y-4">
			<div class="p-5 rounded-[30px] bg-card">
				<CalendarRoot
					v-slot="{ weekDays, grid }"
					v-model="selectedDate"
					:week-starts-on="1"
					weekday-format="short"
					locale="ru"
					class="select-none"
				>
					<CalendarHeader class="grid grid-cols-3 justify-between mb-2 px-1">
						<CalendarPrev class="text-lg text-left text-gray/50 capitalize hover:text-gray duration-100">
							{{ monthLabel(grid[0].value.subtract({ months: 1 })) }}
						</CalendarPrev>
						<CalendarHeading class="text-lg text-center font-semibold text-black capitalize">
							{{ monthLabel(grid[0].value) }}
						</CalendarHeading>
						<CalendarNext class="text-lg text-right text-gray/50 capitalize hover:text-gray duration-100">
							{{ monthLabel(grid[0].value.add({ months: 1 })) }}
						</CalendarNext>
					</CalendarHeader>

					<CalendarGrid
						v-for="month in grid"
						:key="month.value.toString()"
						class="w-full border-collapse"
					>
						<CalendarGridHead>
							<CalendarGridRow class="grid grid-cols-7 pt-3 mb-1 border-t border-gray/10">
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
										class="flex items-center justify-center w-9 h-9 rounded-full text-15 text-gray/40 duration-100
											data-outside-view:invisible data-outside-view:pointer-events-none
											data-today:font-semibold data-today:text-gray
											data-selected:bg-[#f7dbe3] data-selected:text-gray"
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
						:key="period"
						type="button"
						:class="selectedPeriod === period ? 'bg-brand text-white' : 'border border-brand text-brand'"
						class="flex items-center justify-center min-h-9 py-1 px-2 rounded-full text-13 duration-75 active:scale-[.98]"
						@click="selectedPeriod = period"
					>
						{{ period }}
					</button>
				</div>

				<div class="grid grid-cols-4 gap-2.5">
					<button
						v-for="time in times"
						:key="time"
						type="button"
						:class="selectedTime === time ? 'bg-brand text-white' : 'border border-brand text-brand'"
						class="flex items-center justify-center min-h-9 py-1 px-2 rounded-full text-13 duration-75 active:scale-[.98]"
						@click="selectedTime = time"
					>
						{{ time }}
					</button>
				</div>
			</div>
		</div>

		<UiBtn class="sticky bottom-2.5 left-0 mt-auto" fluid>Записаться</UiBtn>
	</div>
</template>
