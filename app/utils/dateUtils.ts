/**
 * Format a date string to a consistent display format
 * This ensures server and client render the same output
 * Format: "DD/MM/YYYY" (e.g., "25/12/2024")
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Format a local calendar date for date inputs ("YYYY-MM-DD").
 */
export const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export type SurfSessionTimingFields = {
  durationMinutes?: number | null
  sessionStartTime?: string | null
  sessionEndTime?: string | null
}

const formatDurationMinutesLabel = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const min = minutes % 60
  if (min === 0) {
    return `${hours} hr`
  }
  return `${hours} hr ${min} min`
}

/** Parses HH:mm or HH:mm:ss to minutes since midnight (time inputs, API strings). */
export const parseLocalTimeToMinutes = (value: string): number | null => {
  const trimmed = value.trim()
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(trimmed)
  if (!match) {
    return null
  }
  const hours = Number.parseInt(match[1], 10)
  const minutes = Number.parseInt(match[2], 10)
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null
  }
  return hours * 60 + minutes
}

/**
 * 24-hour display for HH:mm / HH:mm:ss wall-clock values (same shape as stored HH:mm).
 * Non-parseable input is returned unchanged.
 */
export const formatTimeForDisplay = (value: string): string => {
  const trimmed = value.trim()
  if (!trimmed) return ''
  const canonical = timeToHHmm(trimmed)
  return canonical !== '' ? canonical : trimmed
}

/** Canonical HH:mm for editing (from stored wall-clock string). */
export const timeToHHmm = (value: string): string => {
  const mins = parseLocalTimeToMinutes(value.trim())
  if (mins == null) return ''
  const hours = Math.floor(mins / 60)
  const minutes = mins % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

/** Four numeric chars HHMM from a wall-clock HH:mm string (masked TimeInput buffer). */
export const timeToFourDigitBuffer = (value: string): string => {
  const minutes = parseLocalTimeToMinutes(value.trim())
  if (minutes == null) return ''
  const hours = Math.floor(minutes / 60)
  const minutesValue = minutes % 60
  return `${String(hours).padStart(2, '0')}${String(minutesValue).padStart(2, '0')}`
}

/** HHMM stack length for masked 24h time entry (fixed-width digit buffer). */
export const TIME_DIGIT_BUFFER_LEN = 4

/** Raw input to digit-only buffer, capped (same role as stripping decimals in money fields). */
export const takeTimeDigits = (raw: string): string =>
  raw.replace(/\D/g, '').slice(0, TIME_DIGIT_BUFFER_LEN)

/**
 * Four typed digits as HH:mm text (always length 5 when digits length is 4).
 * May be invalid clock times (e.g. 99:99); validate with parseLocalTimeToMinutes.
 */
export const hhMmStringFromFourDigits = (digits: string): string => {
  const d = takeTimeDigits(digits)
  if (d.length !== TIME_DIGIT_BUFFER_LEN) return ''
  return `${d.slice(0, 2)}:${d.slice(2, 4)}`
}

/**
 * Four digits to canonical HH:mm, or '' when incomplete or not a valid clock time.
 */
export const hhMmFromTimeDigitsOrEmpty = (digits: string): string => {
  const raw = hhMmStringFromFourDigits(digits)
  if (!raw) return ''
  return parseLocalTimeToMinutes(raw) != null ? raw : ''
}

/**
 * One backspace on the HHMM stack: if fewer than four digits, drop the last digit.
 * If four digits form a valid clock, zero the rightmost non-zero digit (12:34→12:30→12:00→10:00→00:00).
 * If the stack is 0000, clear entirely. If four digits are invalid clock, drop the last digit.
 */
export const stepBackTimeDigitBuffer = (digits: string): string => {
  const d = takeTimeDigits(digits)
  if (d.length === 0) return ''
  if (d.length < TIME_DIGIT_BUFFER_LEN) {
    return d.slice(0, -1)
  }
  if (d === '0000') {
    return ''
  }
  const wall = hhMmStringFromFourDigits(d)
  if (parseLocalTimeToMinutes(wall) == null) {
    return d.slice(0, -1)
  }
  const chars = [...d]
  for (let i = TIME_DIGIT_BUFFER_LEN - 1; i >= 0; i--) {
    if (chars[i] !== '0') {
      chars[i] = '0'
      return chars.join('')
    }
  }
  return '0000'
}

/** HH:mm (valid or not) to HHMM buffer for masked editing; uses canonical parsing when valid. */
export const timeOrInvalidToFourDigitBuffer = (value: string): string => {
  const trimmed = value.trim()
  if (!trimmed) return ''
  const canonical = timeToFourDigitBuffer(trimmed)
  if (canonical !== '') return canonical
  const m = /^(\d{1,2}):(\d{2})$/.exec(trimmed)
  if (!m) return ''
  const hh = m[1].padStart(2, '0').slice(-2)
  const mm = m[2].padStart(2, '0').slice(-2)
  return `${hh}${mm}`
}

/**
 * Progressive HH:MM while typing. Unknown digit slots use `-` so the field never shows a lone
 * partial segment (e.g. `1:`); shape is always `--:--` with digits filled left to right.
 * Typed digits pass through `takeTimeDigits` unchanged (no injected hour tens).
 */
export const formatTimeDigitMask = (digits: string): string => {
  const d = takeTimeDigits(digits)
  if (d.length === 0) return ''
  if (d.length === 1) return `${d[0]}-:--`
  if (d.length === 2) return `${d[0]}${d[1]}:--`
  if (d.length === 3) return `${d[0]}${d[1]}:${d[2]}-`
  return `${d[0]}${d[1]}:${d[2]}${d[3]}`
}

const clampPickerHour = (n: number): number =>
  Number.isFinite(n) ? Math.min(23, Math.max(0, Math.trunc(n))) : 12

const clampPickerMinute = (n: number): number =>
  Number.isFinite(n) ? Math.min(59, Math.max(0, Math.trunc(n))) : 0

/**
 * Hour/minute list indices for picker highlighting while typing HHMM (scroll targets).
 */
export const pickerListHourMinuteFromDigits = (
  digits: string,
): { hour: number; minute: number } => {
  const d = takeTimeDigits(digits)
  if (d.length === 0) {
    return { hour: 12, minute: 0 }
  }
  let hour: number
  if (d.length === 1) {
    hour = clampPickerHour(Number.parseInt(`${d[0]}0`, 10))
  } else {
    hour = clampPickerHour(Number.parseInt(d.slice(0, 2), 10))
  }
  let minute = 0
  if (d.length >= 4) {
    minute = clampPickerMinute(Number.parseInt(d.slice(2, 4), 10))
  } else if (d.length === 3) {
    minute = clampPickerMinute(Number.parseInt(`${d[2]}0`, 10))
  }
  return { hour, minute }
}

/**
 * Parse typed time: 24h H:mm / HH:mm (optional seconds stripped), or 12h with am/pm.
 * Returns '' if cleared, HH:mm if valid, null if invalid.
 */
export const parseTypedTimeValue = (raw: string): '' | string | null => {
  const t = raw.trim()
  if (!t) return ''

  const as24 = parseLocalTimeToMinutes(t)
  if (as24 != null) {
    const h = Math.floor(as24 / 60)
    const m = as24 % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }

  const normalized = t.replace(/\s+/g, ' ')
  const ampm = /^(\d{1,2}):(\d{2})\s*(am|pm)$/i.exec(normalized)
  if (ampm) {
    let hour = Number.parseInt(ampm[1], 10)
    const minute = Number.parseInt(ampm[2], 10)
    const mer = ampm[3].toLowerCase()
    if (minute < 0 || minute > 59 || hour < 1 || hour > 12) {
      return null
    }
    if (mer === 'pm' && hour !== 12) {
      hour += 12
    }
    if (mer === 'am' && hour === 12) {
      hour = 0
    }
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  }

  return null
}

/**
 * Compact duration for inline hints (e.g. 45m, 2h, 4h 35m).
 */
export const formatDurationCompact = (totalMinutes: number): string => {
  if (totalMinutes < 1) {
    return ''
  }
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h === 0) {
    return `${m}m`
  }
  if (m === 0) {
    return `${h}h`
  }
  return `${h}h ${m}m`
}

/**
 * Minutes between two same-calendar-day wall times; null if missing, invalid, or end not after start.
 */
export const sessionWindowMinutesFromTimeInputs = (
  start: string,
  end: string,
): number | null => {
  const a = parseLocalTimeToMinutes(start)
  const b = parseLocalTimeToMinutes(end)
  if (a == null || b == null) {
    return null
  }
  const span = b - a
  if (span <= 0) {
    return null
  }
  return span
}

/**
 * Single-line label for a session's wall-clock start and end (24h), with optional duration
 * after a middle dot when the same-day window or stored duration_minutes yields a span.
 * Returns null when either wall time is missing (caller shows SESSION_LIST_EMPTY_VALUE).
 */
export const formatSurfSessionTimeRange = (
  session: SurfSessionTimingFields,
): string | null => {
  const startRaw =
    typeof session.sessionStartTime === 'string' ? session.sessionStartTime.trim() : ''
  const endRaw =
    typeof session.sessionEndTime === 'string' ? session.sessionEndTime.trim() : ''
  if (!startRaw || !endRaw) {
    return null
  }
  const startLabel = formatTimeForDisplay(startRaw)
  const endLabel = formatTimeForDisplay(endRaw)
  const hhStart = timeToHHmm(startRaw)
  const hhEnd = timeToHHmm(endRaw)
  const windowMins = sessionWindowMinutesFromTimeInputs(hhStart, hhEnd)
  let durationLabel: string | null = null
  if (windowMins != null && windowMins > 0) {
    durationLabel = formatDurationMinutesLabel(windowMins)
  } else if (
    session.durationMinutes != null &&
    typeof session.durationMinutes === 'number' &&
    session.durationMinutes > 0
  ) {
    durationLabel = formatDurationMinutesLabel(session.durationMinutes)
  }
  if (durationLabel) {
    return `${startLabel} – ${endLabel} · ${durationLabel}`
  }
  return `${startLabel} – ${endLabel}`
}

/**
 * Format a date as a relative time string (e.g., "5 minutes ago", "2 hours ago").
 * @param createdAt - ISO date string or undefined
 * @returns Relative label, or empty string when missing or not parseable
 */
export const formatTimeAgo = (createdAt?: string): string => {
  if (!createdAt || typeof createdAt !== 'string' || createdAt.trim() === '') {
    return ''
  }

  const now = new Date()
  const created = new Date(createdAt)
  if (Number.isNaN(created.getTime())) {
    return ''
  }

  const diffMs = now.getTime() - created.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`
}

const parseIsoDateOnly = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/** Formats an inclusive ISO date range for notification feeds (e.g. "1 Feb – 15 Feb 2026"). */
export const formatDateRange = (startDate: string, endDate: string): string => {
  const start = parseIsoDateOnly(startDate)
  const end = parseIsoDateOnly(endDate)
  const sameYear = start.getFullYear() === end.getFullYear()

  const startLabel = start.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  })
  const endLabel = end.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return `${startLabel} – ${endLabel}`
}