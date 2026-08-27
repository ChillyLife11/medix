<script setup>
// Согласия на обработку ПДн и запрос номера — окно поверх сплэша.
// Отдельной страницы у согласий нет: пока клиент не опознан, под окном остаётся
// экран загрузки, а закрыть окно нельзя — без номера дальше всё равно не пройти.
import { computed, ref } from 'vue'
import { DialogRoot, DialogPortal, DialogOverlay, DialogContent, DialogTitle } from 'reka-ui'
import { ExternalLink } from '@lucide/vue'
import UiBtn from '@/components/ui/UiBtn.vue'
import { useAuth } from '@/composables/useAuth'
import { useMessenger } from '@/composables/useMessenger'
import { FALLBACK_PHONE } from '@/config'

const open = defineModel('open', { type: Boolean, default: false })
const emit = defineEmits(['signed'])

const { signIn } = useAuth()
const { isMax, requestPhone } = useMessenger()

// Текст под кнопкой, если номер получить не удалось. Отказ — не ошибка
// приложения, поэтому объясняем, что делать дальше.
const PHONE_ERRORS = {
	refused: 'Без номера телефона записаться нельзя — нажмите «Отправить» и поделитесь контактом.',
	'request-error': 'Мессенджер не отдал номер. Попробуйте ещё раз.',
	unknown: 'Не удалось получить номер телефона. Попробуйте ещё раз.',
	'no-sdk': 'Откройте приложение в MAX — номер телефона приходит оттуда.',
}

// Согласие на ПДн предвыбрано.
const personal_agree = ref(true)
const marketing_agree = ref(false)
const submitting = ref(false)
const error = ref('')

const btn_disabled = computed(
	() => !personal_agree.value || !marketing_agree.value || submitting.value,
)

// Номер спрашиваем у мессенджера — окно и открыто как раз для того, чтобы
// пользователь дал согласия и поделился контактом. В MAX фолбэка нет: не дал
// номер — не вошёл. Отладочный номер подставляется только в dev-сборке вне
// мессенджера.
async function submit() {
	if (btn_disabled.value) return
	submitting.value = true
	error.value = ''
	try {
		const { phone, reason } = await requestPhone()
		const userPhone = phone ?? (isMax ? null : FALLBACK_PHONE)
		if (!userPhone) {
			error.value = PHONE_ERRORS[reason] ?? PHONE_ERRORS.unknown
			return
		}
		if (await signIn(userPhone)) emit('signed')
		else error.value = 'Не удалось войти. Попробуйте позже.'
	} finally {
		submitting.value = false
	}
}
</script>

<template>
	<DialogRoot :open="open">
		<DialogPortal>
			<DialogOverlay
				class="fixed inset-0 z-40 bg-black/40 data-[state=open]:animate-[overlay-in_0.2s_ease] data-[state=closed]:animate-[overlay-out_0.2s_ease]"
			/>
			<!-- Закрыть нельзя: ни крестика, ни Esc, ни клика мимо — пока нет
			     номера, приложению нечего показать под окном, кроме сплэша. -->
			<DialogContent
				aria-describedby="undefined"
				class="fixed inset-0 z-50 m-auto flex h-fit max-h-[92vh] w-[calc(100%-2rem)] max-w-100 flex-col items-center overflow-y-auto p-5 rounded-4xl bg-card data-[state=open]:animate-[dialog-in_0.2s_ease] data-[state=closed]:animate-[dialog-out_0.15s_ease]"
				@open-auto-focus.prevent
				@escape-key-down.prevent
				@pointer-down-outside.prevent
				@focus-outside.prevent
				@interact-outside.prevent
			>
				<DialogTitle class="max-w-57.5 text-center text-base font-normal leading-[0.9]">
					Запуская приложение Вы даете согласие на обработку персональных данных:
				</DialogTitle>

				<div class="max-w-65 space-y-2.5 mt-5">
					<label class="group flex items-start">
						<input
							v-model="personal_agree"
							type="checkbox"
							class="peer"
							checked
							hidden
						/>
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

				<!-- Документы клиники: privacy.pdf — это «Согласие на обработку
				     персональных данных» (проверено по содержимому), policy.pdf —
				     политика. Открываем в отдельной вкладке: внутри мини-аппы
				     уводить с экрана согласий некуда. -->
				<!-- Ширину чекбоксов (max-w-65) тут не держим: название документа
				     длинное и в неё не влезает. Кегль мельче основного — иначе
				     строка ломается пополам на узких экранах. -->
				<div class="w-full mt-4 flex flex-col items-start gap-1 text-[12px]">
					<a
						href="https://dental-web.pro/privacy.pdf"
						target="_blank"
						rel="noopener"
						class="flex items-center gap-1 text-brand duration-60 active:scale-[0.96]"
					>
						<span class="underline">Согласие на обработку персональных данных</span>
						<ExternalLink :size="13" :stroke-width="1.5" class="shrink-0" />
					</a>
					<a
						href="https://dental-web.pro/policy.pdf"
						target="_blank"
						rel="noopener"
						class="flex items-center gap-1 text-brand duration-60 active:scale-[0.96]"
					>
						<span class="underline">Политика конфиденциальности</span>
						<ExternalLink :size="13" :stroke-width="1.5" class="shrink-0" />
					</a>
				</div>

				<div v-if="error" class="mt-5 text-13 text-center text-gray">{{ error }}</div>

				<UiBtn :disabled="btn_disabled" class="w-43 mt-5" @click="submit">
					{{ submitting ? 'Проверяем…' : 'Отправить' }}
				</UiBtn>
			</DialogContent>
		</DialogPortal>
	</DialogRoot>
</template>
