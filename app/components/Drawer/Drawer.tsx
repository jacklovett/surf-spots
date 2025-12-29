import { CSSProperties, useEffect, useRef, useState } from 'react'
import classNames from 'classnames'

import { useLayoutContext } from '~/contexts'

interface TouchState {
  startX: number
  startY: number
  startTime: number
}

export const Drawer = () => {
  const { drawer, closeDrawer } = useLayoutContext()
  const { isOpen, position, content, title, actions } = drawer
  const drawerRef = useRef<HTMLDivElement>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

  const [translateX, setTranslateX] = useState(0)
  const translateXRef = useRef(0)

  const [isSwiping, setIsSwiping] = useState(false)
  const isSwipingRef = useRef(false)

  const touchStateRef = useRef<TouchState | null>(null)

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
        // Reset swiping state to ensure clean animation
        setIsSwiping(false)
        isSwipingRef.current = false
        // Reset translateX only if it's not already 0 to avoid unnecessary re-renders
        if (translateX !== 0) {
          setTranslateX(0)
          translateXRef.current = 0
        }
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
      // Reset swiping state
      setIsSwiping(false)
      isSwipingRef.current = false
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
    if (!drawerElement || !isOpen || !isAnimating) return

    const headerElement = drawerElement.querySelector(
      '.drawer-header',
    ) as HTMLElement
    const contentElement = drawerElement.querySelector(
      '.drawer-content',
    ) as HTMLElement
    if (!headerElement) return

    let touchTarget: HTMLElement | null = null

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0]
      touchTarget = event.target as HTMLElement

      touchStateRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now(),
      }
      isSwipingRef.current = false
      setIsSwiping(false)
    }

    const handleTouchMove = (event: TouchEvent) => {
      if (!touchStateRef.current) return

      const touch = event.touches[0]
      const deltaX = touch.clientX - touchStateRef.current.startX
      const deltaY = touch.clientY - touchStateRef.current.startY
      const absDeltaX = Math.abs(deltaX)
      const absDeltaY = Math.abs(deltaY)

      // Check if touch started in header
      const isHeaderTouch =
        touchTarget &&
        (headerElement.contains(touchTarget) || touchTarget === headerElement)

      // Check if content is at top
      const isContentAtTop = !contentElement || contentElement.scrollTop === 0

      // Determine if this is a horizontal swipe gesture
      const isHorizontalSwipe = absDeltaX > absDeltaY && absDeltaX > 10

      // Allow swipe if:
      // 1. Touch started in header, OR
      // 2. Content is at top and this is a horizontal swipe
      if ((isHeaderTouch || isContentAtTop) && isHorizontalSwipe) {
        // For left drawer: swipe left (negative deltaX) to close
        // For right drawer: swipe right (positive deltaX) to close
        const isClosingDirection =
          (position === 'left' && deltaX < 0) ||
          (position === 'right' && deltaX > 0)

        if (isClosingDirection) {
          isSwipingRef.current = true
          setIsSwiping(true)
          // Clamp the translation
          const maxTranslate =
            position === 'left'
              ? -drawerElement.offsetWidth
              : drawerElement.offsetWidth
          const clampedDeltaX =
            position === 'left'
              ? Math.max(deltaX, maxTranslate)
              : Math.min(deltaX, maxTranslate)

          translateXRef.current = clampedDeltaX
          setTranslateX(clampedDeltaX)
          event.preventDefault()
        }
      }
    }

    const handleTouchEnd = () => {
      if (!touchStateRef.current) {
        return
      }

      const currentTranslateX = translateXRef.current
      const threshold = 100 // pixels
      const shouldClose =
        isSwipingRef.current &&
        ((position === 'left' && currentTranslateX < -threshold) ||
          (position === 'right' && currentTranslateX > threshold))

      if (shouldClose) {
        closeDrawer()
      } else {
        // Snap back to open position
        translateXRef.current = 0
        setTranslateX(0)
      }

      touchStateRef.current = null
      touchTarget = null
      isSwipingRef.current = false
      setIsSwiping(false)
    }

    // Attach listeners to entire drawer element
    drawerElement.addEventListener('touchstart', handleTouchStart, {
      passive: true,
    })
    drawerElement.addEventListener('touchmove', handleTouchMove, {
      passive: false,
    })
    drawerElement.addEventListener('touchend', handleTouchEnd, {
      passive: true,
    })
    drawerElement.addEventListener('touchcancel', handleTouchEnd, {
      passive: true,
    })

    return () => {
      drawerElement.removeEventListener('touchstart', handleTouchStart)
      drawerElement.removeEventListener('touchmove', handleTouchMove)
      drawerElement.removeEventListener('touchend', handleTouchEnd)
      drawerElement.removeEventListener('touchcancel', handleTouchEnd)
      // Reset on cleanup
      translateXRef.current = 0
      setTranslateX(0)
      isSwipingRef.current = false
      setIsSwiping(false)
    }
  }, [isOpen, isAnimating, position, closeDrawer])

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
          'drawer--swiping': isSwiping && translateX !== 0,
        })}
        style={
          isSwiping && translateX !== 0 && isAnimating
            ? ({ '--drawer-translate-x': `${translateX}px` } as CSSProperties)
            : undefined
        }
      >
        <div className="drawer-header">
          {title && <div className="drawer-title bold">{title}</div>}
          {actions && <div className="drawer-actions">{actions}</div>}
          <button className="drawer-close-button" onClick={closeDrawer}>
            ✕
          </button>
        </div>
        <div className="drawer-content">{content}</div>
      </div>
    </div>
  )
}
