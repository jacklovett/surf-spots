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

/** Shown when a request times out (e.g. cold start or slow network). */
export const ERROR_REQUEST_TIMEOUT =
  'Request took too long. Please try again.'

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
export const ERROR_TRIP_NOT_FOUND = 'Trip not found'
export const ERROR_TITLE_REQUIRED = 'Title is required'
export const ERROR_INVALID_MEMBER_EMAILS =
  'Please enter valid email addresses for all members.'
export const ERROR_LOGIN_REQUIRED_CREATE_TRIP =
  'You must be logged in to create trips'

// Surfboards
export const ERROR_DELETE_SURFBOARD = 'Failed to delete surfboard. Please try again.'
export const ERROR_CREATE_SURFBOARD = 'Failed to create surfboard. Please try again.'
export const ERROR_UPDATE_SURFBOARD = 'Failed to update surfboard. Please try again.'
export const ERROR_LOAD_SURFBOARDS = 'Failed to load surfboards.'
export const ERROR_SURFBOARD_NOT_FOUND = 'Surfboard not found'
export const ERROR_LOGIN_REQUIRED_ADD_SURFBOARD =
  'You must be logged in to add surfboards'

// Surf spots
export const ERROR_SAVE_NOTE = 'Failed to save note. Please try again.'
export const ERROR_LOAD_REGION_DATA = 'Failed to load region data. Please try again later.'
export const ERROR_LOAD_CONTINENTS = "We couldn't load the continents. Please try again."
export const ERROR_LOAD_MAP_SPOTS = "We couldn't load the map. Please try again."
export const ERROR_ADD_SURF_SPOT = 'Unable to add surf spot. Please try again later.'
export const ERROR_EDIT_SURF_SPOT = 'Unable to update surf spot. Please try again later.'
export const ERROR_SURF_SPOT_ID_REQUIRED = 'Surf spot ID is required'
export const SUCCESS_SURF_SPOT_ADDED = 'Surf spot added successfully'
export const SUCCESS_NOTE_SAVED = 'Note saved successfully'

// Profile & account
export const ERROR_DELETE_ACCOUNT = 'Unable to delete account. Please try again later.'
export const ERROR_UPDATE_PROFILE = 'Unable to update profile details. Please try again later.'
export const ERROR_POPULATE_LOCATION = 'Unable to populate location drop-down menus'
export const ERROR_AGE_RANGE = 'Age must be between 13 and 120 years'
export const ERROR_INVALID_HEIGHT = 'Please enter a valid height'
export const ERROR_INVALID_WEIGHT = 'Please enter a valid weight'
export const SUCCESS_PROFILE_UPDATED = 'Profile updated successfully'

// Auth
export const ERROR_SIGN_IN = 'Unable to sign in. Please try again.'
export const ERROR_SIGN_UP = 'Unable to sign up. Please try again.'
export const ERROR_RETRIEVE_PROFILE = 'Unable to retrieve your profile. Please try again.'
export const ERROR_OAUTH_SIGN_IN_FAILED = 'Sign in failed. Please try again.'
export const ERROR_FACEBOOK_EMAIL_REQUIRED =
  'Email access is required. Please allow email access in Facebook settings and try again.'
export const ERROR_CREDENTIALS_DONT_MATCH =
  "That email and password didn't match. Try again or use Forgot password."
export const ERROR_ACCOUNT_CANT_SIGN_IN =
  "This account can't sign in. Contact support if you need help."
export const ERROR_NEW_PASSWORDS_DONT_MATCH = 'New passwords do not match!'
export const ERROR_RESET_TOKEN_INVALID_OR_MISSING = 'Invalid or missing token'
export const SUCCESS_PASSWORD_RESET =
  'Password reset successful. Please sign in with your new password.'
export const SUCCESS_PASSWORD_UPDATED =
  'Password updated successfully. Please sign in again for security.'
export const SUCCESS_FORGOT_PASSWORD_EMAIL_SENT =
  'Check your emails. Password reset instructions sent.'

// Settings
export const ERROR_UPDATE_SETTINGS = 'Unable to update settings. Please try again later.'
export const SUCCESS_SETTINGS_UPDATED = 'Settings updated successfully'

// Location
export const ERROR_DETERMINE_REGION =
  'Unable to determine region for this location. Please try entering manually.'

// Generic (validation / HTTP)
export const ERROR_METHOD_NOT_ALLOWED = 'Method not allowed'
export const ERROR_NAME_REQUIRED = 'Name is required'
export const ERROR_VALIDATION_FIX = 'Please fix the errors above'
export const ERROR_LOGIN_REQUIRED = 'You must be logged in'
export const ERROR_USER_NOT_AUTHENTICATED = 'User not authenticated'
export const ERROR_TRIP_AND_SPOT_IDS_REQUIRED =
  'Trip ID and surf spot ID are required'
export const ERROR_TRIP_AND_TRIP_SPOT_IDS_REQUIRED =
  'Trip ID and trip spot ID are required'
export const ERROR_MISSING_REQUIRED_FIELDS = 'Missing required fields'
export const ERROR_INVALID_TRIP_ACTION = 'Invalid trip action'
export const ERROR_INVALID_SURF_SPOT_ID = 'Invalid surf spot ID'

const MAX_DISPLAY_LENGTH = 300
// Patterns that must never be shown to users (technical/implementation details).
const INTERNAL_INDICATORS = [
  ' at ',
  'Exception',
  'Error:',
  'Caused by:',
  'fetch failed',
  'failed to fetch',
  'network request failed',
  'token',
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
