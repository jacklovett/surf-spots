interface IProps {
  label: string
  value: string
}

export const Details = (props: IProps) => {
  const { label, value } = props
  return (
    <div className="details">
      <p className="label">{`${label}:`}</p>
      <p>{value}</p>
    </div>
  )
}
