import { useFormValidation } from './useFormValidation'

// Validation helpers
export const validateRequired = <T>(value: T, fieldName = 'This field') =>
  value === null || value === undefined || value === '' || value === false
    ? `${fieldName} is required.`
    : ''

export const validateEmail: ValidationFn<string> = (
  email,
  fieldName = 'Email',
) => {
  const requiredError = validateRequired(email, fieldName)

  if (requiredError) {
    return requiredError
  }

  return !email.includes('@')
    ? `Please enter a valid ${fieldName.toLowerCase()}.`
    : ''
}

export const validatePassword: ValidationFn<string> = (
  password,
  fieldName = 'Password',
) => {
  const requiredError = validateRequired(password, fieldName)

  if (requiredError) {
    return requiredError
  }

  return password.length < 8
    ? `${fieldName} must be at least 8 characters long.`
    : ''
}

export const validateDirection = (
  value: string,
  fieldName = 'Direction',
): string => {
  if (!value) {
    return ''
  }

  // Handle direction format validation
  const directionRegex = /^(N|NE|E|SE|S|SW|W|NW)(-(N|NE|E|SE|S|SW|W|NW))?$/
  return directionRegex.test(value)
    ? ''
    : `Enter a valid ${fieldName.toLowerCase()} range in the format 'NW-S'.`
}

export const validateLongitude: ValidationFn<number | undefined> = (
  value,
  fieldName = 'Longitude',
) => {
  if (value === null || value === undefined) {
    return `${fieldName} is required.`
  }

  if (value < -180 || value > 180) {
    return `Enter a valid ${fieldName.toLowerCase()} (-180 to 180).`
  }
  return ''
}

export const validateLatitude: ValidationFn<number | undefined> = (
  value,
  fieldName = 'Latitude',
) => {
  if (value === null || value === undefined) {
    return `${fieldName} is required.`
  }

  if (value < -90 || value > 90) {
    return `Enter a valid ${fieldName.toLowerCase()} (-90 to 90).`
  }

  return ''
}

export const validateUrl = (value: string, fieldName = 'URL') => {
  try {
    if (value) {
      new URL(value)
    }
    return ''
  } catch {
    return `Enter a valid ${fieldName.toLowerCase()} (e.g. https://example.com).`
  }
}

export type ValidationFn<T> = (value: T, fieldName?: string) => string

export default useFormValidation
