import { ChangeEvent, FocusEvent } from 'react'
import { FormField, inputElementType } from './index'

interface IProps {
  field: FormField
  value?: string | number
  onChange: (e: ChangeEvent<inputElementType>) => void
  onBlur?: (e: FocusEvent<inputElementType>) => void
  touched?: boolean
  errorMessage?: string
}

export const FormInput = (props: IProps) => {
  const { field, value, onChange, onBlur, touched, errorMessage } = props
  const { label, name, type, options } = field

  return (
    <div className="form-item">
      {type === 'select' && <label htmlFor={name}>{label}</label>}
      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value as string}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={label}
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
          placeholder={label}
        />
      )}
      {errorMessage && <span className="form-error">{errorMessage}</span>}
    </div>
  )
}
