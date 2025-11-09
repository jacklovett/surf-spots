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
  const touchStateRef = useRef<TouchState | null>(null)
  const translateXRef = useRef(0)

  // Handle escape key to close drawer
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        closeDrawer()
      }
    }

    if (isOpen) {
      // Only set shouldRender if not already rendered to prevent re-animation
      if (!shouldRender) {
        setShouldRender(true)
        // Reset translateX to ensure clean animation
        setTranslateX(0)
        translateXRef.current = 0
        // Start with drawer off-screen, then animate in
        setIsAnimating(false)
        // Use double RAF to ensure the drawer renders off-screen first
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // Then trigger the open animation
            setIsAnimating(true)
          })
        })
      }
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when drawer is open while maintaining scrollbar space
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollbarWidth}px`
      // Add class to body to disable pointer events on floating buttons
      document.body.classList.add('drawer-open')
    } else {
      // Start close animation
      setIsAnimating(false)
      // Remove drawer-open class from body
      document.body.classList.remove('drawer-open')
      // Remove from DOM after animation completes
      setTimeout(() => {
        setShouldRender(false)
        setTranslateX(0)
        translateXRef.current = 0
      }, 300)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
      document.body.style.paddingRight = 'unset'
      setTranslateX(0)
    }
  }, [isOpen, closeDrawer, shouldRender])

  // Handle touch events for swipe-to-close
  useEffect(() => {
    const drawerElement = drawerRef.current
    if (!drawerElement || !isOpen) return

    const headerElement = drawerElement.querySelector(
      '.drawer-header',
    ) as HTMLElement
    if (!headerElement) return

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0]
      touchStateRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now(),
      }
    }

    const handleTouchMove = (event: TouchEvent) => {
      if (!touchStateRef.current) return

      const touch = event.touches[0]
      const deltaX = touch.clientX - touchStateRef.current.startX
      const deltaY = touch.clientY - touchStateRef.current.startY

      // Only handle if horizontal movement is greater than vertical
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // For left drawer: swipe left (negative deltaX)
        // For right drawer: swipe right (positive deltaX)
        if (
          (position === 'left' && deltaX < 0) ||
          (position === 'right' && deltaX > 0)
        ) {
          translateXRef.current = deltaX
          setTranslateX(deltaX)
          event.preventDefault()
          event.stopPropagation()
        }
      }
    }

    const handleTouchEnd = () => {
      if (!touchStateRef.current) return

      const translateX = translateXRef.current
      const shouldClose =
        (position === 'left' && translateX < -100) ||
        (position === 'right' && translateX > 100)

      if (shouldClose) {
        closeDrawer()
      } else {
        translateXRef.current = 0
        setTranslateX(0)
      }

      touchStateRef.current = null
    }

    // Attach listeners to header (non-scrollable) to ensure touches are captured
    headerElement.addEventListener('touchstart', handleTouchStart)
    headerElement.addEventListener('touchmove', handleTouchMove, {
      passive: false,
    })
    headerElement.addEventListener('touchend', handleTouchEnd)

    // Also attach to drawer element itself
    drawerElement.addEventListener('touchstart', handleTouchStart)
    drawerElement.addEventListener('touchmove', handleTouchMove, {
      passive: false,
    })
    drawerElement.addEventListener('touchend', handleTouchEnd)

    return () => {
      headerElement.removeEventListener('touchstart', handleTouchStart)
      headerElement.removeEventListener('touchmove', handleTouchMove)
      headerElement.removeEventListener('touchend', handleTouchEnd)
      drawerElement.removeEventListener('touchstart', handleTouchStart)
      drawerElement.removeEventListener('touchmove', handleTouchMove)
      drawerElement.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isOpen, position, closeDrawer])

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
        style={{
          transform:
            translateX !== 0
              ? `translateX(${position === 'left' ? translateX : translateX + (position === 'right' ? window.innerWidth : 0)}px)`
              : undefined,
        }}
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
