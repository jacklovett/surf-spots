import { ButtonIcon } from './index'

interface IProps {
  label: string
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'alternate' | 'icon'
  ariaLabel?: string
  icon?: ButtonIcon
}

// TODO: Make NavButton component ?? Link prefetch="intent"

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
      aria-label={ariaLabel || label} // Fallback to label if ariaLabel is not provided
      aria-disabled={disabled}
    >
      {icon && <img src={icon.filePath} alt={icon.name} width="24" />}
      {label}
    </button>
  )
}
