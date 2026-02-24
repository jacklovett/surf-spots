/**
 * Central place for safe, user-facing error messages and fallbacks.
 * Strategy: API errors are sanitized in networkService (handleResponse) and
 * thrown as NetworkError. In routes/actions use getDisplayMessage(error) or getDisplayMessage(error, fallback) — fallback defaults to DEFAULT_ERROR_MESSAGE
 * from networkService so API messages are shown as-is and other errors are
 * sanitized once. Do not call messageForDisplay again on errors that came from
 * our API (use getDisplayMessage instead).
 */

/** Shown when no safe message is available (e.g. networkService after non-JSON/502). */
export const DEFAULT_ERROR_MESSAGE =
  'An unexpected error occurred. Please try again.'

/** Generic fallback when we don't know the cause (e.g. fetcher/action with no status). */
export const ERROR_SOMETHING_WENT_WRONG =
  'Something went wrong. Please try again.'

/** Shown for 4xx when the API did not return a specific message (suggests user can fix something). */
export const ERROR_CHECK_INPUT =
  'Something went wrong. Check the details and try again.'

/** Shown for 5xx or network failure when the API did not return a specific message. */
export const ERROR_OUR_PROBLEM =
  'Something went wrong. Please try again later.'

/** Upload: validation + API messages. Match backend ApiErrors where noted. */
export const UPLOAD_ERROR_NO_MEDIA_FILE = 'No media file provided'
export const UPLOAD_ERROR_FILE_SIZE_EXCEEDED =
  'File size exceeds 500 MB limit. Please choose a smaller file or compress it.'
/** Fallback for API/network/storage errors (user-facing only; dev details stay in logs). */
export const UPLOAD_ERROR_MEDIA_UNAVAILABLE =
  'Media upload failed. Please try again later.'

// Trips
export const ERROR_DELETE_TRIP = 'Failed to delete trip. Please try again.'
export const ERROR_CREATE_TRIP = 'Failed to create trip. Please try again.'
export const ERROR_UPDATE_TRIP = 'Failed to update trip. Please try again.'
export const ERROR_ADD_MEMBERS = 'Failed to add members.'
export const ERROR_ADD_SURFBOARD_TO_TRIP = 'Failed to add surfboard. Please try again.'
export const ERROR_REMOVE_SURFBOARD_FROM_TRIP = 'Failed to remove surfboard. Please try again.'
export const ERROR_REMOVE_SPOT_FROM_TRIP = 'Failed to remove spot. Please try again.'
export const ERROR_REMOVE_MEMBER = 'Failed to remove member. Please try again.'
export const ERROR_CANCEL_INVITATION = 'Failed to cancel invitation. Please try again.'
export const ERROR_DELETE_MEDIA = 'Failed to delete media. Please try again.'
export const ERROR_LOAD_TRIPS = 'Failed to load trips.'

// Surfboards
export const ERROR_DELETE_SURFBOARD = 'Failed to delete surfboard. Please try again.'
export const ERROR_CREATE_SURFBOARD = 'Failed to create surfboard. Please try again.'
export const ERROR_UPDATE_SURFBOARD = 'Failed to update surfboard. Please try again.'
export const ERROR_LOAD_SURFBOARDS = 'Failed to load surfboards.'

// Surf spots
export const ERROR_SAVE_NOTE = 'Failed to save note. Please try again.'
export const ERROR_LOAD_REGION_DATA = 'Failed to load region data. Please try again later.'
export const ERROR_ADD_SURF_SPOT = 'Unable to add surf spot. Please try again later.'
export const ERROR_EDIT_SURF_SPOT = 'Unable to update surf spot. Please try again later.'

// Profile & account
export const ERROR_DELETE_ACCOUNT = 'Unable to delete account. Please try again later.'
export const ERROR_UPDATE_PROFILE = 'Unable to update profile details. Please try again later.'
export const ERROR_POPULATE_LOCATION = 'Unable to populate location drop-down menus'

// Auth
export const ERROR_SIGN_IN = 'Unable to sign in. Please try again.'
export const ERROR_RETRIEVE_PROFILE = 'Unable to retrieve your profile. Please try again.'

// Settings
export const ERROR_UPDATE_SETTINGS = 'Unable to update settings. Please try again later.'

// Location
export const ERROR_DETERMINE_REGION =
  'Unable to determine region for this location. Please try entering manually.'

const MAX_DISPLAY_LENGTH = 300
// Generic patterns that suggest stack traces or internal errors (backend-agnostic).
const INTERNAL_INDICATORS = [' at ', 'Exception', 'Error:', 'Caused by:']

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
 * Returns a safe user-facing error string from fetcher/action data.
 * Reads `error` or `submitStatus` when present and string; otherwise fallback.
 * Use before setting state or calling showError/onError to avoid displaying raw payloads.
 */
export const getSafeFetcherErrorMessage = (
  data: unknown,
  fallback: string = DEFAULT_ERROR_MESSAGE,
): string => {
  if (data == null || typeof data !== 'object') return fallback
  const o = data as Record<string, unknown>
  const msg =
    (typeof o.error === 'string' && o.error.trim() ? o.error.trim() : null) ??
    (typeof o.submitStatus === 'string' && o.submitStatus.trim() ? o.submitStatus.trim() : null)
  return messageForDisplay(msg ?? undefined, fallback)
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
