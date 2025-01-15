import Icon from '../Icon'

interface IProps {
  message: string
}

export const InfoMessage = ({ message }: IProps) => {
  return (
    <div className="info-message">
      <div className="info-icon">
        <Icon iconKey="info" />
      </div>
      <div className="info-content">{message}</div>
    </div>
  )
}
