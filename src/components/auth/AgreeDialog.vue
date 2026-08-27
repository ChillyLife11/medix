<script setup>
// Согласия на обработку ПДн и запрос номера — окно поверх сплэша.
// Отдельной страницы у согласий нет: пока клиент не опознан, под окном остаётся
// экран загрузки, а закрыть окно нельзя — без номера дальше всё равно не пройти.
import { ref } from 'vue'
import { DialogRoot, DialogPortal, DialogOverlay, DialogContent, DialogTitle } from 'reka-ui'
import { Check } from '@lucide/vue'
import UiBtn from '@/components/ui/UiBtn.vue'
import { useAuth } from '@/composables/useAuth'
import { useMessenger } from '@/composables/useMessenger'
import { FALLBACK_PHONE } from '@/config'

const open = defineModel('open', { type: Boolean, default: false })
const emit = defineEmits(['signed'])

const { signIn } = useAuth()
const { isMax, requestPhone, openLink } = useMessenger()

// Текст под кнопкой, если номер получить не удалось. Отказ — не ошибка
// приложения, поэтому объясняем, что делать дальше.
const PHONE_ERRORS = {
	refused: 'Без номера телефона записаться нельзя — нажмите «Отправить» и поделитесь контактом.',
	'request-error': 'Мессенджер не отдал номер. Попробуйте ещё раз.',
	unknown: 'Не удалось получить номер телефона. Попробуйте ещё раз.',
	'no-sdk': 'Откройте приложение в MAX — номер телефона приходит оттуда.',
}

const submitting = ref(false)
const error = ref('')

// Документы клиники — ссылками прямо в тексте согласий.
const DOCS = {
	privacy: 'https://dental-web.pro/privacy.pdf',
	policy: 'https://dental-web.pro/policy.pdf',
}

// Номер спрашиваем у мессенджера — окно и открыто как раз для того, чтобы
// пользователь дал согласия и поделился контактом. В MAX фолбэка нет: не дал
// номер — не вошёл. Отладочный номер подставляется только в dev-сборке вне
// мессенджера.
// Документы клиники. В MAX открываем их через SDK — иначе мини-апп скачивает
// PDF вместо показа. Вне мессенджера ссылка работает как обычная.
function openDocument(event, url) {
	if (openLink(url)) event.preventDefault()
}

// Согласия даются самим фактом продолжения — отдельных галочек нет, о чём и
// говорит заголовок окна.
async function submit() {
	if (submitting.value) return
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
				<DialogTitle class="max-w-65 text-center text-base font-normal leading-[1.2]">
					Запуская приложение, Вы даете согласия:
				</DialogTitle>

				<!-- Ссылки вшиты прямо в пункты: privacy.pdf — «Согласие на обработку
				     персональных данных» (проверено по содержимому файла),
				     policy.pdf — политика. В MAX их открывает системный браузер,
				     см. openDocument(). Маркер — галочка, поэтому список без
				     собственных маркеров. -->
				<ul class="w-full mt-4 space-y-2 leading-[1.2] text-gray">
					<li class="flex items-start gap-2">
						<Check :size="16" :stroke-width="2" class="shrink-0 mt-0.5 text-brand" />
						<span>
							ознакомлен(а) с
							<a
								:href="DOCS.policy"
								target="_blank"
								rel="noopener"
								class="underline text-brand"
								@click="openDocument($event, DOCS.policy)"
							>
								политикой конфиденциальности
							</a>
						</span>
					</li>
					<li class="flex items-start gap-2">
						<Check :size="16" :stroke-width="2" class="shrink-0 mt-0.5 text-brand" />
						<span>
							согласен(а) на
							<a
								:href="DOCS.privacy"
								target="_blank"
								rel="noopener"
								class="underline text-brand"
								@click="openDocument($event, DOCS.privacy)"
							>
								обработку персональных данных
							</a>
						</span>
					</li>
					<li class="flex items-start gap-2">
						<Check :size="16" :stroke-width="2" class="shrink-0 mt-0.5 text-brand" />
						<span
							>согласен(а) на получение сообщений и информационно-рекламной
							рассылки</span
						>
					</li>
				</ul>

				<div v-if="error" class="mt-5 text-13 text-center text-gray">{{ error }}</div>

				<UiBtn :disabled="submitting" class="w-43 mt-5" @click="submit">
					{{ submitting ? 'Проверяем…' : 'Продолжить' }}
				</UiBtn>
			</DialogContent>
		</DialogPortal>
	</DialogRoot>
</template>
