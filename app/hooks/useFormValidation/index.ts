import { useFormValidation } from './useFormValidation'
import { parseHeightImperial, parseWeightImperial } from '~/utils/unitUtils'

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

export const validateNumberRange = (
  value: string | undefined,
  min: number,
  max: number,
  fieldName: string
): string => {
  if (!value || value.trim() === '') {
    return '' // Optional fields don't need validation if empty
  }

  const numValue = parseFloat(value)
  if (isNaN(numValue)) {
    return `Please enter a valid number for ${fieldName.toLowerCase()}`
  }

  if (numValue < min || numValue > max) {
    return `Please enter a valid ${fieldName.toLowerCase()}`
  }

  return ''
}

export const validateAge = (value: string | undefined): string => {
  return validateNumberRange(value, 13, 120, 'Age')
}

export const validateHeight = (
  value: string | undefined,
  units: 'metric' | 'imperial',
): string => {
  if (!value || value.trim() === '') {
    return '' // Optional fields don't need validation if empty
  }

  if (units === 'metric') {
    return validateNumberRange(value, 50, 300, 'Height')
  } else {
    // Validate imperial format (feet'inches - same as surfboard length format)
    const totalInches = parseHeightImperial(value)
    if (totalInches === undefined) {
      return 'Please enter height in format like 5\'10 or total inches'
    }
    if (totalInches < 20 || totalInches > 120) {
      return 'Please enter a valid height'
    }
    return ''
  }
}

export const validateWeight = (
  value: string | undefined,
  units: 'metric' | 'imperial',
): string => {
  if (!value || value.trim() === '') {
    return '' // Optional fields don't need validation if empty
  }

  if (units === 'metric') {
    return validateNumberRange(value, 10, 500, 'Weight')
  } else {
    // Validate imperial format (stones'lbs or total lbs)
    const totalLbs = parseWeightImperial(value)
    if (totalLbs === undefined) {
      return 'Please enter weight in format like 12st 5lbs, 12 5, or total lbs'
    }
    if (totalLbs < 20 || totalLbs > 1100) {
      return 'Please enter a valid weight'
    }
    return ''
  }
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
