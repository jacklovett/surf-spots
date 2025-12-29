import { ReactNode } from 'react'
import Icon from '../Icon'
import { ButtonIcon, ButtonType, Size } from './index'

interface IProps {
  label?: string
  children?: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  form?: string
  disabled?: boolean
  loading?: boolean
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
    form,
    disabled = false,
    loading = false,
    variant = 'primary',
    size = 'medium',
    className = '',
    ariaLabel,
    icon,
  } = props

  const displayText = label || children
  const ariaLabelText =
    ariaLabel || (typeof displayText === 'string' ? displayText : undefined)
  const isDisabled = disabled || loading

  return (
    <button
      className={`button ${variant} ${size} ${loading ? 'loading' : ''} ${className}`.trim()}
      onClick={onClick ? () => onClick() : undefined}
      type={type}
      form={form}
      disabled={isDisabled}
      aria-label={ariaLabelText}
      aria-disabled={isDisabled}
      aria-busy={loading}
    >
      <span className="button-content">
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
      </span>
      {loading && (
        <span className="button-loading-spinner" aria-hidden="true" />
      )}
    </button>
  )
}
