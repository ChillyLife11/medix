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
	<div class="flex min-h-screen flex-col items-center justify-center px-2.5">
		<img :src="`${base}images/logo.webp`" alt="" class="w-47 h-58 object-contain" />
		<p class="max-w-96 text-center text-xl leading-[1.2] text-[#787878]">
			СТОМАТОЛОГИЧЕСКАЯ КЛИНИКА ДОКТОРА ДАБАЕВА
		</p>
	</div>
</template>

<style>
body {
	background-color: var(--color-loading-page);
}
</style>
