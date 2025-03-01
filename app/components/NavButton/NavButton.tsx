import { Link } from 'react-router';
import { ButtonIcon, ButtonType } from '../Button'

interface NavButtonProps {
  to: string
  icon?: ButtonIcon
  label: string
  variant?: ButtonType
  ariaLabel?: string
}

export const NavButton = ({
  to,
  icon,
  label,
  variant,
  ariaLabel,
}: NavButtonProps) => (
  <Link
    to={to}
    prefetch="intent"
    className={`button ${variant}`}
    aria-label={ariaLabel || label}
  >
    {icon && <img src={icon.filePath} alt={icon.name} width="24" />}
    {label}
  </Link>
)
