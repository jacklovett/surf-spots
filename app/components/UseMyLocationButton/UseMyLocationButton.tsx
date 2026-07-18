import classNames from 'classnames'

import Icon from '../Icon'
import type { IconKey } from '../Icon'

interface UseMyLocationButtonProps {
  onClick: () => void
  disabled?: boolean
  isRequesting?: boolean
  label?: string
  iconKey?: IconKey
}

export const UseMyLocationButton = (props: UseMyLocationButtonProps) => {
  const {
    onClick,
    disabled = false,
    isRequesting = false,
    label = 'Use my location',
    iconKey = 'crosshair',
  } = props

  return (
    <div className="find-by-location">
      <button
        type="button"
        className={classNames('text-button', 'use-my-location-button', {
          'use-my-location-button-requesting': isRequesting,
        })}
        onClick={onClick}
        disabled={disabled || isRequesting}
        aria-busy={isRequesting}
        aria-label={isRequesting ? `${label} - Processing` : label}
      >
        <span className="text-button-content">
          <span
            className={classNames('text-button-icon', {
              filled: !isRequesting,
            })}
            aria-hidden="true"
          >
            {isRequesting ? (
              <span className="button-loading-spinner use-my-location-spinner" />
            ) : (
              <Icon iconKey={iconKey} useCurrentColor />
            )}
          </span>
          <span className="text-button-text">{label}</span>
        </span>
      </button>
    </div>
  )
}

export default UseMyLocationButton
