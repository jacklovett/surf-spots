import classNames from 'classnames'
import Icon, { IconKey } from '../Icon'

interface IProps {
  onClick: () => void
  text: string
  iconKey?: IconKey
  filled?: boolean
}

export const TextButton = (props: IProps) => {
  const { filled = false, iconKey, onClick, text } = props

  return (
    <button className="text-button" onClick={onClick}>
      {iconKey && (
        <span
          className={classNames({ 'text-button-icon': true, filled: filled })}
        >
          <Icon iconKey={iconKey} />
        </span>
      )}
      <span className="text-button-text">{text}</span>
    </button>
  )
}
