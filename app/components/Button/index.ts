import { Button } from './Button'
import { IconKey } from '../Icon'

export type ButtonType =
  | 'primary'
  | 'secondary'
  | 'alternate'
  | 'danger'
  | 'warning'
  | 'success'
  | 'info'
  | 'light'
  | 'dark'
  | 'link'
  | 'icon'

export interface ButtonIcon {
  name: IconKey
  filePath?: string
}

export default Button
