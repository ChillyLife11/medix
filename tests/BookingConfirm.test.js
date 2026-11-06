import { afterEach, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import BookingConfirm from '@/components/booking/BookingConfirm.vue'
const pass = { template: '<div><slot /></div>' }
const wrappers = []
function render(names = {}) {
	const state = ref({ firstName: '', lastName: '', middleName: '', ...names })
	const saving = ref(false),
		open = ref(true),
		confirmed = vi.fn()
	const Host = defineComponent({
		setup: () => () =>
			h(BookingConfirm, {
				...state.value,
				open: open.value,
				saving: saving.value,
				'onUpdate:firstName': (v) => (state.value.firstName = v),
				'onUpdate:lastName': (v) => (state.value.lastName = v),
				'onUpdate:middleName': (v) => (state.value.middleName = v),
				onConfirm: confirmed,
				'onUpdate:open': (v) => (open.value = v),
			}),
	})
	const view = mount(Host, {
		attachTo: document.body,
		global: {
			stubs: {
				DialogRoot: pass,
				DialogPortal: pass,
				DialogContent: pass,
				DialogTitle: pass,
				DialogOverlay: true,
			},
		},
	})
	wrappers.push(view)
	return { view, state, saving, open, confirmed }
}
afterEach(() => {
	for (const w of wrappers) w.unmount()
	wrappers.length = 0
	document.body.innerHTML = ''
})
const confirm = (view) =>
	view.findAll('button').find((b) => ['Подтвердить запись', 'Записываем…'].includes(b.text()))
it('opens empty fields without initial errors, then focuses the first missing field', async () => {
	const { view, confirmed } = render()
	expect(view.findAll('input')).toHaveLength(3)
	expect(view.findAll('[role=alert]')).toHaveLength(0)
	await confirm(view).trigger('click')
	expect(confirmed).not.toHaveBeenCalled()
	expect(view.text()).toContain('Укажите фамилию')
	expect(document.activeElement.id).toBe('booking-lastName')
})
it('accepts required names without a patronymic', async () => {
	const { view, confirmed } = render()
	await view.get('#booking-lastName').setValue('Family')
	await view.get('#booking-firstName').setValue('Given')
	await confirm(view).trigger('click')
	expect(confirmed).toHaveBeenCalledTimes(1)
})
it('shows existing name and permits editing it', async () => {
	const { view, state } = render({ firstName: 'Given', lastName: 'Family' })
	expect(view.findAll('input')).toHaveLength(0)
	await view.get('[aria-label="Изменить: ФИО"]').trigger('click')
	expect(view.get('#booking-firstName').element.value).toBe('Given')
	await view.get('#booking-firstName').setValue('Edited')
	expect(state.value.firstName).toBe('Edited')
})
it('blocks overlong optional patronymic', async () => {
	const { view, confirmed } = render({
		firstName: 'Given',
		lastName: 'Family',
		middleName: 'а'.repeat(256),
	})
	await confirm(view).trigger('click')
	expect(confirmed).not.toHaveBeenCalled()
	expect(view.text()).toContain('Не более 255 символов')
	expect(document.activeElement.id).toBe('booking-middleName')
})
it('disables editing and submission during saving', async () => {
	const { view, saving, confirmed } = render({ firstName: 'Given', lastName: 'Family' })
	saving.value = true
	await view.vm.$nextTick()
	expect(confirm(view).attributes('disabled')).toBeDefined()
	await confirm(view).trigger('click')
	expect(confirmed).not.toHaveBeenCalled()
})
it('keeps edits after closing and reopening confirmation', async () => {
	const { view, open, state } = render()
	await view.get('#booking-firstName').setValue('Draft')
	open.value = false
	await view.vm.$nextTick()
	open.value = true
	await view.vm.$nextTick()
	expect(state.value.firstName).toBe('Draft')
	expect(view.get('#booking-firstName').element.value).toBe('Draft')
})
