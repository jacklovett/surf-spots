import { useState, useEffect } from 'react'
import { ValidationFn } from './index'

interface UseFormValidationProps {
  initialFormState: { [key: string]: string }
  validationFunctions: { [key: string]: ValidationFn }
}

// Helper: Initialize touched fields
const initializeTouchedFields = (fields: { [key: string]: string }) =>
  Object.keys(fields).reduce((acc, key) => ({ ...acc, [key]: false }), {})

export const useFormValidation = ({
  initialFormState,
  validationFunctions,
}: UseFormValidationProps) => {
  const [formState, setFormState] = useState(initialFormState)
  const [touchedFields, setTouchedFields] = useState<{
    [key: string]: boolean
  }>(() => initializeTouchedFields(initialFormState))
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isFormValid, setIsFormValid] = useState(false)

  useEffect(() => {
    let hasErrorsChanged = false
    let allFieldsValid = true

    // Calculate new errors and validity
    const newErrors = Object.keys(formState).reduce((acc, field) => {
      const validationFn = validationFunctions[field]
      const error = validationFn ? validationFn(formState[field]) : ''

      // Only update errors for touched fields
      if (touchedFields[field]) {
        acc[field] = error
        if (error) {
          allFieldsValid = false
        }
        if (errors[field] !== error) {
          hasErrorsChanged = true
        }
      }
      return acc
    }, {} as { [key: string]: string })

    // Update errors only if they have changed
    if (hasErrorsChanged) {
      setErrors(newErrors)
    }

    // Update form validity only if it has changed
    const allFieldsTouched = Object.values(touchedFields).every(Boolean)
    const isValid = allFieldsValid && allFieldsTouched
    if (isValid !== isFormValid) {
      setIsFormValid(isValid)
    }
  }, [formState, touchedFields, validationFunctions, errors, isFormValid])

  const handleChange = (name: string, value: string) =>
    setFormState((prev) =>
      prev[name] !== value ? { ...prev, [name]: value } : prev,
    )

  const handleBlur = (name: string) =>
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
