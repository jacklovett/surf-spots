import {
  SESSION_TIMING_END_BEFORE_START,
  SESSION_TIMING_END_REQUIRES_START,
  SESSION_TIMING_INVALID_END_TIME,
  SESSION_TIMING_INVALID_START_TIME,
  SESSION_TIMING_WINDOW_TOO_LONG,
} from '~/utils/errorUtils'
import { parseLocalTimeToMinutes } from '~/utils/dateUtils'

/**
 * Validates optional session start/end wall times (same rules as the API).
 * Returns null when valid or when both empty.
 */
export const validateSurfSessionTimeWindow = (
  sessionStartTime: string,
  sessionEndTime: string,
): string | null => {
  const start = sessionStartTime.trim()
  const end = sessionEndTime.trim()
  if (!start && !end) {
    return null
  }
  if (end && !start) {
    return SESSION_TIMING_END_REQUIRES_START
  }
  if (start && parseLocalTimeToMinutes(start) == null) {
    return SESSION_TIMING_INVALID_START_TIME
  }
  if (end && parseLocalTimeToMinutes(end) == null) {
    return SESSION_TIMING_INVALID_END_TIME
  }
  if (!end) {
    return null
  }
  const startMin = parseLocalTimeToMinutes(start)!
  const endMin = parseLocalTimeToMinutes(end)!
  if (endMin <= startMin) {
    return SESSION_TIMING_END_BEFORE_START
  }
  if (endMin - startMin > 24 * 60) {
    return SESSION_TIMING_WINDOW_TOO_LONG
  }
  return null
}

export const isSurfSessionTimingBannerMessage = (message: string): boolean => {
  const messageTrimmed = message.trim()
  return (
    messageTrimmed === SESSION_TIMING_END_REQUIRES_START ||
    messageTrimmed === SESSION_TIMING_END_BEFORE_START ||
    messageTrimmed === SESSION_TIMING_WINDOW_TOO_LONG ||
    messageTrimmed === SESSION_TIMING_INVALID_START_TIME ||
    messageTrimmed === SESSION_TIMING_INVALID_END_TIME
  )
}
