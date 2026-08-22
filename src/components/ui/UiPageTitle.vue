<script setup>
import { ChevronLeft } from '@lucide/vue'
import { useRouter } from 'vue-router'

// Заголовок экрана с кнопкой «назад» слева — общий для шагов записи.
// По умолчанию шаг назад по истории; to — уйти на конкретный экран.
const $props = defineProps({
	to: [String, Object],
})

const router = useRouter()

const back = () => ($props.to ? router.push($props.to) : router.back())
</script>

<template>
	<div class="flex items-center gap-1 mb-7">
		<button
			type="button"
			aria-label="Назад"
			class="shrink-0 -ml-1.5 text-brand duration-75 active:scale-90"
			@click="back"
		>
			<ChevronLeft :size="28" stroke-width="1.5" />
		</button>
		<h1 class="text-[22px] leading-[0.9] text-brand"><slot /></h1>
	</div>
</template>
