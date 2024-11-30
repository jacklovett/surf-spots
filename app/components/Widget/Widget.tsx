interface IProps {
  title: string
  value: number | string
}

export const Widget = (props: IProps) => {
  const { title, value } = props
  return (
    <div className="widget">
      <div className="center column">
        <p className="title">{title}</p>
        <p className="value">{value}</p>
      </div>
    </div>
  )
}
