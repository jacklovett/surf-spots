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
  } = props
  const { label, name, type, options } = field

  return (
    <div
      className={classNames({
        'form-item': true,
        error: !!errorMessage,
      })}
    >
      <label className={showLabel ? 'visible' : ''}>{label}</label>
      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value as string}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={label}
          disabled={disabled}
          aria-disabled={disabled}
          readOnly={readOnly}
        />
      ) : type === 'select' ? (
        <select
          id={name}
          name={name}
          value={value as string}
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
          value={value as string | number}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={label}
          disabled={disabled}
          aria-disabled={disabled}
          readOnly={readOnly}
        />
      )}
      {errorMessage && <span className="form-error">{errorMessage}</span>}
    </div>
  )
}
