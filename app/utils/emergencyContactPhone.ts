import { isValidPhoneNumber } from 'libphonenumber-js'

import { ERROR_INVALID_EMERGENCY_PHONE } from '~/utils/errorUtils'

/** Empty is allowed (optional emergency contact). */
export const validateEmergencyContactPhone = (value?: string): string => {
  if (value == null || value.trim() === '') {
    return ''
  }
  return isValidPhoneNumber(value) ? '' : ERROR_INVALID_EMERGENCY_PHONE
}
