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
      setShouldRender(true)
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when drawer is open while maintaining scrollbar space
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollbarWidth}px`
      // Start with drawer off-screen, then animate in
      setIsAnimating(false)
      // Use double RAF to ensure the drawer renders off-screen first
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Then trigger the open animation
          setIsAnimating(true)
        })
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

  // Handle touch events for swipe-to-close using native listeners to avoid passive event issues
  useEffect(() => {
    const drawerElement = drawerRef.current
    if (!drawerElement || !isOpen) return

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0]
      const state = {
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now(),
      }
      touchStateRef.current = state
      setTouchState(state)
    }

    const handleTouchMove = (event: TouchEvent) => {
      const currentTouchState = touchStateRef.current
      if (!currentTouchState || !isOpen) return

      const touch = event.touches[0]
      const deltaX = touch.clientX - currentTouchState.startX
      const deltaY = touch.clientY - currentTouchState.startY

      // Only handle horizontal swipes (ignore if more vertical than horizontal)
      if (Math.abs(deltaY) > Math.abs(deltaX)) return

      // For left drawer: allow only leftward swipes (negative deltaX)
      // For right drawer: allow only rightward swipes (positive deltaX)
      if (
        (position === 'left' && deltaX < 0) ||
        (position === 'right' && deltaX > 0)
      ) {
        translateXRef.current = deltaX
        setTranslateX(deltaX)
        event.preventDefault()
      }
    }

    const handleTouchEnd = () => {
      const currentTouchState = touchStateRef.current
      const currentTranslateX = translateXRef.current
      if (!currentTouchState) return

      const deltaTime = Date.now() - currentTouchState.startTime
      const velocity = Math.abs(currentTranslateX) / deltaTime

      // For left drawer: swipe left (negative translateX)
      // For right drawer: swipe right (positive translateX)
      const shouldClose =
        position === 'left'
          ? -currentTranslateX > window.innerWidth * 0.4 ||
            (velocity > 0.5 && currentTranslateX < 0)
          : currentTranslateX > window.innerWidth * 0.4 ||
            (velocity > 0.5 && currentTranslateX > 0)

      if (shouldClose) {
        closeDrawer()
      } else {
        // Reset position if not enough to close
        translateXRef.current = 0
        setTranslateX(0)
      }

      touchStateRef.current = null
      setTouchState(null)
    }

    // Use native listeners with passive: false to allow preventDefault
    drawerElement.addEventListener('touchstart', handleTouchStart, {
      passive: true,
    })
    drawerElement.addEventListener('touchmove', handleTouchMove, {
      passive: false,
    })
    drawerElement.addEventListener('touchend', handleTouchEnd, {
      passive: true,
    })

    return () => {
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
          transform: translateX
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
