import { useEffect, useRef, RefObject } from 'react'

interface UseScrollRevealOptions {
  /**
   * The root margin for the Intersection Observer.
   * Default: '0px 0px -50px 0px' (triggers when element is 50px from bottom of viewport)
   */
  rootMargin?: string
  /**
   * The threshold for triggering the animation.
   * Default: 0.05 (5% of element must be visible)
   */
  threshold?: number
  /**
   * Whether to trigger the animation only once.
   * Default: true
   */
  once?: boolean
  /**
   * CSS selector for child elements to animate.
   * Default: '.animate-on-scroll'
   */
  selector?: string
}

/**
 * Custom hook that adds a 'visible' class to elements when they scroll into view.
 * Uses Intersection Observer API to detect when elements enter the viewport.
 *
 * Attach the ref to a container element, and add the 'animate-on-scroll' class
 * to any child elements you want to animate when they scroll into view.
 *
 * @param options - Configuration options for the Intersection Observer
 * @returns A ref that should be attached to the container element
 *
 * @example
 * ```tsx
 * const containerRef = useScrollReveal()
 *
 * return (
 *   <div ref={containerRef}>
 *     <div className="animate-on-scroll">Card 1</div>
 *     <div className="animate-on-scroll">Card 2</div>
 *   </div>
 * )
 * ```
 */
export const useScrollReveal = <T extends HTMLElement = HTMLDivElement>(
  options: UseScrollRevealOptions = {},
): RefObject<T> => {
  const {
    rootMargin = '0px 0px -50px 0px',
    threshold = 0.05,
    once = true,
    selector = '.animate-on-scroll',
  } = options

  const containerRef = useRef<T>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Find all child elements with the selector
    const children = container.querySelectorAll<HTMLElement>(selector)

    // Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback: add visible class to all matching children immediately
      children.forEach((child) => child.classList.add('visible'))
      return
    }

    // IntersectionObserver watches elements and calls a callback when they enter/leave the viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')

            // If 'once' is true, stop watching this element after first trigger
            if (once) {
              observer.unobserve(entry.target)
            }
          } else if (!once) {
            // If 'once' is false, remove visible class when element leaves viewport
            entry.target.classList.remove('visible')
          }
        })
      },
      {
        rootMargin,
        threshold,
      },
    )

    // Check if elements are already in viewport on mount
    children.forEach((child) => {
      const rect = child.getBoundingClientRect()
      const isInViewport =
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <=
          (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <=
          (window.innerWidth || document.documentElement.clientWidth)

      if (isInViewport) {
        // Element is already visible, add visible class immediately
        child.classList.add('visible')
        if (once) {
          // Don't observe if once is true
          return
        }
      }

      // Start watching the element
      observer.observe(child)
    })

    // Cleanup: stop watching all elements when component unmounts or dependencies change
    return () => observer.disconnect()
  }, [rootMargin, threshold, once, selector])

  return containerRef
}
