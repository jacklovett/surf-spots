import { ReactNode } from 'react'
import Icon from '../Icon'

interface IProps {
  children: ReactNode
  isError?: boolean
}
export const ContentStatus = (props: IProps) => {
  const { children, isError = false } = props
  return (
    <div className="column content-status">
      <div className={`ph center column ${isError ? 'error' : ''}`}>
        {isError && <Icon iconKey="error" useAccentColor />}
        {children}
      </div>
    </div>
  )
}
