import classNames from 'classnames'
import Icon, { IconKey } from '../Icon'

interface IProps {
  onClick: () => void
  text: string
  iconKey?: IconKey
  filled?: boolean
  disabled?: boolean
  badge?: number
  danger?: boolean
  loading?: boolean
}

export const TextButton = (props: IProps) => {
  const {
    disabled,
    filled = false,
    iconKey,
    onClick,
    text,
    badge,
    danger = false,
    loading = false,
  } = props

  const isDisabled = disabled || loading

  return (
    <button
      type="button"
      className={classNames('text-button', { filled, loading })}
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={loading}
      aria-label={loading ? `${text} - Processing` : text}
    >
      <span className="text-button-content">
        {iconKey && (
          <span
            className={classNames({
              'text-button-icon': true,
              filled,
              danger,
              'icon-chevron-left': iconKey === 'chevron-left',
            })}
          >
            <Icon iconKey={iconKey} />
          </span>
        )}
        <span className="text-button-text">{text}</span>
        {badge && <span className="text-button-badge">{badge}</span>}
      </span>
      {loading && (
        <span className="button-loading-spinner" aria-hidden="true" />
      )}
    </button>
  )
}
