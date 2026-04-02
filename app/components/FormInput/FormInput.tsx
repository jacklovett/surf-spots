import { ChangeEvent, FocusEvent } from 'react'
import classNames from 'classnames'
import { FormField, InputElementType } from './index'

interface IProps {
  field: FormField
  value?: string | number
  onChange: (e: ChangeEvent<InputElementType>) => void
  onBlur?: (e: FocusEvent<InputElementType>) => void
  errorMessage?: string
  disabled?: boolean
  showLabel?: boolean
  readOnly?: boolean
  placeholder?: string
  /** When true, appends a visual " *" to the label for required fields */
  required?: boolean
}

export const FormInput = (props: IProps) => {
  const {
    field,
    value,
    onChange,
    onBlur,
    errorMessage,
    disabled,
    showLabel,
    readOnly,
    placeholder,
    required,
  } = props
  const { label, name, type, options } = field

  // Keep inputs controlled for the full component lifetime.
  // Some parent components intentionally clear numeric fields by setting the value to `undefined`.
  // React treats `value={undefined}` as uncontrolled and warns, so we normalize to an empty string.
  const safeValue = value ?? ''

  const inputPlaceholder =
    placeholder ?? (required ? `${label}*` : label)

  return (
    <div
      className={classNames({
        'form-item': true,
        error: !!errorMessage,
      })}
    >
      <label className={showLabel ? 'visible' : ''}>
        {label}
        {required && (
          <span className="form-label-required" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={safeValue as string}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={inputPlaceholder}
          disabled={disabled}
          aria-disabled={disabled}
          readOnly={readOnly}
          maxLength={field.validationRules?.maxLength}
        />
      ) : type === 'select' ? (
        <select
          id={name}
          name={name}
          value={safeValue as string}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled || readOnly}
          aria-disabled={disabled || readOnly}
        >
          {options?.map((option) => (
            <option key={option.key} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          value={safeValue as string | number}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={inputPlaceholder}
          disabled={disabled}
          aria-disabled={disabled}
          readOnly={readOnly}
          min={type === 'number' && field.validationRules?.min !== undefined ? field.validationRules.min : type === 'number' ? 0 : undefined}
          max={type === 'number' && field.validationRules?.max !== undefined ? field.validationRules.max : undefined}
        />
      )}
      {errorMessage && <span className="form-error">{errorMessage}</span>}
    </div>
  )
}
