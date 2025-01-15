import { Button } from './Button'

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
  name: string
  filePath: string
}

export default Button
