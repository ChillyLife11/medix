<script setup>
import UiBtn from '@/components/ui/UiBtn.vue'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { storage } from '@/lib/storage'

const router = useRouter()
const { signIn } = useAuth()

// Согласие на ПДн предвыбрано, рассылку подставляем из localStorage.
const personal_agree = ref(true)
const marketing_agree = ref(storage.policy)
const phone = ref(storage.phone ?? '')
const submitting = ref(false)
const error = ref('')

// Приводим ввод к виду 71234567890 — как ждёт бэкенд.
const normalizedPhone = computed(() => {
	const digits = phone.value.replace(/\D/g, '')
	return digits.startsWith('8') ? `7${digits.slice(1)}` : digits
})

const btn_disabled = computed(
	() =>
		!personal_agree.value ||
		!marketing_agree.value ||
		normalizedPhone.value.length !== 11 ||
		submitting.value,
)

async function submit() {
	if (btn_disabled.value) return
	submitting.value = true
	error.value = ''
	try {
		const consents = { privacy: personal_agree.value, policy: marketing_agree.value }
		if (await signIn(normalizedPhone.value, consents)) router.replace('/profile')
		else error.value = 'Клиент с таким номером не найден.'
	} finally {
		submitting.value = false
	}
}
</script>

<template>
	<div class="flex items-center justify-center my-auto px-6">
		<div class="flex flex-col items-center w-full p-7 rounded-4xl bg-card">
			<div class="max-w-57.5 text-center leading-[0.9]">
				Запуская приложение Вы даете согласие на обработку персональных данных:
			</div>
			<div class="max-w-65 space-y-2.5 mt-5">
				<label class="group flex items-start">
					<input v-model="personal_agree" type="checkbox" class="peer" checked hidden />
					<span
						class="shrink-0 block w-5 h-5 mr-2.5 rounded-full bg-[#EBEBEB] peer-checked:bg-brand"
					></span>
					<div class="grow leading-[1.2] text-gray">
						- согласен(-а) на обработку персональных данных
					</div>
				</label>
				<label class="group flex items-start">
					<input v-model="marketing_agree" type="checkbox" class="peer" hidden />
					<span
						class="shrink-0 block w-5 h-5 mr-2.5 rounded-full bg-[#EBEBEB] peer-checked:bg-brand"
					></span>
					<div class="grow leading-[1.2] text-gray">
						- согласен(-а) на получение сообщений и информационно-рекламной рассылки
					</div>
				</label>
			</div>
			<input
				v-model="phone"
				type="tel"
				inputmode="tel"
				placeholder="Телефон"
				class="w-full mt-5 py-3 px-5 rounded-full bg-card-darker text-center text-gray outline-none placeholder:text-gray/50"
			/>

			<div v-if="error" class="mt-2.5 text-13 text-center text-gray">{{ error }}</div>

			<UiBtn :disabled="btn_disabled" class="w-43 mt-5" @click="submit">
				{{ submitting ? 'Проверяем…' : 'Отправить' }}
			</UiBtn>
		</div>
	</div>
</template>
