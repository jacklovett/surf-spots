import { useEffect, RefObject } from 'react'

interface UseResizeObserverOptions {
    /**
     * Delay in milliseconds before calling the callback after resize
     * Useful for debouncing rapid resize events
     */
    delay?: number
    /**
     * Whether the observer is enabled
     */
    enabled?: boolean
    /**
     * Trigger callback immediately when observer is set up (useful for initial sizing)
     */
    triggerOnMount?: boolean
    /**
     * Delay in milliseconds before triggering initial callback (if triggerOnMount is true)
     */
    initialDelay?: number
}

/**
 * Hook to observe element resize using ResizeObserver
 * Calls the callback when the observed element's size changes
 *
 * @param elementRef - Ref to the element to observe
 * @param callback - Callback function to call when element is resized
 * @param options - Optional configuration
 */
export const useResizeObserver = <T extends HTMLElement = HTMLElement>(
    elementRef: RefObject<T>,
    callback: () => void,
    options: UseResizeObserverOptions = {},
) => {
    const { delay = 0, enabled = true, triggerOnMount = false, initialDelay = 0 } = options

    useEffect(() => {
        if (!enabled || !elementRef.current) return

        const element = elementRef.current

        const handleResize = () => {
            if (delay > 0) {
                setTimeout(() =>
                    callback(), delay)
            } else {
                callback()
            }
        }

        const resizeObserver = new ResizeObserver(handleResize)
        resizeObserver.observe(element)

        // Trigger initial callback if requested (useful when element becomes visible)
        if (triggerOnMount) {
            const timeoutId = setTimeout(() =>
                callback()
                , initialDelay)

            return () => {
                resizeObserver.disconnect()
                clearTimeout(timeoutId)
            }
        }

        return () => resizeObserver.disconnect()
    }, [elementRef, callback, delay, enabled, triggerOnMount, initialDelay])
}
