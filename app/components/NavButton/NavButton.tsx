import { Link, useNavigation, useResolvedPath } from 'react-router'
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
}: NavButtonProps) => {
  const navigation = useNavigation()
  const resolvedTo = useResolvedPath(to)
  const isNavigatingToTarget =
    navigation.state === 'loading' &&
    navigation.location != null &&
    navigation.location.pathname === resolvedTo.pathname &&
    navigation.location.search === resolvedTo.search

  const labelText = ariaLabel || label

  return (
    <Link
      to={to}
      prefetch="intent"
      className={`button ${variant} ${isNavigatingToTarget ? 'loading' : ''}`.trim()}
      aria-label={labelText}
      aria-busy={isNavigatingToTarget}
    >
      <span className="button-content">
        {icon && <img src={icon.filePath} alt={icon.name} width="24" />}
        {label}
      </span>
      {isNavigatingToTarget && (
        <span className="button-loading-spinner" aria-hidden="true" />
      )}
    </Link>
  )
}
