import { useEffect, useRef, useState } from 'react'
import classNames from 'classnames'

import { useLayoutContext } from '~/contexts'

interface TouchState {
  startX: number
  startY: number
  startTime: number
}

export const Drawer = () => {
  const { drawer, closeDrawer } = useLayoutContext()
  const { isOpen, position, content, title } = drawer
  const drawerRef = useRef<HTMLDivElement>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const [touchState, setTouchState] = useState<TouchState | null>(null)
  const [translateX, setTranslateX] = useState(0)

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
      // Prevent body scroll when drawer is open while maintaining scrollbar space
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollbarWidth}px`
      // First render the drawer in its initial position
      requestAnimationFrame(() => {
        // Then trigger the open animation in the next frame
        setTranslateX(0)
        setIsAnimating(true)
      })
    } else {
      // Start close animation
      setIsAnimating(false)
      // Remove from DOM after animation completes
      setTimeout(() => {
        setShouldRender(false)
        setTranslateX(0)
      }, 300)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
      document.body.style.paddingRight = 'unset'
      setTranslateX(0)
    }
  }, [isOpen, closeDrawer])

  // Handle touch events for swipe-to-close
  const handleTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0]
    setTouchState({
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
    })
  }

  const handleTouchMove = (event: React.TouchEvent) => {
    if (!touchState || !isOpen) return

    const touch = event.touches[0]
    const deltaX = touch.clientX - touchState.startX
    const deltaY = touch.clientY - touchState.startY

    // Only handle horizontal swipes (ignore if more vertical than horizontal)
    if (Math.abs(deltaY) > Math.abs(deltaX)) return

    // For left drawer: allow only leftward swipes (negative deltaX)
    // For right drawer: allow only rightward swipes (positive deltaX)
    if (
      (position === 'left' && deltaX < 0) ||
      (position === 'right' && deltaX > 0)
    ) {
      setTranslateX(deltaX)
      event.preventDefault()
    }
  }

  const handleTouchEnd = () => {
    if (!touchState) return

    const deltaTime = Date.now() - touchState.startTime
    const velocity = Math.abs(translateX) / deltaTime

    // For left drawer: swipe left (negative translateX)
    // For right drawer: swipe right (positive translateX)
    const shouldClose =
      position === 'left'
        ? -translateX > window.innerWidth * 0.4 ||
          (velocity > 0.5 && translateX < 0)
        : translateX > window.innerWidth * 0.4 ||
          (velocity > 0.5 && translateX > 0)

    if (shouldClose) {
      closeDrawer()
    } else {
      // Reset position if not enough to close
      setTranslateX(0)
    }

    setTouchState(null)
  }

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
          'drawer--open': isAnimating && !translateX,
        })}
        style={{
          transform: translateX
            ? `translateX(${position === 'left' ? translateX : translateX + (position === 'right' ? window.innerWidth : 0)}px)`
            : undefined,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
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
