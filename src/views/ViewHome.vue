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

onMounted(async () => {
	// Есть сохранённая сессия или телефон — сразу в профиль,
	// иначе просим согласия и номер телефона.
	const state = await checkAuth()
	if (state === 'authed') router.replace('/profile')
	else agreeing.value = true
})
</script>

<template>
	<div class="flex min-h-screen flex-col items-center justify-center px-2.5">
		<img :src="`${base}images/logo.webp`" alt="" class="w-47 h-58 object-contain" />
		<p class="max-w-96 text-center text-xl leading-[1.2] text-[#787878]">
			СТОМАТОЛОГИЧЕСКАЯ КЛИНИКА ДОКТОРА ДАБАЕВА
		</p>

		<AgreeDialog v-model:open="agreeing" @signed="router.replace('/profile')" />
	</div>
</template>

<style>
body {
	background-color: var(--color-loading-page);
}
</style>
