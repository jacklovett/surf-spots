import { HTMLInputTypeAttribute } from 'react'
import { FormInput } from './FormInput'

export type inputElementType =
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

export interface FormField {
  label: string
  name: string
  type: FormInputType
  validationRules?: ValidationRules
  options?: { value: string | number; label: string }[]
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
