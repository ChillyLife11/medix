<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUserByPhone } from '@/api/users'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { saveAccount } = useAuth()

onMounted(async () => {
	// Ищем клиента по телефону. Клиент найден → сразу в профиль,
	// нет клиента (или запрос упал) → согласия и регистрация.
	let user = null
	try {
		user = await getUserByPhone('71111111114')
	} catch (e) {
		console.warn('[home] by-phone failed', e)
	}
	// Клиент найден — сохраняем сессию (токен + id), как после check-chat-id.
	if (user) saveAccount(user)
	router.replace(user ? '/profile' : '/agree')
})
</script>

<template>
	<div class="w-full h-full">
		<img
			src="/loading-img-2.png"
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
