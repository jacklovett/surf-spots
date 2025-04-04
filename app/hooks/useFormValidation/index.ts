import { useFormValidation } from './useFormValidation'

// Validation helpers
export const validateRequired = (value: string, fieldName?: string): string =>
  !value ? `${fieldName || 'This field'} is required.` : ''

export const validateEmail = (email: string): string =>
  !email
    ? 'Email is required.'
    : !email.includes('@')
    ? 'Please enter a valid email address.'
    : ''

export const validatePassword = (password: string): string =>
  !password
    ? 'Password is required.'
    : password.length < 8
    ? 'Password must be at least 8 characters long.'
    : ''

export const validateDirection = (
  value: string,
  isRequired: boolean = true,
  fieldName: string = 'Direction',
): string => {
  // Handle required validation
  if (isRequired) {
    const requiredError = validateRequired(value, fieldName)
    if (requiredError) {
      return requiredError
    }
  }

  // Handle direction format validation
  const directionRegex = /^(N|NE|E|SE|S|SW|W|NW)(-(N|NE|E|SE|S|SW|W|NW))?$/
  return directionRegex.test(value)
    ? ''
    : `Enter a valid direction range in the format 'NW-S'.`
}

export const validateLongitude = (value: string): string => {
  if (!value) {
    return 'Longitude is required.'
  }

  const numValue = parseFloat(value)

  if (isNaN(numValue)) {
    return 'Longitude must be a number.'
  }

  if (numValue < -180 || numValue > 180) {
    return 'Enter a valid longitude (-180 to 180).'
  }
  return ''
}

export const validateLatitude = (value: string): string => {
  if (!value) {
    return 'Latitude is required.'
  }

  const numValue = parseFloat(value)

  if (isNaN(numValue)) {
    return 'Latitude must be a number.'
  }

  if (numValue < -90 || numValue > 90) {
    return 'Enter a valid latitude (-90 to 90).'
  }

  return ''
}

export type ValidationFn = (value: string, fieldName?: string) => string

export default useFormValidation
