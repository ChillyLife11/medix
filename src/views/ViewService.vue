<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { RadioGroupRoot, RadioGroupItem } from 'reka-ui'
import UiBtn from '@/components/ui/UiBtn.vue'
import UiPageTitle from '@/components/ui/UiPageTitle.vue'
import UiLoader from '@/components/ui/UiLoader.vue'
import { getAllServices, getBranch, loadedAllServices, loadedBranch } from '@/api/branches'
import { useBooking } from '@/composables/useBooking'

const router = useRouter()
const { branchId, serviceId, isServiceFirst } = useBooking()

// Сценарий «сначала услуга»: филиала ещё нет, показываем каталог всех услуг
// клиники. В обычном сценарии услуги приходят вложенными в выбранный филиал.
const serviceFirst = isServiceFirst()

function fill(list) {
	services.value = list ?? []
	const keepSelected = services.value.some((s) => s.id === serviceId.value)
	selected.value = keepSelected ? serviceId.value : (services.value[0]?.id ?? null)
}

const services = ref([])
const failed = ref(false)
const selected = ref(null)

// При возврате назад филиалы уже в кеше — берём сразу, без запроса и лоадера.
const cached = serviceFirst ? loadedAllServices() : (loadedBranch(branchId.value)?.services ?? null)
if (cached) fill(cached)
const loading = ref(!cached)

onMounted(async () => {
	if (!loading.value) return
	try {
		fill(serviceFirst ? await getAllServices() : (await getBranch(branchId.value))?.services)
	} catch (e) {
		console.warn('[service] branch/index failed', e)
		failed.value = true
	} finally {
		loading.value = false
	}
})

// Дальше в этом сценарии выбирают филиал — но уже только из тех, где услуга есть.
function submit() {
	serviceId.value = selected.value
	router.push(serviceFirst ? '/branch' : '/doctors')
}
</script>

<template>
	<div class="min-h-screen flex flex-col p-2.5">
		<UiPageTitle>Выбрать услугу</UiPageTitle>

		<UiLoader v-if="loading" label="Загружаем услуги" />

		<div v-else-if="failed" class="p-5 rounded-4xl bg-card text-15 text-gray">
			Не удалось загрузить услуги. Попробуйте позже.
		</div>

		<div v-else-if="!services.length" class="p-5 rounded-4xl bg-card text-15 text-gray">
			<template v-if="serviceFirst">Услуги не найдены. Попробуйте позже.</template>
			<template v-else>В этом филиале услуг нет — выберите другой филиал.</template>
		</div>

		<RadioGroupRoot v-else v-model="selected" class="space-y-2.5">
			<RadioGroupItem
				v-for="service in services"
				:key="service.id"
				:value="service.id"
				class="flex items-center w-full min-h-20 py-4 px-6 rounded-4xl bg-card text-left text-gray duration-75 active:scale-95 data-[state=checked]:bg-card-darker data-[state=checked]:shadow-accent"
			>
				{{ service.title }}
			</RadioGroupItem>
		</RadioGroupRoot>

		<UiBtn :disabled="!selected" class="sticky bottom-2.5 left-0 mt-4" fluid @click="submit">
			Выбрать услугу
		</UiBtn>
	</div>
</template>
