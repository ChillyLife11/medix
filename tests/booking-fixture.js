import { createApp, h, reactive } from 'vue'
import BookingConfirm from '../src/components/booking/BookingConfirm.vue'
import '../src/style.css'
const state = reactive({
	open: true,
	firstName: '',
	lastName: '',
	middleName: '',
	saving: false,
	error: '',
})
createApp({
	setup: () => () =>
		h(BookingConfirm, {
			...state,
			rows: [
				{ label: 'Услуга', value: 'Тестовая услуга' },
				{ label: 'Врач', value: 'Тестовый врач' },
				{ label: 'Дата', value: '01.01.2030' },
			],
			'onUpdate:open': (v) => (state.open = v),
			'onUpdate:firstName': (v) => (state.firstName = v),
			'onUpdate:lastName': (v) => (state.lastName = v),
			'onUpdate:middleName': (v) => (state.middleName = v),
			onConfirm: async () => {
				if (state.saving) return
				state.saving = true
				try {
					const r = await fetch('/__fixture/appointment/create', {
						method: 'POST',
						body: JSON.stringify(state),
					})
					if (!r.ok) state.error = 'Тестовая ошибка сервера'
				} finally {
					state.saving = false
				}
			},
		}),
}).mount('#app')
