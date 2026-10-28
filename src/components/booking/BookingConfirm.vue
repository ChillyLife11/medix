<script setup>
// Сводка перед созданием записи. Последний шаг флоу показывает всё, что выбрано,
// и даёт вернуться к любому шагу — иконкой рядом со строкой. Первой строкой —
// ФИО пациента, его можно поправить прямо здесь. Саму запись создаёт уже
// родитель по событию confirm.
import { computed, nextTick, ref, watch } from 'vue'
import { DialogRoot, DialogPortal, DialogOverlay, DialogContent, DialogTitle } from 'reka-ui'
import { Settings2, X } from '@lucide/vue'
import UiBtn from '@/components/ui/UiBtn.vue'

const open = defineModel('open', { type: Boolean, default: false })

// ФИО пациента — обязательное поле записи (фамилия и имя; отчество есть не у
// всех). Подставляется из карточки клиента, человек может поправить.
const lastName = defineModel('lastName', { type: String, default: '' })
const firstName = defineModel('firstName', { type: String, default: '' })
const middleName = defineModel('middleName', { type: String, default: '' })

const nameReady = computed(() => Boolean(lastName.value.trim() && firstName.value.trim()))
const fullName = computed(() =>
	[lastName.value, firstName.value, middleName.value]
		.map((part) => part.trim())
		.filter(Boolean)
		.join(' '),
)

// Кнопка подтверждения всегда активна: по нажатию проверяем обязательные поля,
// подсвечиваем незаполненные красным с подписью под полем и прокручиваем окно к
// первому из них. До первого нажатия ошибок не показываем — пустое поле при
// открытии окна ещё не ошибка.
const showErrors = ref(false)
const errors = computed(() => ({
	lastName: showErrors.value && !lastName.value.trim() ? 'Укажите фамилию' : '',
	firstName: showErrors.value && !firstName.value.trim() ? 'Укажите имя' : '',
}))

// Поля ввода показываем сразу, если ФИО неполное, — иначе по иконке, как у
// остальных строк сводки. Решаем в момент открытия окна, чтобы поля не
// схлопывались прямо под пальцами, когда человек дописал имя.
const editingName = ref(false)
watch(
	open,
	(isOpen) => {
		if (!isOpen) return
		editingName.value = !nameReady.value
		showErrors.value = false
	},
	{ immediate: true },
)

// Поля в порядке на экране — к первому незаполненному и прокручиваем.
const lastNameInput = ref(null)
const firstNameInput = ref(null)

async function confirm() {
	if (nameReady.value) {
		emit('confirm')
		return
	}
	showErrors.value = true
	editingName.value = true
	await nextTick()
	const target = !lastName.value.trim() ? lastNameInput.value : firstNameInput.value
	target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

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
					<div>
						<dt class="text-15 font-semibold text-black">ФИО:</dt>
						<dd v-if="!editingName" class="flex items-center gap-2 text-15 text-gray">
							<span>{{ fullName }}</span>
							<button
								type="button"
								class="shrink-0 text-gray duration-60 active:scale-[0.92]"
								aria-label="Изменить: ФИО"
								@click="editingName = true"
							>
								<Settings2 :size="18" :stroke-width="1.5" />
							</button>
						</dd>
						<dd v-else class="mt-2 space-y-2">
							<div>
								<input
									ref="lastNameInput"
									v-model="lastName"
									type="text"
									autocomplete="family-name"
									placeholder="Фамилия *"
									:aria-invalid="Boolean(errors.lastName)"
									:class="
										errors.lastName
											? 'border-danger'
											: 'border-secondary focus:border-brand'
									"
									class="block w-full py-3 px-5 rounded-2xl border bg-card-darker text-15 text-gray outline-none placeholder:text-gray/50"
								/>
								<p v-if="errors.lastName" class="mt-1 px-2 text-13 text-danger">
									{{ errors.lastName }}
								</p>
							</div>
							<div>
								<input
									ref="firstNameInput"
									v-model="firstName"
									type="text"
									autocomplete="given-name"
									placeholder="Имя *"
									:aria-invalid="Boolean(errors.firstName)"
									:class="
										errors.firstName
											? 'border-danger'
											: 'border-secondary focus:border-brand'
									"
									class="block w-full py-3 px-5 rounded-2xl border bg-card-darker text-15 text-gray outline-none placeholder:text-gray/50"
								/>
								<p v-if="errors.firstName" class="mt-1 px-2 text-13 text-danger">
									{{ errors.firstName }}
								</p>
							</div>
							<input
								v-model="middleName"
								type="text"
								autocomplete="additional-name"
								placeholder="Отчество"
								class="block w-full py-3 px-5 rounded-2xl border bg-card-darker text-15 text-gray outline-none placeholder:text-gray/50 border-secondary focus:border-brand"
							/>
						</dd>
					</div>
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
