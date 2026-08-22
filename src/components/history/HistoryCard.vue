<script setup>
import { computed } from 'vue'
import { X, Check, Clock } from '@lucide/vue'

const $props = defineProps({
	service: String,
	doctor: String,
	date: String,
	// 'complete' — выполнена, 'canceled' — отменена, 'pending' — все остальные
	// статусы: лист ожидания, отправлена в МИС, напоминание, подтверждена.
	status: {
		type: String,
		default: 'pending',
	},
})

// «Повторить» — новая запись к тому же врачу на ту же услугу; куда вести,
// решает экран со списком.
defineEmits(['repeat'])

const icon = computed(() => {
	switch ($props.status) {
		case 'complete':
			return Check
		case 'canceled':
			return X
		default:
			return Clock
	}
})
</script>

<template>
	<div class="p-1 space-y-1 rounded-4xl bg-card">
		<div class="flex items-center gap-4 p-2 h-15 rounded-full bg-card-darker">
			<div class="w-11"></div>
			<div class="grow text-center text-13 text-gray/70">{{ $props.service }}</div>
			<div
				:class="{
					'text-brand': $props.status === 'complete',
					'text-[#FF0000]': $props.status === 'canceled',
					'text-gray/70': $props.status === 'pending',
				}"
				class="relative flex items-center justify-center w-11 h-11 rounded-full bg-card"
			>
				<component :is="icon" stroke-width="1" />
			</div>
		</div>
		<div
			v-if="$props.doctor"
			class="flex items-center gap-4 p-2 h-15 rounded-full bg-card-darker"
		>
			<div class="grow text-center text-13 text-gray/70">Врач: {{ $props.doctor }}</div>
		</div>
		<div
			class="grid grid-cols-2 items-center gap-4 p-1 h-15 rounded-full text-13 text-brand bg-card-darker"
		>
			<div class="pl-4 text-13 text-gray/70">{{ $props.date }}</div>
			<button
				type="button"
				class="flex items-center justify-center min-h-full rounded-full border border-brand duration-50 active:scale-[0.98]"
				@click="$emit('repeat')"
			>
				Повторить
			</button>
		</div>
	</div>
</template>
