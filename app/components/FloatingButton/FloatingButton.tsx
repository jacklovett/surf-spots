import classNames from 'classnames'
import Icon, { IconKey } from '../Icon'

interface FloatingButtonProps {
  onClick: () => void
  iconKey: IconKey
  ariaLabel: string
  badge?: number
  size?: 'medium' | 'large'
  className?: string
  loading?: boolean
  disabled?: boolean
}

export const FloatingButton = ({
  onClick,
  iconKey,
  ariaLabel,
  badge,
  size = 'large',
  className,
  loading = false,
  disabled = false,
}: FloatingButtonProps) => (
    <button
      type="button"
      className={classNames('floating-button', size, className, {
        loading,
      })}
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled || loading}
      aria-busy={loading}
    >
      {loading ? (
        <span className="floating-button-spinner" aria-hidden="true" />
      ) : (
        <span className="floating-button-icon">
          <Icon iconKey={iconKey} />
        </span>
      )}
      {badge && badge > 0 && <span className="floating-button-badge">{badge}</span>}
    </button>
  )