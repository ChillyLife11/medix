<script setup>
import { X, Check } from '@lucide/vue'

const $props = defineProps({
	service: String,
	doctor: String,
	date: String,
	canceled: Boolean,
})
</script>

<template>
	<div class="p-1 space-y-1 rounded-4xl bg-card">
		<div class="flex items-center gap-4 p-2 h-15 rounded-full bg-card-darker">
			<div class="w-11"></div>
			<div class="grow text-center text-13 text-gray/70">{{ $props.service }}</div>
			<div
				:class="{
					'text-brand': !$props.canceled,
					'text-[#FF0000]': $props.canceled,
				}"
				class="relative flex items-center justify-center w-11 h-11 rounded-full bg-card"
			>
				<X v-if="$props.canceled" stroke-width="1" />
				<Check v-else stroke-width="1" />
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
				class="flex items-center justify-center min-h-full rounded-full border border-brand"
			>
				Повторить
			</button>
		</div>
	</div>
</template>
