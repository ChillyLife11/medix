import { beforeEach, describe, expect, it, vi } from 'vitest'
import { patientNameErrors, patientNameFields, patientNameParts } from '@/composables/patientName'
import { useBooking } from '@/composables/useBooking'
import { useAuth } from '@/composables/useAuth'
import { clientId, setSession, clearSession } from '@/session'
vi.mock('@/config', () => ({ COMPANY_ID: 3, FALLBACK_PHONE: null, fileUrl: (v) => v }))
vi.mock('@/api/branches', () => ({ dropBranches: vi.fn() }))
vi.mock('@/api/users', () => ({
	getUserByChatId: vi.fn(),
	getUserByPhone: vi.fn(),
	registerUser: vi.fn(),
}))
vi.mock('@/composables/useMessenger', () => ({
	useMessenger: () => ({
		user: { first_name: 'MaxGiven', last_name: 'MaxFamily', username: 'unused' },
		userName: 'nickname',
	}),
}))
beforeEach(() => {
	clearSession()
	setSession({ id: 10, access_token: 'fixture' })
	useBooking().startBooking('branch')
})
it.each([
	[{}, ['lastName', 'firstName']],
	[{ firstName: ' Given ' }, ['lastName']],
	[{ lastName: ' Family ' }, ['firstName']],
	[{ firstName: '  ', lastName: '  ' }, ['lastName', 'firstName']],
	[{ firstName: 'Given', lastName: 'Family' }, []],
	[{ firstName: 'Given', lastName: 'Family', middleName: 'Middle' }, []],
	[{ firstName: 'а'.repeat(256), lastName: 'Family' }, ['firstName']],
	[{ firstName: 'Given', lastName: 'а'.repeat(256) }, ['lastName']],
	[{ firstName: 'Given', lastName: 'Family', middleName: 'а'.repeat(256) }, ['middleName']],
	[{ firstName: 'а'.repeat(255), lastName: 'Family' }, []],
])('validates required fields and Unicode length: %j', (parts, keys) =>
	expect(Object.keys(patientNameErrors(parts))).toEqual(keys),
)
it('maps given and family names without Nelip reversal', () =>
	expect(
		patientNameFields({ firstName: ' Given ', lastName: ' Family ', middleName: ' Middle ' }),
	).toEqual({ first_name: 'Given', last_name: 'Family', second_name: 'Middle' }))
it('does not send empty patronymic', () =>
	expect(
		patientNameFields({ firstName: 'G', lastName: 'F', middleName: ' ' }),
	).not.toHaveProperty('second_name'))
it('prefers patient profile, with MAX fallback per missing part', () =>
	expect(
		patientNameParts(
			{ profile: { first_name: 'Patient', second_name: 'Middle' } },
			{ first_name: 'MAX', last_name: 'Family', username: 'nickname' },
		),
	).toEqual({ firstName: 'Patient', lastName: 'Family', middleName: 'Middle' }))
it('never uses a username for names', () =>
	expect(patientNameParts(null, { username: 'nickname' })).toEqual({
		firstName: '',
		lastName: '',
		middleName: '',
	}))
it('preserves edits during navigation and reset of visit selections', () => {
	const b = useBooking()
	b.fillPatient({ firstName: 'G', lastName: 'F' })
	b.patient.value.firstName = 'Edited'
	b.reset()
	b.fillPatient({ firstName: 'Other', lastName: 'Other' })
	expect(b.patient.value.firstName).toBe('Edited')
})
it.each(['branch', 'service'])('adds patient fields for %s entry', (kind) => {
	const b = useBooking()
	b.startBooking(kind)
	b.fillPatient({ firstName: 'Given', lastName: 'Family' })
	b.time.value = '10:00'
	expect(b.appointmentPayload()).toMatchObject({
		company_id: 3,
		first_name: 'Given',
		last_name: 'Family',
	})
})
it('supports repeat booking with patient data', () => {
	const b = useBooking()
	b.startRepeat({ branch: 3, service: 4, master: 5 })
	b.fillPatient({ firstName: 'Given', lastName: 'Family' })
	b.date.value = '2030-01-01'
	b.time.value = '10:00'
	expect(b.isComplete()).toBe(true)
	expect(b.appointmentPayload().first_name).toBe('Given')
})
it('clears patient and visit on account switch and logout', () => {
	const b = useBooking()
	b.fillPatient({ firstName: 'Secret', lastName: 'Old' })
	b.branchId.value = 3
	setSession({ id: 11, access_token: 'new' })
	expect(b.patient.value.firstName).toBe('')
	expect(b.branchId.value).toBe(null)
	b.fillPatient({ firstName: 'Another' })
	clearSession()
	expect(b.patient.value.firstName).toBe('')
})
it('remembers saved profile including nested fields, without erasing middle name', () => {
	const auth = useAuth()
	auth.client.value = {
		id: 10,
		profile: { first_name: 'Old', last_name: 'Old', second_name: 'Kept' },
	}
	auth.rememberPatient({ first_name: 'Given', last_name: 'Family' }, 10)
	expect(auth.clientNameParts.value).toEqual({
		firstName: 'Given',
		lastName: 'Family',
		middleName: 'Kept',
	})
	auth.rememberPatient({ first_name: 'Wrong' }, 999)
	expect(auth.clientNameParts.value.firstName).toBe('Given')
})
