<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const base = import.meta.env.BASE_URL
const { checkAuth } = useAuth()

onMounted(async () => {
	// Есть сохранённая сессия или телефон — сразу в профиль,
	// иначе просим согласия и номер телефона.
	const state = await checkAuth()
	router.replace(state === 'authed' ? '/profile' : '/agree')
})
</script>

<template>
	<div class="w-full h-full">
		<img
			:src="`${base}images/loading-img-2.png`"
			alt=""
			class="absolute inset-0 w-full h-full object-center object-cover"
		/>
	</div>
</template>

<style>
body {
	background-color: var(--color-loading-page);
}
</style>
