import { ReactNode } from 'react'

interface IProps {
  children: ReactNode
  isError?: boolean
}

// TODO: Is this needed? where is the styling?

export const ContentStatus = (props: IProps) => {
  const { children, isError = false } = props
  return (
    <div className="center column h-full">
      <div className={`ph ${isError ? 'error' : ''}`}>
        {/* TODO: Add some icon/image ? */}
        {children}
      </div>
    </div>
  )
}
