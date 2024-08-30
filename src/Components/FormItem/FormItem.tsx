import { ChangeEvent, FocusEvent } from 'react'
import { ValidationRules } from './index'

interface IProps {
  field: {
    label: string
    name: string
    type: 'text' | 'number' | 'textarea' | 'select'
    validationRules?: ValidationRules
    options?: { value: string | number; label: string }[] // For select fields
  }
  value?: string | number
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void
  onBlur: (
    e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void
  touchedFields: Set<string>
}

export const FormItem = (props: IProps) => {
  const { field, value, onChange, onBlur, touchedFields } = props
  const { label, name, type, validationRules, options } = field

  const showError = () => {
    if (!touchedFields.has(name) || !validationRules) return false

    const { required, minLength, maxLength, min, max } = validationRules

    if (required && !value) return true

    if (type === 'textarea' && typeof value === 'string') {
      if (
        (minLength !== undefined && value.length < minLength) ||
        (maxLength !== undefined && value.length > maxLength)
      )
        return true
    }

    if (type === 'number' && typeof value === 'number') {
      if (
        (min !== undefined && value < min) ||
        (max !== undefined && value > max)
      )
        return true
    }

    return false
  }

  return (
    <div className="form-item">
      <label htmlFor={name}>{label}</label>
      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value as string}
          onChange={onChange}
          onBlur={onBlur}
        />
      ) : type === 'select' ? (
        <select
          id={name}
          name={name}
          value={value as string}
          onChange={onChange}
          onBlur={onBlur}
        >
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          value={value as string | number}
          onChange={onChange}
          onBlur={onBlur}
        />
      )}
      {showError() && (
        <span className="form-error">
          {validationRules?.validationMessage || 'Invalid input'}
        </span>
      )}
    </div>
  )
}
