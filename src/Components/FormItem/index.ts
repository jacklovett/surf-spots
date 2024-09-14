import { HTMLInputTypeAttribute } from 'react'
import { FormItem } from './FormItem'

export type FormItemType = 'text' | 'number' | 'textarea' | 'select'

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

export default FormItem
