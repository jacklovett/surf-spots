import { describe, expect, it } from 'vitest'

import {
  formatDate,
  formatElapsedStopwatchFromMs,
  formatElapsedStopwatchSinceInstant,
  formatSurfSessionTimeRange,
  formatTimeForDisplay,
} from './dateUtils'

describe('formatDate', () => {
  it('should format date-only strings from calendar parts (TZ-safe)', () => {
    expect(formatDate('2024-12-25')).toBe('25/12/2024')
  })

  it('should format ISO instants with UTC calendar parts', () => {
    expect(formatDate('2024-07-01T00:00:00.000Z')).toBe('01/07/2024')
  })
})

describe('formatElapsedStopwatchFromMs', () => {
  it('should format zero elapsed time as 00:00', () => {
    expect(formatElapsedStopwatchFromMs(0)).toBe('00:00')
  })

  it('should format sub-hour elapsed time as MM:SS', () => {
    expect(formatElapsedStopwatchFromMs(5 * 60_000 + 9_000)).toBe('05:09')
  })

  it('should format hour-or-longer elapsed time as H:MM:SS', () => {
    expect(formatElapsedStopwatchFromMs(3_726_000)).toBe('1:02:06')
  })
})

describe('formatElapsedStopwatchSinceInstant', () => {
  it('should return 00:00 for an invalid instant', () => {
    expect(formatElapsedStopwatchSinceInstant('not-a-date')).toBe('00:00')
  })
})

describe('formatTimeForDisplay', () => {
  it('should strip fractional seconds from API LocalTime strings', () => {
    expect(formatTimeForDisplay('14:32:05.123456')).toBe('14:32')
  })
})

describe('formatSurfSessionTimeRange', () => {
  it('should format live session wall times without fractional seconds', () => {
    expect(
      formatSurfSessionTimeRange({
        sessionStartTime: '09:15:00.654321',
        sessionEndTime: '10:42:30.987654',
        durationMinutes: 87,
      }),
    ).toBe('09:15 - 10:42 · 1 hr 27 min')
  })
})
