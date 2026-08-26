<script setup>
// Шторка «Обратная связь» с профиля: открывается так же, как правовая
// информация. Структура простая — текст, поле для сообщения и кнопка.
import { ref } from 'vue'
import {
	DialogRoot,
	DialogTrigger,
	DialogPortal,
	DialogOverlay,
	DialogContent,
	DialogTitle,
	DialogClose,
} from 'reka-ui'
import { X } from '@lucide/vue'
import UiBtn from '@/components/ui/UiBtn.vue'
import { sendFeedback } from '@/api/feedback'
import { apiErrorMessage } from '@/api/http'

const open = ref(false)
const text = ref('')
const sending = ref(false)
const error = ref('')
// После успешной отправки поле прячем: писать второй отзыв подряд незачем,
// а подтверждение должно быть видно.
const sent = ref(false)

// Каждое открытие — с чистого листа: прошлый текст и ошибка уже не нужны.
function onToggle(value) {
	open.value = value
	if (value) {
		text.value = ''
		error.value = ''
		sent.value = false
	}
}

async function submit() {
	const message = text.value.trim()
	if (!message || sending.value) return
	sending.value = true
	error.value = ''
	try {
		await sendFeedback(message)
		sent.value = true
	} catch (e) {
		console.warn('[feedback] send failed', e)
		error.value = apiErrorMessage(e, 'Не удалось отправить сообщение. Попробуйте позже.')
	} finally {
		sending.value = false
	}
}
</script>

<template>
	<DialogRoot :open="open" @update:open="onToggle">
		<DialogTrigger class="text-xl underline text-brand duration-60 active:scale-[0.96]">
			Обратная связь
		</DialogTrigger>

		<DialogPortal>
			<DialogOverlay
				class="fixed inset-0 z-40 bg-black/40 data-[state=open]:animate-[overlay-in_0.2s_ease] data-[state=closed]:animate-[overlay-out_0.2s_ease]"
			/>
			<DialogContent
				aria-describedby="undefined"
				class="fixed inset-x-0 bottom-0 top-10 z-50 flex flex-col rounded-t-4xl bg-page data-[state=open]:animate-[sheet-in_0.25s_ease] data-[state=closed]:animate-[sheet-out_0.2s_ease]"
			>
				<div class="shrink-0 flex items-center gap-2.5 p-5 rounded-t-4xl bg-card">
					<DialogTitle class="grow text-xl text-brand">Обратная связь</DialogTitle>
					<DialogClose
						class="shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-card-darker text-gray duration-60 active:scale-[0.92]"
						aria-label="Закрыть"
					>
						<X :size="20" :stroke-width="1.5" />
					</DialogClose>
				</div>

				<div class="grow overflow-y-auto overscroll-contain p-2.5 space-y-2.5">
					<p class="px-3 text-15 text-center text-gray">
						Вы можете поделиться своим мнением о нашей работе, оставить отзыв или
						предложения о сотрудничестве
					</p>

					<div v-if="sent" class="p-5 rounded-4xl bg-card text-15 text-center text-gray">
						Спасибо! Сообщение отправлено — мы обязательно его прочитаем.
					</div>

					<template v-else>
						<textarea
							v-model="text"
							rows="8"
							maxlength="1000"
							placeholder="Ваше сообщение"
							class="block w-full p-5 rounded-4xl bg-card text-15 text-gray resize-none outline-none placeholder:text-gray/50"
						/>
						<div v-if="error" class="px-3 text-13 text-center text-gray">
							{{ error }}
						</div>
					</template>
				</div>

				<div class="shrink-0 p-2.5 pb-7.5 bg-card">
					<DialogClose v-if="sent" as-child>
						<UiBtn fluid>Закрыть</UiBtn>
					</DialogClose>
					<UiBtn v-else :disabled="!text.trim() || sending" fluid @click="submit">
						{{ sending ? 'Отправляем…' : 'Отправить' }}
					</UiBtn>
				</div>
			</DialogContent>
		</DialogPortal>
	</DialogRoot>
</template>
