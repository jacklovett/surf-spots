import { useState, useEffect } from 'react'
import { ValidationFn } from './index'

interface UseFormValidationProps<T> {
  initialFormState: T
  validationFunctions: { [K in keyof T]?: ValidationFn<T[K]> }
}

const initializeTouchedFields = <T extends Record<string, any>>(fields: T) =>
  Object.keys(fields).reduce(
    (acc, key) => ({ ...acc, [key]: false }),
    {} as { [K in keyof T]: boolean },
  )

export const useFormValidation = <T extends Record<string, any>>({
  initialFormState,
  validationFunctions,
}: UseFormValidationProps<T>) => {
  const [formState, setFormState] = useState<T>(initialFormState)
  const [touchedFields, setTouchedFields] = useState<{
    [K in keyof T]: boolean
  }>(initializeTouchedFields(initialFormState))
  const [errors, setErrors] = useState<{ [K in keyof T]?: string }>({})
  const [isFormValid, setIsFormValid] = useState(false)

  useEffect(() => {
    let hasErrorsChanged = false
    let allFieldsValid = true

    // Calculate new errors and validity
    const newErrors = Object.keys(formState as Record<string, any>).reduce(
      (acc, field) => {
        const key = field as keyof T
        const validationFn = validationFunctions[key]
        const error = validationFn ? validationFn(formState[key]) : ''

        if (error) {
          allFieldsValid = false
        }

        // Only update errors for touched fields
        if (touchedFields[key]) {
          acc[key] = error

          if (errors[key] !== error) {
            hasErrorsChanged = true
          }
        }
        return acc
      },
      {} as { [K in keyof T]?: string },
    )

    // Update errors only if they have changed
    if (hasErrorsChanged) {
      setErrors(newErrors)
    }

    // Update form validity only when a field has been changed
    const anyFieldsTouched = Object.values(touchedFields).some(Boolean)

    const isValid = allFieldsValid && anyFieldsTouched

    if (isValid !== isFormValid) {
      setIsFormValid(isValid)
    }
  }, [formState, touchedFields, validationFunctions])

  const handleChange = <K extends keyof T>(name: K, value: T[K]) => {
    setTouchedFields((prev) =>
      prev[name] !== true ? { ...prev, [name]: true } : prev,
    )
    setFormState((prev) =>
      prev[name] !== value ? { ...prev, [name]: value } : prev,
    )
  }

  const handleBlur = <K extends keyof T>(name: K) =>
    setTouchedFields((prev) =>
      prev[name] !== true ? { ...prev, [name]: true } : prev,
    )

  return {
    formState,
    errors,
    isFormValid,
    handleChange,
    handleBlur,
    setFormState,
  }
}
