import { ReactNode } from 'react'

interface IProps {
  children: ReactNode
  isError?: boolean
}

export const ContentStatus = (props: IProps) => {
  const { children, isError = false } = props
  return (
    <div className="center column">
      <div className={`status-message ${isError ? 'error' : ''}`}>
        {children}
      </div>
    </div>
  )
}
