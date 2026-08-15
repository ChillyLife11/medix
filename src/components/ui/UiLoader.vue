<script setup>
// Индикатор загрузки для экранов записи: крутится, пока не приедут данные.
defineProps({
	label: {
		type: String,
		default: 'Загружаем данные',
	},
})
</script>

<template>
	<div class="flex grow flex-col items-center justify-center gap-3 text-gray">
		<span
			class="block w-10 h-10 rounded-full border-4 border-brand/20 border-t-brand animate-spin"
		/>
		<span v-if="label" class="text-13 opacity-70">{{ label }}</span>
	</div>
</template>
