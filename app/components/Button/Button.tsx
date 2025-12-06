import { ReactNode } from 'react'
import Icon from '../Icon'
import { ButtonIcon, ButtonType, Size } from './index'

interface IProps {
  label?: string
  children?: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  variant?: ButtonType
  size?: Size
  className?: string
  ariaLabel?: string
  icon?: ButtonIcon
}

export const Button = (props: IProps) => {
  const {
    label,
    children,
    onClick,
    type = 'button',
    disabled = false,
    variant = 'primary',
    size = 'medium',
    className = '',
    ariaLabel,
    icon,
  } = props

  const displayText = label || children
  const ariaLabelText =
    ariaLabel || (typeof displayText === 'string' ? displayText : undefined)

  return (
    <button
      className={`button ${variant} ${size} ${className}`.trim()}
      onClick={onClick ? () => onClick() : undefined}
      type={type}
      disabled={disabled}
      aria-label={ariaLabelText}
      aria-disabled={disabled}
    >
      {icon &&
        (icon.filePath ? (
          <img src={icon.filePath} alt={icon.name} width="24" />
        ) : (
          <Icon
            iconKey={icon.name}
            useBrandColors={icon.name === 'facebook' || icon.name === 'google'}
          />
        ))}
      {displayText}
    </button>
  )
}
