<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { RadioGroupRoot, RadioGroupItem } from 'reka-ui'
import UiBtn from '@/components/ui/UiBtn.vue'
import UiPageTitle from '@/components/ui/UiPageTitle.vue'
import UiLoader from '@/components/ui/UiLoader.vue'
import { getBranches, loadedBranches } from '@/api/branches'
import { useBooking } from '@/composables/useBooking'

const router = useRouter()
const { branchId } = useBooking()

// При возврате назад филиалы уже в кеше — берём их сразу, без запроса и лоадера.
const branches = ref(loadedBranches() ?? [])
const loading = ref(!branches.value.length)
const failed = ref(false)
const selected = ref(branchId.value ?? branches.value[0]?.id ?? null)

onMounted(async () => {
	if (!loading.value) return
	try {
		branches.value = await getBranches()
		selected.value ??= branches.value[0]?.id ?? null
	} catch (e) {
		console.warn('[branch] index failed', e)
		failed.value = true
	} finally {
		loading.value = false
	}
})

function submit() {
	branchId.value = selected.value
	router.push('/service')
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
			Филиалы не найдены.
		</div>

		<RadioGroupRoot v-else v-model="selected" class="grid grid-cols-2 gap-2.5 pb-5">
			<RadioGroupItem
				v-for="branch in branches"
				:key="branch.id"
				:value="branch.id"
				class="flex items-center justify-center min-h-22.75 p-2.5 rounded-4xl bg-card text-center text-15 text-gray duration-100 active:scale-95 data-[state=checked]:bg-card-darker data-[state=checked]:shadow-accent"
			>
				{{ branch.title }}
			</RadioGroupItem>
		</RadioGroupRoot>

		<!-- Плашка во всю ширину: вылезаем из p-2.5 обёртки отрицательными отступами -->
		<div class="sticky bottom-0 left-0 mt-auto -mx-2.5 -mb-2.5 p-2.5 bg-card">
			<UiBtn :disabled="!selected" fluid @click="submit"> Выбрать филиал </UiBtn>
		</div>
	</div>
</template>
