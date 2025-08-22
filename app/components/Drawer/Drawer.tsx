import { useEffect, useRef, useState } from 'react'
import classNames from 'classnames'

import { useLayoutContext } from '~/contexts'

export const Drawer = () => {
  const { drawer, closeDrawer } = useLayoutContext()
  const { isOpen, position, content, title } = drawer
  const drawerRef = useRef<HTMLDivElement>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

  // Handle escape key to close drawer
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        closeDrawer()
      }
    }

    if (isOpen) {
      setShouldRender(true)
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden'
      // Trigger animation after a brief delay to ensure DOM is ready
      setTimeout(() => setIsAnimating(true), 10)
    } else {
      // Start close animation
      setIsAnimating(false)
      // Remove from DOM after animation completes
      setTimeout(() => setShouldRender(false), 300)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, closeDrawer])

  // Handle click outside to close drawer
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      closeDrawer()
    }
  }

  if (!shouldRender || !content) {
    return null
  }

  return (
    <div className="drawer-backdrop" onClick={handleBackdropClick}>
      <div
        ref={drawerRef}
        className={classNames('drawer', {
          [`drawer--${position}`]: true,
          'drawer--open': isAnimating,
        })}
      >
        <div className="drawer-header">
          {title && <div className="drawer-title">{title}</div>}
          <button onClick={closeDrawer}>✕</button>
        </div>
        <div className="drawer-content">{content}</div>
      </div>
    </div>
  )
}
