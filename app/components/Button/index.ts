import { Button } from './Button'
import { IconKey } from '../Icon'

export type ButtonType = 'primary' | 'secondary' | 'cancel' | 'danger' | 'icon'

export type Size = 'small' | 'medium' | 'large'

export interface ButtonIcon {
  name: IconKey
  filePath?: string
}

export default Button
