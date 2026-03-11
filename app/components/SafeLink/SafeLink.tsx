import { ReactNode } from 'react'
import { safeLinkHref } from '~/utils/commonUtils'

interface SafeLinkProps {
  url?: string | null
  className?: string
  children: ReactNode
}

/**
 * Renders an external link when url is a safe http(s) URL; otherwise renders nothing.
 * Prevents javascript: or data: XSS from user/API-controlled URLs.
 */
export const SafeLink = ({ url, className, children }: SafeLinkProps) => {
  const href = safeLinkHref(url)
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    )
  }
  return null
}
