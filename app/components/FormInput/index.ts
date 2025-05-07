import { HTMLInputTypeAttribute } from 'react'
import { FormInput } from './FormInput'

export type InputElementType =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement

export type FormInputType =
  | 'text'
  | 'number'
  | 'textarea'
  | 'select'
  | 'email'
  | 'password'
  | 'url'

export interface SelectOption {
  key: string
  value: string | number
  label: string
}

export interface FormField {
  label: string
  name: string
  type: FormInputType
  validationRules?: ValidationRules
  options?: SelectOption[]
}

export interface ValidationRules {
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  step?: number
  validationMessage?: string
}

export interface Option {
  key: string
  value: string
  label: string
}

export interface FormFieldConfig {
  label: string
  name: string
  type: HTMLInputTypeAttribute
  validationRules?: ValidationRules
  options?: Option[]
}

export interface FormData {
  [key: string]: string | number
}

export default FormInput
