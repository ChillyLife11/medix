<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { RadioGroupRoot, RadioGroupItem } from 'reka-ui'
import UiBtn from '@/components/ui/UiBtn.vue'
import UiPageTitle from '@/components/ui/UiPageTitle.vue'
import { getCoworkers } from '@/api/coworkers'
import { useBooking } from '@/composables/useBooking'

const router = useRouter()
const { serviceId } = useBooking()

const services = ref([])
const loading = ref(true)
const failed = ref(false)
const selected = ref(serviceId.value)

// Услуги приходят вместе с врачами — собираем уникальный список по всем
// специалистам, чтобы показывать только то, на что реально можно записаться.
function collectServices(coworkers) {
	const map = new Map()
	for (const coworker of coworkers) {
		for (const service of coworker.services ?? []) {
			if (!map.has(service.id)) map.set(service.id, service)
		}
	}
	return [...map.values()]
}

onMounted(async () => {
	try {
		services.value = collectServices(await getCoworkers())
		selected.value ??= services.value[0]?.id ?? null
	} catch (e) {
		console.warn('[service] coworker/index failed', e)
		failed.value = true
	} finally {
		loading.value = false
	}
})

function submit() {
	serviceId.value = selected.value
	router.push('/doctors')
}
</script>

<template>
	<div class="min-h-screen flex flex-col p-2.5">
		<UiPageTitle>Выбрать услугу</UiPageTitle>

		<div v-if="loading" class="space-y-2.5">
			<div v-for="i in 4" :key="i" class="h-20 rounded-4xl bg-card animate-pulse" />
		</div>

		<div v-else-if="failed" class="p-5 rounded-4xl bg-card text-15 text-gray">
			Не удалось загрузить услуги. Попробуйте позже.
		</div>

		<div v-else-if="!services.length" class="p-5 rounded-4xl bg-card text-15 text-gray">
			Услуги не найдены.
		</div>

		<RadioGroupRoot v-else v-model="selected" class="space-y-2.5">
			<RadioGroupItem
				v-for="service in services"
				:key="service.id"
				:value="service.id"
				class="flex items-center w-full min-h-20 py-4 px-6 rounded-4xl bg-card text-left text-gray duration-100 active:scale-95 data-[state=checked]:bg-card-darker data-[state=checked]:shadow-accent"
			>
				{{ service.title }}
			</RadioGroupItem>
		</RadioGroupRoot>

		<UiBtn :disabled="!selected" class="sticky bottom-2.5 left-0 mt-4" fluid @click="submit">
			Выбрать услугу
		</UiBtn>
	</div>
</template>
