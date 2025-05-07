import classNames from 'classnames'
import Icon, { IconKey } from '../Icon'

interface IProps {
  onClick: () => void
  text: string
  iconKey?: IconKey
  filled?: boolean
  disabled?: boolean
}

export const TextButton = (props: IProps) => {
  const { disabled, filled = false, iconKey, onClick, text } = props

  return (
    <button
      type="button"
      className="text-button"
      onClick={onClick}
      disabled={disabled}
    >
      {iconKey && (
        <span className={classNames({ 'text-button-icon': true, filled })}>
          <Icon iconKey={iconKey} useAccentColor />
        </span>
      )}
      <span className="text-button-text">{text}</span>
    </button>
  )
}
