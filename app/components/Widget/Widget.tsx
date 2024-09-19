interface IProps {
  title: string
  value: number | string
}

export const Widget = (props: IProps) => {
  const { title, value } = props
  return (
    <div className="card widget">
      <div className="center column">
        <h3 className="title">{title}</h3>
        <p className="value">{value}</p>
      </div>
    </div>
  )
}
