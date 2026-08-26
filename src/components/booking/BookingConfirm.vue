<script setup>
// Сводка перед созданием записи. Последний шаг флоу показывает всё, что выбрано,
// и даёт вернуться к любому шагу — иконкой рядом со строкой. Саму запись создаёт
// уже родитель по событию confirm.
import { DialogRoot, DialogPortal, DialogOverlay, DialogContent, DialogTitle } from 'reka-ui'
import { Settings2, X } from '@lucide/vue'
import UiBtn from '@/components/ui/UiBtn.vue'

const open = defineModel('open', { type: Boolean, default: false })

defineProps({
	// [{ label, value, step }] — step это роут шага, куда ведёт иконка.
	// Для шага, на котором мы уже стоим (дата и время), step не нужен.
	rows: {
		type: Array,
		default: () => [],
	},
	saving: Boolean,
	error: {
		type: String,
		default: '',
	},
})

const emit = defineEmits(['confirm', 'cancel', 'edit'])
</script>

<template>
	<DialogRoot v-model:open="open">
		<DialogPortal>
			<DialogOverlay
				class="fixed inset-0 z-40 bg-black/40 data-[state=open]:animate-[overlay-in_0.2s_ease] data-[state=closed]:animate-[overlay-out_0.2s_ease]"
			/>
			<DialogContent
				aria-describedby="undefined"
				@open-auto-focus.prevent
				class="fixed inset-0 z-50 m-auto h-fit max-h-[92vh] w-[92vw] max-w-100 overflow-y-auto p-6 rounded-4xl bg-card data-[state=open]:animate-[dialog-in_0.2s_ease] data-[state=closed]:animate-[dialog-out_0.15s_ease]"
			>
				<div class="flex items-start gap-2.5">
					<DialogTitle class="grow text-15 text-gray/60">Данные вашей записи</DialogTitle>
					<button
						type="button"
						class="shrink-0 text-gray/60 duration-60 active:scale-[0.92]"
						aria-label="Закрыть"
						@click="open = false"
					>
						<X :size="26" :stroke-width="1" />
					</button>
				</div>

				<dl class="mt-4 space-y-4">
					<div v-for="row in rows" :key="row.label">
						<dt class="text-15 font-semibold text-black">{{ row.label }}:</dt>
						<dd class="flex items-center gap-2 text-15 text-gray">
							<span>{{ row.value || '—' }}</span>
							<button
								type="button"
								class="shrink-0 text-gray duration-60 active:scale-[0.92]"
								:aria-label="`Изменить: ${row.label}`"
								@click="emit('edit', row.step)"
							>
								<Settings2 :size="18" :stroke-width="1.5" />
							</button>
						</dd>
					</div>
				</dl>

				<p v-if="error" class="mt-4 text-13 text-center text-gray">{{ error }}</p>

				<div class="mt-8 space-y-2.5">
					<UiBtn fluid :disabled="saving" @click="emit('confirm')">
						{{ saving ? 'Записываем…' : 'Подтвердить запись' }}
					</UiBtn>
					<UiBtn color="secondary" soft fluid :disabled="saving" @click="emit('cancel')">
						Отменить запись
					</UiBtn>
				</div>
			</DialogContent>
		</DialogPortal>
	</DialogRoot>
</template>
