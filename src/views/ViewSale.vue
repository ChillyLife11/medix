<script setup>
import { onMounted, ref } from 'vue'
import UiBtn from '@/components/ui/UiBtn.vue'
import UiPageTitle from '@/components/ui/UiPageTitle.vue'
import UiLoader from '@/components/ui/UiLoader.vue'
import { getPromos } from '@/api/promos'
import { fileUrl } from '@/config'

const promos = ref([])
const loading = ref(true)
const failed = ref(false)

onMounted(async () => {
	try {
		promos.value = await getPromos()
	} catch (e) {
		console.warn('[sale] promos failed', e)
		failed.value = true
	} finally {
		loading.value = false
	}
})
</script>

<template>
	<div class="flex flex-col p-2.5">
		<UiPageTitle to="/profile">Акции клиники</UiPageTitle>

		<UiLoader v-if="loading" label="Загружаем акции" />

		<div v-else-if="failed" class="py-5 px-4 rounded-4xl bg-card text-13 text-gray">
			Не удалось загрузить акции. Попробуйте позже.
		</div>

		<div v-else-if="!promos.length" class="py-5 px-4 rounded-4xl bg-card text-13 text-gray">
			Сейчас акций нет — загляните позже.
		</div>

		<div v-else class="space-y-2.5 pb-5">
			<div v-for="promo in promos" :key="promo.id" class="py-5 px-4 rounded-4xl bg-card">
				<img
					v-if="promo.image"
					:src="fileUrl(promo.image)"
					:alt="promo.title"
					class="w-full mb-2.5 rounded-3xl object-cover"
				/>
				<div class="text-brand">{{ promo.title }}</div>
				<!-- summary и description приходят с бэка как HTML -->
				<div
					v-if="promo.summary"
					class="promo-text mt-2.5 text-13 text-gray"
					v-html="promo.summary"
				/>
				<div
					v-if="promo.description"
					class="promo-text mt-2.5 text-13 text-gray"
					v-html="promo.description"
				/>
			</div>
		</div>

		<UiBtn class="sticky bottom-2.5 left-0 mt-auto" fluid>Участвовать в акции</UiBtn>
	</div>
</template>

<style scoped>
/* Разметка приходит из админки — задаём минимальные отступы для абзацев/списков */
.promo-text :deep(p + p) {
	margin-top: 0.75em;
}
.promo-text :deep(ul) {
	list-style: disc;
	padding-left: 1.25em;
}
</style>
