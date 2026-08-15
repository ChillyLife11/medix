<script setup>
import { ref } from 'vue';
import emblaCarouselVue from 'embla-carousel-vue';
import UiBtn from '@/components/ui/UiBtn.vue';
import {
	NotebookPen,
	CalendarDays,
	Clock,
	User,
	ChevronLeft,
	ChevronRight,
	ChevronDown,
	House,
	Plus,
	GalleryHorizontalEnd,
} from '@lucide/vue';

const appointments = ref([
	{
		service: 'Консультация терапевта',
		date: 'Чт, 1 сентября 2026',
		time: '10:30 - 11:30',
		doctor: 'Матвеев Макар Геннадьевич',
	},
	{
		service: 'Лечение кариеса',
		date: 'Пт, 2 сентября 2026',
		time: '12:00 - 13:00',
		doctor: 'Иванов Максим Геннадьевич',
	},
]);

const [emblaRef, emblaApi] = emblaCarouselVue({ loop: true, align: 'center' });

const scrollPrev = () => emblaApi.value?.scrollPrev();
const scrollNext = () => emblaApi.value?.scrollNext();
</script>

<template>
	<div class="flex flex-col space-y-5">
		<div class="relative flex flex-col items-center py-5 px-2.5 space-y-4 rounded-b-4xl bg-card">
			<div class="relative w-12.25 rounded-full">
				<span class="block w-full pt-[100%]" />
				<img
					src="/doctor-img.png"
					alt="Пациент"
					class="absolute inset-0 w-full h-full rounded-full object-cover object-center"
				>
			</div>
			<div class="text-lg text-gray">Иванов Иван</div>

			<div class="flex items-center gap-1 w-full">
				<button type="button" class="shrink-0 p-1 text-brand active:scale-90 duration-100" @click="scrollPrev">
					<ChevronLeft :size="28" :stroke-width="1.5" />
				</button>

				<div ref="emblaRef" class="grow overflow-hidden">
					<div class="flex">
						<div
							v-for="(item, i) in appointments"
							:key="i"
							class="shrink-0 basis-full min-w-0 space-y-2.5"
						>
							<div class="flex items-center justify-center gap-2 h-11.75 px-4 rounded-full bg-card-darker">
								<NotebookPen :size="18" :stroke-width="1.5" class="shrink-0 text-brand" />
								<span class="text-gray">{{ item.service }}</span>
							</div>

							<div class="flex gap-2.5">
								<div class="grow flex items-center gap-2 h-11.75 px-4 rounded-full bg-card-darker">
									<CalendarDays :size="18" :stroke-width="1.5" class="shrink-0 text-brand" />
									<span class="text-gray">{{ item.date }}</span>
								</div>
								<div class="shrink-0 flex items-center gap-2 h-11.75 px-4 rounded-full bg-card-darker">
									<Clock :size="18" :stroke-width="1.5" class="shrink-0 text-brand" />
									<span class="text-gray whitespace-nowrap">{{ item.time }}</span>
								</div>
							</div>

							<div class="flex items-center justify-center gap-2 h-11.75 px-4 rounded-full bg-card-darker">
								<User :size="18" :stroke-width="1.5" class="shrink-0 text-brand" />
								<span class="text-gray">{{ item.doctor }}</span>
							</div>
						</div>
					</div>
				</div>

				<button type="button" class="shrink-0 p-1 text-brand active:scale-90 duration-100" @click="scrollNext">
					<ChevronRight :size="28" :stroke-width="1.5" />
				</button>
			</div>

			<div class="w-full max-w-67 space-y-2.5">
				<UiBtn fluid>Записаться</UiBtn>
				<UiBtn color="secondary" fluid>Отменить запись</UiBtn>
			</div>

			<button
				type="button"
				class="absolute -bottom-3.5 left-1/2 -translate-x-1/2 flex items-center justify-center w-12 h-7 rounded-full text-gray bg-card-darker active:scale-90 duration-100"
			>
				<ChevronDown :size="20" :stroke-width="1.5" />
			</button>
		</div>

		<div class="grid grid-cols-2 gap-2.5 px-2.5">
			<div class="p-5 rounded-4xl bg-card shadow-accent">
				<div class="text-center text-xl text-brand">Акции</div>
				<div class="mt-2.5 text-15 text-center text-gray opacity-70">Актуальные акции программы стоматологической клиники</div>
			</div>
			<div class="p-5 rounded-4xl bg-card shadow-accent">
				<div class="text-center text-xl text-brand">Услуги</div>
				<div class="mt-2.5 text-15 text-center text-gray opacity-70">Выберите услугу из списка или запишитесь на консультацию</div>
			</div>
		</div>

		<div class="mt-auto mb-2.5 px-2.5">
			<div class="flex items-center justify-between p-4 rounded-full shadow-accent bg-card">
				<UiBtn color="secondary" soft icon><House stroke-width="1.1" size="26" /></UiBtn>
				<UiBtn icon><Plus size="32" /></UiBtn>
				<UiBtn color="secondary" soft icon><GalleryHorizontalEnd stroke-width="1.1" size="26" /></UiBtn>
			</div>
		</div>
	</div>
</template>
