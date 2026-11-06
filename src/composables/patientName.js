export const cleanNamePart = (value) => String(value ?? '').trim()

export function patientNameErrors(patient) {
	const errors = {}
	for (const [key, label] of [
		['lastName', 'фамилию'],
		['firstName', 'имя'],
		['middleName', 'отчество'],
	]) {
		const value = cleanNamePart(patient[key])
		if (key !== 'middleName' && !value) errors[key] = 'Укажите ' + label
		else if (Array.from(value).length > 255) errors[key] = 'Не более 255 символов'
	}
	return errors
}

export function patientNameFields(patient) {
	const fields = {
		first_name: cleanNamePart(patient.firstName),
		last_name: cleanNamePart(patient.lastName),
	}
	const middle = cleanNamePart(patient.middleName)
	if (middle) fields.second_name = middle
	return fields
}

export function patientNameParts(account, messenger = {}) {
	const profile = account?.profile ?? {}
	const pick = (...values) => values.map(cleanNamePart).find(Boolean) ?? ''
	return {
		firstName: pick(profile.first_name, account?.first_name, messenger.first_name),
		lastName: pick(profile.last_name, account?.last_name, messenger.last_name),
		middleName: pick(
			profile.second_name,
			profile.middle_name,
			account?.second_name,
			account?.middle_name,
		),
	}
}
