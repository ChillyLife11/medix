<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AgreeDialog from '@/components/auth/AgreeDialog.vue'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const base = import.meta.env.BASE_URL
const { checkAuth } = useAuth()

// Согласия показываем окном поверх сплэша, а не отдельной страницей: экран
// загрузки остаётся фоном, пока клиент не опознан.
const agreeing = ref(false)

// Сплэш держим на экране не меньше трёх секунд, даже если клиент опознался
// быстрее: иначе логотип мелькает и запуск выглядит дёрганым.
const MIN_SPLASH_MS = 3000
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

onMounted(async () => {
	// Есть сохранённая сессия или телефон — сразу в профиль,
	// иначе просим согласия и номер телефона.
	// Проверку и паузу ждём вместе: медленный ответ сплэш не удлиняет.
	const [state] = await Promise.all([checkAuth(), wait(MIN_SPLASH_MS)])
	if (state === 'authed') router.replace('/profile')
	else agreeing.value = true
})
</script>

<template>
	<div class="relative flex min-h-screen flex-col items-center justify-center px-2.5">
		<img :src="`${base}images/logo.webp`" alt="" class="w-47 h-58 object-contain" />
		<p class="max-w-96 text-center text-xl leading-[1.2] text-[#787878]">
			СТОМАТОЛОГИЧЕСКАЯ КЛИНИКА ДОКТОРА ДАБАЕВА
		</p>

		<!-- Крутилка внизу: экран висит минимум три секунды, без неё запуск
		     выглядит зависшим. Логотип с надписью остаются по центру. -->
		<span
			class="absolute bottom-20 block w-10 h-10 rounded-full border-4 border-brand/20 border-t-brand animate-spin"
			role="status"
			aria-label="Загружаем"
		/>

		<AgreeDialog v-model:open="agreeing" @signed="router.replace('/profile')" />
	</div>
</template>

<style>
body {
	background-color: var(--color-loading-page);
}
</style>
