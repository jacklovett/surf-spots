/**
 * Common utility functions used across the application
 */

/**
 * Debounce function to control excessive resize events
 * @param action - function to be performed
 * @param delay - length of time to delay function call
 * @returns void - performs given action
 */
export const debounce = (action: (...args: any[]) => void, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: any[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => action(...args), delay)
  }
}

/**
 * Gets a CSS variable value from the document
 * @param variable - CSS variable name (e.g., '--primary-color')
 * @returns CSS variable value or default
 */
export const getCssVariable = (variable: string) => {
  if (typeof window === 'undefined' || !document.body) {
    // Return defaults during SSR
    return variable === '--primary-color' ? '#046380' : '#20c6f8'
  }
  return getComputedStyle(document.body).getPropertyValue(variable)
}
