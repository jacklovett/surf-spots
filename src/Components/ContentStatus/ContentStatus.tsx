interface IProps {
  content: JSX.Element | string
  isError?: boolean
}

export const ContentStatus = (props: IProps) => {
  const { content, isError = false } = props
  return (
    <div className="center column">
      <p className={`status-message ${isError ? 'error' : ''}`}>{content}</p>
    </div>
  )
}
