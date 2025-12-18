import classNames from 'classnames'
import Icon, { IconKey } from '../Icon'

interface FloatingButtonProps {
  onClick: () => void
  iconKey: IconKey
  ariaLabel: string
  badge?: number
  size?: 'medium' | 'large'
  className?: string
}

export const FloatingButton = ({
  onClick,
  iconKey,
  ariaLabel,
  badge,
  size = 'large',
  className,
}: FloatingButtonProps) => (
    <button
      type="button"
      className={classNames('floating-button', size, className)}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <span className="floating-button-icon">
        <Icon iconKey={iconKey} />
      </span>
      {badge && badge > 0 && <span className="floating-button-badge">{badge}</span>}
    </button>
  )
