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
  } = props

  return (
    <button
      type="button"
      className="text-button"
      onClick={onClick}
      disabled={disabled}
    >
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
    </button>
  )
}
