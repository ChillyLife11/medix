<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import emblaCarouselVue from 'embla-carousel-vue'
import UiBtn from '@/components/ui/UiBtn.vue'
import UiLoader from '@/components/ui/UiLoader.vue'
import LegalDialog from '@/components/legal/LegalDialog.vue'
import UiTabbar from '@/components/ui/UiTabbar.vue'
import {
	useAppointments,
	serviceTitle,
	doctorName,
	longDateLabel,
	timeRange,
} from '@/composables/useAppointments'
import { NotebookPen, CalendarDays, Clock, User, ChevronLeft, ChevronRight } from '@lucide/vue'

// Актуальные записи в слайдере: по одной на слайд, листаются стрелками.
// Берём current, а не весь список: прошедшие и отменённые живут в истории (/active).
const { current, loading, failed, load } = useAppointments()

const [emblaRef, emblaApi] = emblaCarouselVue({ loop: false, align: 'center' })

const scrollPrev = () => emblaApi.value?.scrollPrev()
const scrollNext = () => emblaApi.value?.scrollNext()

// Без зацикливания на краях листать некуда — гасим соответствующую стрелку.
const canScrollPrev = ref(false)
const canScrollNext = ref(false)

function syncArrows() {
	canScrollPrev.value = emblaApi.value?.canScrollPrev() ?? false
	canScrollNext.value = emblaApi.value?.canScrollNext() ?? false
}

const hasAppointments = computed(() => !loading.value && !failed.value && current.value.length)

// Слайдер держим в DOM всегда (прячем через v-show): embla инициализируется
// один раз в onMounted и не подхватил бы контейнер, появившийся после запроса.
// После загрузки пересчитываем размеры — слайды к этому моменту уже отрисованы.
onMounted(async () => {
	await load()
	await nextTick()
	emblaApi.value?.reInit()
	emblaApi.value?.on('select', syncArrows).on('reInit', syncArrows)
	syncArrows()
})
</script>

<template>
	<div class="flex flex-col space-y-5">
		<div class="flex flex-col items-center py-5 px-2.5 space-y-4 rounded-b-4xl bg-card">
			<div class="relative w-23.25 rounded-full">
				<span class="block w-full pt-[100%]" />
				<img
					src="/doctor-img.png"
					alt="Пациент"
					class="absolute inset-0 w-full h-full rounded-full object-cover object-center"
				/>
			</div>
			<div class="text-2xl text-gray">Иванов Иван</div>

			<UiLoader v-if="loading" label="Загружаем записи" class="py-2" />

			<div v-else-if="failed" class="text-13 text-center text-gray opacity-70">
				Не удалось загрузить записи. Попробуйте позже.
			</div>

			<div v-else-if="!current.length" class="text-13 text-center text-gray opacity-70">
				Активных записей нет — выберите услугу и запишитесь на приём.
			</div>

			<div v-show="hasAppointments" class="flex items-center gap-1 w-full">
				<button
					type="button"
					:disabled="!canScrollPrev"
					class="shrink-0 p-2 -mx-1.5 text-brand duration-100 active:scale-90 disabled:opacity-30 disabled:pointer-events-none"
					aria-label="Предыдущая запись"
					@click="scrollPrev"
				>
					<ChevronLeft :size="22" :stroke-width="1.5" />
				</button>

				<div ref="emblaRef" class="grow overflow-hidden">
					<div class="flex">
						<div
							v-for="appointment in current"
							:key="appointment.id"
							class="shrink-0 basis-full min-w-0 space-y-2.5"
						>
							<div
								class="flex items-center justify-center gap-2 h-11.75 px-4 rounded-full bg-card-darker"
							>
								<NotebookPen
									:size="18"
									:stroke-width="1.5"
									class="shrink-0 text-brand"
								/>
								<span class="truncate text-gray">{{
									serviceTitle(appointment)
								}}</span>
							</div>

							<div class="flex gap-2 text-13 min-[400px]:text-15">
								<div
									class="grow min-w-0 flex items-center justify-center gap-1.5 h-11.75 px-2.5 rounded-full bg-card-darker"
								>
									<CalendarDays
										:size="18"
										:stroke-width="1.5"
										class="shrink-0 text-brand"
									/>
									<span class="truncate text-gray">
										{{ longDateLabel(appointment) }}
									</span>
								</div>
								<div
									class="shrink-0 flex items-center gap-1.5 h-11.75 px-2.5 rounded-full bg-card-darker"
								>
									<Clock
										:size="18"
										:stroke-width="1.5"
										class="shrink-0 text-brand"
									/>
									<span class="text-gray whitespace-nowrap">
										{{ timeRange(appointment) }}
									</span>
								</div>
							</div>

							<div
								class="flex items-center justify-center gap-2 h-11.75 px-4 rounded-full bg-card-darker"
							>
								<User :size="18" :stroke-width="1.5" class="shrink-0 text-brand" />
								<span class="truncate text-gray">
									{{ doctorName(appointment) || 'Врач не указан' }}
								</span>
							</div>
						</div>
					</div>
				</div>

				<button
					type="button"
					:disabled="!canScrollNext"
					class="shrink-0 p-2 -mx-1.5 text-brand duration-100 active:scale-90 disabled:opacity-30 disabled:pointer-events-none"
					aria-label="Следующая запись"
					@click="scrollNext"
				>
					<ChevronRight :size="22" :stroke-width="1.5" />
				</button>
			</div>

			<div class="w-full p-3 rounded-full shadow-accent">
				<UiBtn to="/branch" fluid>Записаться</UiBtn>
			</div>
		</div>

		<div class="px-2.5 space-y-2.5">
			<RouterLink to="/sale" class="block p-5 rounded-full bg-card shadow-accent">
				<div class="text-center text-xl text-brand">Акции</div>
				<div class="mt-2.5 mx-auto text-15 text-center text-gray opacity-70">
					Актуальные акции программы <br />стоматологической клиники
				</div>
			</RouterLink>
			<div class="p-5 rounded-full bg-card shadow-accent">
				<div class="text-center text-xl text-brand">Услуги</div>
				<div class="mt-2.5 mx-auto text-15 text-center text-gray opacity-70">
					Выберите интересующую услугу из списка <br />или запишитесь на консультацию
				</div>
			</div>
		</div>

		<div class="flex flex-col items-center px-2.5 space-y-2.5">
			<LegalDialog />
			<div class="text-xl underline text-brand">Обратная связь</div>
		</div>

		<UiTabbar />
	</div>
</template>
