<script setup>
import { ref } from 'vue';
import UiBtn from '@/components/ui/UiBtn.vue';

const categories = [
	{ key: 'adult', label: 'Взрослая стоматология' },
	{ key: 'child', label: 'Детская стоматология' },
];

const selected = ref('adult');
</script>

<template>
	<div class="min-h-screen flex flex-col p-2.5">
		<h1 class="text-[22px] leading-[0.9] text-brand mb-7">Выбрать категорию</h1>

		<div class="grid grid-cols-2 gap-2.5">
			<button
				v-for="category in categories"
				:key="category.key"
				type="button"
				:class="selected === category.key ? 'bg-card-darker shadow-accent' : 'bg-card'"
				class="flex items-center justify-center min-h-22.75 p-2.5 rounded-4xl text-center text-15 text-gray duration-75 active:scale-95"
				@click="selected = category.key"
			>
				{{ category.label }}
			</button>
		</div>

		<UiBtn class="sticky bottom-2.5 left-0 mt-auto" fluid>Выбрать категорию</UiBtn>
	</div>
</template>
