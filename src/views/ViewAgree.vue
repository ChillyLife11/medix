<script setup>
import UiBtn from '@/components/ui/UiBtn.vue'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessenger } from '@/composables/useMessenger'
import { useAuth } from '@/composables/useAuth'
import { storage } from '@/lib/storage'

const router = useRouter()
const { requestPhone } = useMessenger()
const { register } = useAuth()

// Согласие на ПДн предвыбрано, рассылку подставляем из localStorage (как в оригинале).
const personal_agree = ref(true)
const marketing_agree = ref(storage.policy)
const submitting = ref(false)

const btn_disabled = computed(
	() => !personal_agree.value || !marketing_agree.value || submitting.value,
)

async function submit() {
	if (btn_disabled.value) return
	submitting.value = true
	try {
		// Запрашиваем телефон у MAX. Точное поле ответа проверить на реальном устройстве.
		const contact = await requestPhone()
		const phone =
			typeof contact === 'string'
				? contact
				: (contact?.phone ?? contact?.phone_number ?? null)

		const consents = { privacy: personal_agree.value, policy: marketing_agree.value }
		if (await register(phone, consents)) router.replace('/profile')
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
			<UiBtn :disabled="btn_disabled" class="w-43 mt-5" @click="submit">Отправить</UiBtn>
		</div>
	</div>
</template>
