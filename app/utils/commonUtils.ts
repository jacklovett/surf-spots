/**
 * Common utility functions used across the application
 */

/** Max length for URLs passed to safeLinkHref; shared with surf spot validation. */
export const MAX_SAFE_URL_LENGTH = 2048

const ALLOWED_SCHEMES = ['https:', 'http:']

/**
 * Returns a safe href for use in <a> tags, or null if the URL is not allowed.
 * Only https and http schemes are allowed to prevent javascript: or data: XSS.
 * Used for user- or API-supplied URLs (forecasts, webcams, wavepoolUrl, modelUrl, etc.).
 */
export const safeLinkHref = (
  url: string | null | undefined,
): string | null => {
  if (url == null || typeof url !== 'string') return null
  const trimmed = url.trim()
  if (trimmed.length === 0 || trimmed.length > MAX_SAFE_URL_LENGTH) return null
  try {
    const parsed = new URL(trimmed)
    return ALLOWED_SCHEMES.includes(parsed.protocol) ? trimmed : null
  } catch {
    return null
  }
}

/**
 * Debounce function to control excessive resize events.
 * @param action - function to be performed
 * @param delay - length of time to delay function call
 * @returns debounced function with the same signature as action
 */
export const debounce = <T extends unknown[]>(
  action: (...args: T) => void,
  delay: number,
) => {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: T) => {
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
