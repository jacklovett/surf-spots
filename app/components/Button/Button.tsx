import Icon from '../Icon'
import { ButtonIcon, ButtonType } from './index'

interface IProps {
  label: string
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  variant?: ButtonType
  ariaLabel?: string
  icon?: ButtonIcon
}

export const Button = (props: IProps) => {
  const {
    label,
    onClick,
    type = 'button',
    disabled = false,
    variant = 'primary',
    ariaLabel,
    icon,
  } = props

  return (
    <button
      className={`button ${variant}`}
      onClick={onClick}
      type={type}
      disabled={disabled}
      aria-label={ariaLabel || label}
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
      {label}
    </button>
  )
}
