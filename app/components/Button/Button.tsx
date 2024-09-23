interface IProps {
  label: string
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'alternate'
  ariaLabel?: string // Optional: Only use if additional context is needed
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
      {label}
    </button>
  )
}