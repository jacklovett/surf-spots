interface IProps {
  onClick: () => void
  label: string
}

export const Button = (props: IProps): JSX.Element => {
  const { onClick, label } = props

  return (
    <button onClick={onClick} aria-label={label}>
      {label}
    </button>
  )
}
