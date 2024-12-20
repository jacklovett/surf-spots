import { useFormValidation } from './useFormValidation'

// Validation helpers
export const validateRequired = (value: string, fieldName?: string) =>
  !value && fieldName ? `${fieldName} is required.` : ''

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

export type ValidationFn = (value: string, fieldName?: string) => string

export default useFormValidation
