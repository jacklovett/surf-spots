/**
 * When we show API or server errors in the UI (toasts, forms), we must never
 * display internal details: stack traces, exception class names, file paths,
 * or raw exception messages that could leak implementation info.
 *
 * This module filters error text before display: if the message looks
 * internal or is missing, we show a generic fallback instead.
 */

/** Default message shown when no safe error message is available. */
export const DEFAULT_ERROR_MESSAGE =
  'An unexpected error occurred. Please try again.'

/** Upload-specific messages (validation + API fallback). Must match API copy where noted. */
export const UPLOAD_ERROR_GENERIC = 'Unable to upload. Please try again later.'
export const UPLOAD_ERROR_NO_MEDIA_FILE = 'No media file provided'
export const UPLOAD_ERROR_FILE_SIZE_EXCEEDED =
  'File size exceeds 10MB limit. Please choose a smaller file.'
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
