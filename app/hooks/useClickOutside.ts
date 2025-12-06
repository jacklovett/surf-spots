import { RefObject, useEffect } from 'react'

/**
 * Hook that detects clicks outside of a referenced element and triggers a callback.
 * Useful for closing dropdowns, modals, date pickers, etc.
 *
 * @param ref - Reference to the container element to detect clicks outside of
 * @param onClickOutside - Callback function to execute when a click outside is detected
 * @param enabled - Whether the listener is active (default: true)
 */
export const useClickOutside = (
  ref: RefObject<HTMLElement | null>,
  onClickOutside: () => void,
  enabled: boolean = true,
) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickOutside()
      }
    }

    if (enabled) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [ref, onClickOutside, enabled])
}




