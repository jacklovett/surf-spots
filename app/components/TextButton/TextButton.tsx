import Icon from '../Icon'

interface IProps {
  onClick: () => void
  text: string
  iconKey?: 'plus' | 'bin' | 'heart'
}

export const TextButton = (props: IProps) => {
  const { iconKey, onClick, text } = props

  return (
    <button className="text-button" onClick={onClick}>
      {iconKey && (
        <span className="text-button-icon">
          <Icon iconKey={iconKey} />
        </span>
      )}
      <span className="text-button-text">{text}</span>
    </button>
  )
}
