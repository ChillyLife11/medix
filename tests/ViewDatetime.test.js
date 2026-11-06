import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import ViewDatetime from '@/views/ViewDatetime.vue'
import { useBooking } from '@/composables/useBooking'
import { useAuth } from '@/composables/useAuth'
import { clearSession, setSession } from '@/session'
import { createAppointment } from '@/api/appointments'
vi.mock('@/config', () => ({ COMPANY_ID: 3, FALLBACK_PHONE: null, fileUrl: (v) => v }))
vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock('@/api/users', () => ({
	getUserByChatId: vi.fn(),
	getUserByPhone: vi.fn(),
	registerUser: vi.fn(),
}))
vi.mock('@/composables/useMessenger', () => ({ useMessenger: () => ({ user: {}, userName: '' }) }))
vi.mock('@/api/appointments', () => ({ createAppointment: vi.fn() }))
vi.mock('@/api/http', () => ({ apiErrorMessage: (e) => e.message }))
vi.mock('@/api/branches', () => ({
	dropBranches: vi.fn(),
	loadedBranch: () => ({ services: [], coworkers: [] }),
	getBranch: vi.fn(),
	nearestSlots: () => ({ date: '2030-01-01' }),
	scheduleDates: () => new Set(['2030-01-01']),
	scheduleSlots: () => ['10:00'],
	shortAddress: () => '',
}))
let view
beforeEach(() => {
	vi.clearAllMocks()
	clearSession()
	setSession({ id: 10, access_token: 'fixture' })
	useAuth().client.value = { id: 10, first_name: 'Old', last_name: 'OldFamily' }
	const b = useBooking()
	b.startRepeat({ branch: 3, service: 4, master: 5 })
	b.date.value = '2030-01-01'
	b.time.value = '10:00'
	b.fillPatient({ firstName: ' Given ', lastName: ' Family ' })
	view = shallowMount(ViewDatetime)
})
afterEach(() => view.unmount())
it('sends distinct trimmed names once and updates memory only after success', async () => {
	let finish
	createAppointment.mockImplementation(
		() =>
			new Promise((resolve) => {
				finish = resolve
			}),
	)
	const first = view.vm.submit()
	await view.vm.submit()
	expect(createAppointment).toHaveBeenCalledTimes(1)
	expect(createAppointment.mock.calls[0][0]).toMatchObject({
		first_name: 'Given',
		last_name: 'Family',
	})
	expect(useAuth().client.value.first_name).toBe('Old')
	finish({})
	await first
	expect(useAuth().client.value.first_name).toBe('Given')
	expect(useAuth().client.value.last_name).toBe('Family')
})
it.each([
	{ firstName: '', lastName: '' },
	{ firstName: 'Only', lastName: '' },
	{ firstName: '', lastName: 'Only' },
	{ firstName: ' ', lastName: ' ' },
	{ firstName: 'x'.repeat(256), lastName: 'Family' },
])('never submits invalid names %j', async (names) => {
	Object.assign(useBooking().patient.value, names)
	await view.vm.submit()
	expect(createAppointment).not.toHaveBeenCalled()
})
it('retains entered names and exposes API error for retry', async () => {
	vi.spyOn(console, 'warn').mockImplementation(() => {})
	createAppointment.mockRejectedValue(new Error('Fixture server error'))
	await view.vm.submit()
	expect(useBooking().patient.value.firstName).toBe('Given')
	expect(view.vm.saveError).toBe('Fixture server error')
	expect(view.vm.saving).toBe(false)
	vi.restoreAllMocks()
})
it('ignores an old account response after switching accounts', async () => {
	let finish
	createAppointment.mockImplementation(
		() =>
			new Promise((resolve) => {
				finish = resolve
			}),
	)
	const pending = view.vm.submit()
	setSession({ id: 11, access_token: 'other' })
	useAuth().client.value = { id: 11, first_name: 'Other' }
	finish({})
	await pending
	expect(useAuth().client.value.first_name).toBe('Other')
	expect(useBooking().patient.value.firstName).toBe('')
	expect(view.vm.success).toBe(false)
})
