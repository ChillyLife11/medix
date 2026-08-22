<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { RadioGroupRoot, RadioGroupItem } from 'reka-ui'
import UiBtn from '@/components/ui/UiBtn.vue'
import UiPageTitle from '@/components/ui/UiPageTitle.vue'
import UiLoader from '@/components/ui/UiLoader.vue'
import {
	getBranches,
	getBranchesWithService,
	loadedBranches,
	loadedBranchesWithService,
} from '@/api/branches'
import { useBooking } from '@/composables/useBooking'

const router = useRouter()
const { branchId, serviceId, isServiceFirst } = useBooking()

// Сценарий «сначала услуга»: услуга уже выбрана, поэтому показываем только те
// филиалы, где её оказывают. Если такой филиал один — в списке будет он один,
// но выбор всё равно за пользователем: филиал подсвечен, кнопку жмёт он.
const serviceFirst = isServiceFirst() && serviceId.value != null

const branches = ref([])
const failed = ref(false)
const selected = ref(null)

// Ранее выбранный филиал возвращаем, только если он есть в текущем списке:
// после смены услуги он мог из него выпасть.
function fill(list) {
	branches.value = list ?? []
	const keepSelected = branches.value.some((b) => b.id === branchId.value)
	selected.value = keepSelected ? branchId.value : (branches.value[0]?.id ?? null)
}

// При возврате назад филиалы уже в кеше — берём их сразу, без запроса и лоадера.
const cached = serviceFirst ? loadedBranchesWithService(serviceId.value) : loadedBranches()
if (cached) fill(cached)
const loading = ref(!cached)

onMounted(async () => {
	if (!loading.value) return
	try {
		fill(serviceFirst ? await getBranchesWithService(serviceId.value) : await getBranches())
	} catch (e) {
		console.warn('[branch] index failed', e)
		failed.value = true
	} finally {
		loading.value = false
	}
})

// Адрес приходит как «город Улан-Удэ, Павлова, 59А» — в макете только улица
// и дом: «ул. Павлова, 59А».
function shortAddress(branch) {
	const parts = (branch.address ?? '')
		.split(',')
		.map((part) => part.trim())
		.filter((part) => part && !/^(город|г\.?)\s/i.test(part))
	if (!parts.length) return branch.title
	const [street, ...rest] = parts
	const named = /^(ул|улица|просп|пр-т|мкр|бул)/i.test(street) ? street : `ул. ${street}`
	return [named, ...rest].join(', ')
}

// В сценарии «сначала услуга» она уже выбрана — сразу идём к врачам.
function submit() {
	branchId.value = selected.value
	router.push(serviceFirst ? '/doctors' : '/service')
}
</script>

<template>
	<div class="min-h-screen flex flex-col p-2.5">
		<UiPageTitle>Выбрать филиал</UiPageTitle>

		<UiLoader v-if="loading" label="Загружаем филиалы" />

		<div v-else-if="failed" class="p-5 rounded-4xl bg-card text-15 text-gray">
			Не удалось загрузить филиалы. Попробуйте позже.
		</div>

		<div v-else-if="!branches.length" class="p-5 rounded-4xl bg-card text-15 text-gray">
			<template v-if="serviceFirst">
				Эту услугу пока не оказывают ни в одном филиале — выберите другую.
			</template>
			<template v-else>Филиалы не найдены.</template>
		</div>

		<template v-else>
			<!-- Услуга есть только в одном филиале: показываем его одного, но
			     карточкой во всю ширину — чтобы было видно, что именно выбрано. -->
			<div v-if="serviceFirst && branches.length === 1" class="mb-2.5 text-13 text-gray">
				Выбранная услуга доступна только в этом филиале
			</div>

			<RadioGroupRoot
				v-model="selected"
				:class="branches.length === 1 ? 'grid-cols-1' : 'grid-cols-2'"
				class="grid gap-2.5 pb-5"
			>
				<RadioGroupItem
					v-for="branch in branches"
					:key="branch.id"
					:value="branch.id"
					class="flex items-center justify-center min-h-22.75 p-2.5 rounded-4xl bg-card text-center text-15 text-gray duration-75 active:scale-95 data-[state=checked]:bg-card-darker data-[state=checked]:shadow-accent"
				>
					{{ shortAddress(branch) }}
				</RadioGroupItem>
			</RadioGroupRoot>
		</template>

		<!-- Плашка во всю ширину: вылезаем из p-2.5 обёртки отрицательными отступами -->
		<div class="sticky bottom-0 left-0 mt-auto -mx-2.5 -mb-2.5 p-2.5 bg-card">
			<UiBtn :disabled="!selected" fluid @click="submit"> Выбрать филиал </UiBtn>
		</div>
	</div>
</template>
