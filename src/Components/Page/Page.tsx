import { ReactNode } from 'react'

interface IProps {
  title: string
  content: ReactNode
}

export const Page = (props: IProps) => {
  const { title, content } = props
  return (
    <div className="page">
      <header className="header">
        <h1>{title}</h1>
      </header>
      <div className="column content-container">{content}</div>
      <footer className="footer">© 2024 Surf Spots</footer>
    </div>
  )
}
