/**
 * Common utility functions used across the application
 */

/** Max length for URLs passed to safeLinkHref; shared with surf spot validation. */
export const MAX_SAFE_URL_LENGTH = 2048

const ALLOWED_SCHEMES = ['https:', 'http:']
const HAS_SCHEME_REGEX = /^[a-zA-Z][a-zA-Z\d+\-.]*:/

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
  return parseAllowedHttpUrl(trimmed) != null ? trimmed : null
}

const parseAllowedHttpUrl = (value: string): URL | null => {
  try {
    const parsed = new URL(value)
    return ALLOWED_SCHEMES.includes(parsed.protocol) ? parsed : null
  } catch {
    return null
  }
}

/**
 * Normalizes user-entered URLs in a "typical app" way:
 * - trims whitespace
 * - adds https:// when no scheme is present
 * - lowercases protocol and host (path/query/hash are preserved as-is)
 */
export const normalizeUserUrl = (value: string): string => {
  const trimmed = value.trim()
  if (trimmed === '') return ''

  const hasScheme = HAS_SCHEME_REGEX.test(trimmed)
  const candidate = hasScheme ? trimmed : `https://${trimmed}`

  const parsed = parseAllowedHttpUrl(candidate)
  if (!parsed) {
    return trimmed
  }

  const lowerProtocol = parsed.protocol.toLowerCase()
  const lowerHost = parsed.host.toLowerCase()
  return `${lowerProtocol}//${lowerHost}${parsed.pathname}${parsed.search}${parsed.hash}`
}

export const isValidHttpUrl = (value: string): boolean => {
  if (!value) return true
  const normalized = normalizeUserUrl(value)
  return parseAllowedHttpUrl(normalized) != null
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
