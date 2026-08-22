<script setup>
defineProps({
	surname: String,
	name: String,
	specialty: String,
	date: String,
	photo: String,
	selected: Boolean,
})
</script>

<template>
	<button
		type="button"
		:class="selected ? 'shadow-accent' : 'shadow-[0px_4px_4px_rgba(0,0,0,0.12)]'"
		class="relative w-full h-37 overflow-hidden rounded-[30px] bg-card-darker text-left duration-75 active:scale-[0.98]"
	>
		<div class="relative z-10 py-5 pl-6 pr-30 space-y-0.5 text-gray">
			<div class="text-15 font-semibold leading-tight">{{ surname }}</div>
			<div v-if="name" class="text-13 leading-tight">{{ name }}</div>
			<div v-if="specialty" class="pt-1.5 text-13 opacity-70">{{ specialty }}</div>
			<div v-if="date" class="pt-1.5 text-13">
				Ближайшая запись: <span class="font-semibold">{{ date }}</span>
			</div>
		</div>
		<img
			:src="photo"
			alt=""
			class="absolute bottom-0 right-0 h-full w-auto object-contain object-bottom pointer-events-none"
		/>
	</button>
</template>
