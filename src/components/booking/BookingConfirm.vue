<script setup>
// Сводка перед созданием записи. Последний шаг флоу показывает всё, что выбрано,
// и даёт вернуться к любому шагу — иконкой рядом со строкой. Саму запись создаёт
// уже родитель по событию confirm.
import { computed, nextTick, ref, watch } from 'vue'
import { patientNameErrors } from '@/composables/patientName'
import { DialogRoot, DialogPortal, DialogOverlay, DialogContent, DialogTitle } from 'reka-ui'
import { Settings2, X } from '@lucide/vue'
import UiBtn from '@/components/ui/UiBtn.vue'

const open = defineModel('open', { type: Boolean, default: false })

const props = defineProps({
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
const firstName = defineModel('firstName', { type: String, default: '' })
const lastName = defineModel('lastName', { type: String, default: '' })
const middleName = defineModel('middleName', { type: String, default: '' })
const touched = ref(false)
const editingName = ref(false)
const inputs = {}
const parts = computed(() => ({
	firstName: firstName.value,
	lastName: lastName.value,
	middleName: middleName.value,
}))
const errors = computed(() => patientNameErrors(parts.value))
const fields = [
	{
		key: 'lastName',
		label: 'Фамилия',
		autocomplete: 'family-name',
		required: true,
		model: lastName,
	},
	{
		key: 'firstName',
		label: 'Имя',
		autocomplete: 'given-name',
		required: true,
		model: firstName,
	},
	{
		key: 'middleName',
		label: 'Отчество',
		autocomplete: 'additional-name',
		required: false,
		model: middleName,
	},
]
const fullName = computed(() =>
	[lastName.value, firstName.value, middleName.value]
		.map((part) => part.trim())
		.filter(Boolean)
		.join(' '),
)
watch(
	open,
	(value) => {
		if (value) {
			touched.value = false
			editingName.value = Object.keys(errors.value).length > 0
		}
	},
	{ immediate: true },
)
async function confirm() {
	if (props.saving) return
	touched.value = true
	const firstError = fields.find((field) => errors.value[field.key])
	if (!firstError) {
		emit('confirm')
		return
	}
	editingName.value = true
	await nextTick()
	const input = inputs[firstError.key]
	input?.focus({ preventScroll: true })
	input?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
</script>

<template>
	<DialogRoot v-model:open="open">
		<DialogPortal>
			<DialogOverlay
				class="fixed inset-0 z-40 bg-black/40 data-[state=open]:animate-[overlay-in_0.2s_ease] data-[state=closed]:animate-[overlay-out_0.2s_ease]"
			/>
			<DialogContent
				:aria-describedby="undefined"
				@open-auto-focus.prevent
				class="fixed inset-0 z-50 m-auto h-fit max-h-[92dvh] scroll-pb-6 w-[92vw] max-w-100 overflow-y-auto p-6 rounded-4xl bg-card data-[state=open]:animate-[dialog-in_0.2s_ease] data-[state=closed]:animate-[dialog-out_0.15s_ease]"
			>
				<div class="flex items-start gap-2.5">
					<DialogTitle class="grow text-15 text-gray/60">Данные вашей записи</DialogTitle>
					<button
						type="button"
						class="shrink-0 text-gray/60 duration-60 active:scale-[0.92]"
						aria-label="Закрыть"
						:disabled="saving"
						@click="open = false"
					>
						<X :size="26" :stroke-width="1" />
					</button>
				</div>

				<dl class="mt-4 space-y-4">
					<div>
						<dt class="text-15 font-semibold text-black">ФИО:</dt>
						<dd v-if="!editingName" class="flex items-center gap-2 text-15 text-gray">
							<span>{{ fullName }}</span>
							<button
								type="button"
								aria-label="Изменить: ФИО"
								:disabled="saving"
								@click="editingName = true"
							>
								<Settings2 :size="18" :stroke-width="1.5" />
							</button>
						</dd>
						<dd v-else class="mt-2 space-y-3">
							<div v-for="field in fields" :key="field.key">
								<label :for="'booking-' + field.key" class="block text-13 text-gray"
									>{{ field.label }}{{ field.required ? ' *' : '' }}</label
								>
								<input
									:id="'booking-' + field.key"
									:ref="(el) => (inputs[field.key] = el)"
									:value="field.model.value"
									@input="field.model.value = $event.target.value"
									:autocomplete="field.autocomplete"
									:required="field.required"
									:disabled="saving"
									:aria-invalid="touched && Boolean(errors[field.key])"
									:aria-describedby="
										touched && errors[field.key]
											? 'booking-error-' + field.key
											: undefined
									"
									:class="
										touched && errors[field.key]
											? 'border-red-500'
											: 'border-gray/30'
									"
									class="w-full min-w-0 rounded-xl border bg-card px-3 py-2 text-base text-gray outline-none focus:border-brand"
								/>
								<p
									v-if="touched && errors[field.key]"
									:id="'booking-error-' + field.key"
									class="mt-1 text-13 text-red-500"
									role="alert"
								>
									{{ errors[field.key] }}
								</p>
							</div>
						</dd>
					</div>
					<div v-for="row in rows" :key="row.label">
						<dt class="text-15 font-semibold text-black">{{ row.label }}:</dt>
						<dd class="flex items-center gap-2 text-15 text-gray">
							<span>{{ row.value || '—' }}</span>
							<button
								type="button"
								class="shrink-0 text-gray duration-60 active:scale-[0.92]"
								:disabled="saving"
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
					<UiBtn fluid :disabled="saving" @click="confirm">
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
