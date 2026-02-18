/**
 * Central place for safe, user-facing error messages.
 * Allowlist + fallback is standard: only show messages we know are safe or a
 * context fallback; never raw stack traces or internal text.
 * Backend/API messages are passed through when present and safe; networkService
 * uses DEFAULT_ERROR_MESSAGE only when the response has no usable message.
 */

/** Shown when no safe message is available (e.g. networkService after non-JSON/502). */
export const DEFAULT_ERROR_MESSAGE =
  'An unexpected error occurred. Please try again.'

/** Upload: validation + API messages. Match backend copy where noted. */
export const UPLOAD_ERROR_NO_MEDIA_FILE = 'No media file provided'
export const UPLOAD_ERROR_FILE_SIZE_EXCEEDED =
  'File size exceeds 10MB limit. Please choose a smaller file.'
/** Single upload failure message for API/network/config errors (used as fallback in upload flow). */
export const UPLOAD_ERROR_MEDIA_UNAVAILABLE =
  'Media upload failed. Please try again later.'

const MAX_DISPLAY_LENGTH = 300
const INTERNAL_INDICATORS = [
  ' at ',
  'Exception',
  'Error:',
  'java.',
  'org.springframework',
  'at com.',
  'at org.',
  'Caused by:',
]

/**
 * Turn an unknown thrown value into a safe UI string: if the error message
 * is in the allowlist, use it; otherwise use messageForDisplay (or fallback
 * if not an Error / no message). Use this for any flow (upload, form submit,
 * etc.) where you have a fixed set of allowed messages and a fallback.
 */
export const toSafeMessage = (
  error: unknown,
  allowedMessages: Set<string>,
  fallback: string,
): string => {
  if (!(error instanceof Error) || !error.message?.trim()) {
    return fallback
  }
  const msg = error.message.trim()
  if (msg === DEFAULT_ERROR_MESSAGE) {
    return fallback
  }
  if (allowedMessages.has(msg)) {
    return msg
  }
  return messageForDisplay(msg, fallback)
}

/**
 * Use the given message in the UI only if it looks user-facing; otherwise
 * return fallback. Call this before showing any error that might come from
 * the API or a caught exception (toasts, action data, etc.).
 */
export const messageForDisplay = (
  message: string | undefined | null,
  fallback: string,
): string => {
  if (message == null || typeof message !== 'string') {
    return fallback
  }
  const trimmed = message.trim()
  if (trimmed.length === 0 || trimmed.length > MAX_DISPLAY_LENGTH) {
    return fallback
  }
  const lower = trimmed.toLowerCase()
  if (INTERNAL_INDICATORS.some((ind) => lower.includes(ind.toLowerCase()))) {
    return fallback
  }
  return trimmed
}
