import { ReactNode } from 'react'

import Icon from '../Icon'

interface IProps {
  children: ReactNode
  isError?: boolean
  actions?: ReactNode
}

/**
 * Generic status shell for empty / loading / error content.
 * Does not own recovery policy — callers compose actions when needed.
 */
export const ContentStatus = (props: IProps) => {
  const { children, isError = false, actions } = props

  return (
    <div className="column content-status">
      <div className={`ph center column ${isError ? 'error' : ''}`}>
        {isError && <Icon iconKey="error" useAccentColor />}
        {children}
        {actions}
      </div>
    </div>
  )
}
