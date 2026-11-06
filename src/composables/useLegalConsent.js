import { COMPANY_ID } from '@/config'
import { useMessenger } from './useMessenger'
import { createLegalConsent } from './legalConsentStorage'

export function useLegalConsent() {
	return createLegalConsent(COMPANY_ID, useMessenger().user?.id)
}
